-- FarmConnect Eswatini - Farmer Permissions, Profile Management, Reviews, and Onboarding Migration

-- 1. Ensure public.users has about, bio, and cover_image_url
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 2. Ensure public.reviews table exists with full schema
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

-- Ensure reviewer_avatar and updated_at columns exist
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_avatar TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Review Security Policies
-- Anyone can read reviews
DO $$ BEGIN
  DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
  CREATE POLICY "Reviews are viewable by everyone" 
    ON public.reviews FOR SELECT USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Authenticated users can insert reviews, but cannot review themselves
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
  CREATE POLICY "Authenticated users can insert reviews" 
    ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != farmer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Users can update their own reviews
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
  CREATE POLICY "Users can update own reviews" 
    ON public.reviews FOR UPDATE 
    USING (auth.uid() = reviewer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Admins can delete reviews if inappropriate
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete inappropriate reviews" ON public.reviews;
  CREATE POLICY "Admins can delete inappropriate reviews" 
    ON public.reviews FOR DELETE 
    USING (
      auth.jwt() ->> 'email' IN ('menzimalumane@gmail.com', 'farmconnectsz@gmail.com')
      OR auth.uid() = reviewer_id
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
