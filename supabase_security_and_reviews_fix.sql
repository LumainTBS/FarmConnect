-- =============================================================================
-- FARM CONNECT ESWATINI — SECURITY, PROFILE & REVIEWS FIX MIGRATION
-- Version: 2026-11-17
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================
-- This migration:
--   1. Ensures public.users has about, bio, cover_image_url columns
--   2. Tightens RLS on public.users (profile ownership)
--   3. Ensures public.reviews has all required columns + reviewer_avatar
--   4. Applies strict RLS on public.reviews (persist + ownership)
--   5. Adds UPDATE/DELETE policies for reviews (reviewer owns their review)
--   6. Tightens public.listings RLS (farmer_id ownership)
--   7. Prevents role elevation through the update path
-- =============================================================================


-- =============================================================================
-- 1. PUBLIC.USERS — Ensure all profile columns exist
-- =============================================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS goods_sold INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS (safe to call even if already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can view farmer profiles (needed for marketplace / directory)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
  CREATE POLICY "Public profiles are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Strict ownership UPDATE: a user can ONLY update their own profile row
-- The WITH CHECK prevents them from changing the `id` to impersonate another user
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile only" ON public.users;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
  CREATE POLICY "Users can update own profile only"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- INSERT: a new authenticated user can only insert a row for themselves
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own profile only" ON public.users;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
  CREATE POLICY "Users can insert own profile only"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- DELETE: users cannot delete profiles (only admins can via service role)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users cannot delete profiles" ON public.users;
  CREATE POLICY "Users cannot delete profiles"
    ON public.users FOR DELETE
    USING (false);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;


-- =============================================================================
-- 2. PUBLIC.LISTINGS — Tighten ownership (farmer_id = auth.uid())
-- =============================================================================

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Public read
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public listings are viewable by everyone" ON public.listings;
  CREATE POLICY "Public listings are viewable by everyone"
    ON public.listings FOR SELECT
    USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Farmers can only INSERT listings where farmer_id matches their own auth UID
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can insert own listings" ON public.listings;
  CREATE POLICY "Farmers can insert own listings"
    ON public.listings FOR INSERT
    WITH CHECK (auth.uid() = farmer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Farmers can only UPDATE their own listings (stock quantity updates by buyers
-- happen via service role or postgres function in production)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can update own listings" ON public.listings;
  CREATE POLICY "Farmers can update own listings"
    ON public.listings FOR UPDATE
    USING (auth.uid() = farmer_id)
    WITH CHECK (auth.uid() = farmer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Only the owner farmer can delete their listing
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can delete own listings" ON public.listings;
  CREATE POLICY "Farmers can delete own listings"
    ON public.listings FOR DELETE
    USING (auth.uid() = farmer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;


-- =============================================================================
-- 3. PUBLIC.REVIEWS — Full schema + strict RLS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id TEXT,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  reviewer_avatar TEXT,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist on pre-existing reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_avatar TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS listing_id TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read public reviews
DO $$ BEGIN
  DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
  CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Authenticated users can submit a review IF:
--   - reviewer_id matches their own auth.uid() (cannot impersonate another buyer)
--   - farmer_id != auth.uid() (cannot review yourself)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Authenticated buyers can insert reviews" ON public.reviews;
  CREATE POLICY "Authenticated users can insert reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (
      auth.uid() = reviewer_id
      AND auth.uid() != farmer_id
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Reviewers can only update their own review
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
  CREATE POLICY "Users can update own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Reviewers can delete their own reviews; admins can delete any review
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete inappropriate reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
  CREATE POLICY "Users or admins can delete reviews"
    ON public.reviews FOR DELETE
    USING (
      auth.uid() = reviewer_id
      OR auth.jwt() ->> 'email' IN ('menzimalumane@gmail.com', 'farmconnectsz@gmail.com')
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;


-- =============================================================================
-- 4. OPTIONAL: Prevent role column from being elevated to 'admin' via UPDATE
--    (Belt-and-suspenders; the application-layer also strips this)
-- =============================================================================

-- Function that blocks unauthorized admin role elevation
CREATE OR REPLACE FUNCTION public.prevent_admin_role_elevation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the caller is not one of the two authorized admin emails, block 'admin' role elevation
  IF NEW.role = 'admin' AND auth.jwt() ->> 'email' NOT IN (
    'menzimalumane@gmail.com',
    'farmconnectsz@gmail.com',
    'farmconnect.sz@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Access denied: administrator role elevation is not permitted.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_admin_elevation ON public.users;
CREATE TRIGGER prevent_admin_elevation
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_role_elevation();


-- =============================================================================
-- 5. Auto-updated timestamp trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_listings_updated_at ON public.listings;
CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- ✅ Migration complete.
-- Apply this in: Supabase Dashboard > SQL Editor > New Query > Run All
-- =============================================================================
