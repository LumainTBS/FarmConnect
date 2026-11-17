-- =============================================================================
-- FARM CONNECT ESWATINI — FIX REVIEWS SCHEMA AND RELOAD POSTGREST CACHE
-- =============================================================================
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
--
-- This script fixes:
-- 1. "Could not find the 'reviewer_name' column of 'reviews' in the schema cache"
-- 2. Ensures all required reviews and profile columns exist
-- 3. Backfills reviewer display names from public.users for any existing reviews
-- 4. Ensures strict Row-Level Security (RLS) on public.reviews and public.users
-- 5. Forcefully reloads the PostgREST schema cache
-- =============================================================================

-- 1. Add missing columns to public.reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_avatar TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS listing_id TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Add missing columns to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;

-- 3. Backfill reviewer_name for any reviews where it is missing
UPDATE public.reviews r
SET 
  reviewer_name = COALESCE(r.reviewer_name, u.full_name, 'Verified Buyer'),
  reviewer_avatar = COALESCE(r.reviewer_avatar, u.profile_picture_url)
FROM public.users u
WHERE r.reviewer_id = u.id AND r.reviewer_name IS NULL;

-- 4. Enable and update RLS policies on public.reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
  CREATE POLICY "Reviews are viewable by everyone" 
    ON public.reviews FOR SELECT 
    USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

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

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
  CREATE POLICY "Users can update own reviews" 
    ON public.reviews FOR UPDATE 
    USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users or admins can delete reviews" ON public.reviews;
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

-- 5. Enable and update RLS policies on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
  CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.users FOR SELECT 
    USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile only" ON public.users;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
  CREATE POLICY "Users can update own profile only" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 6. CRUCIAL: Reload PostgREST schema cache so PostgREST immediately discovers the new column
NOTIFY pgrst, 'reload schema';
