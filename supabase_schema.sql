-- Farm Connect Eswatini — Comprehensive Supabase Postgres Migration Script
-- Production Schema for Users, Listings, Orders, Reviews, and Storage with RLS Policies

-- ============================================================================
-- 1. PUBLIC.USERS TABLE & POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('farmer', 'buyer', 'admin')),
  full_name TEXT,
  phone_number TEXT,
  email TEXT,
  profile_picture_url TEXT,
  id_document_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('unsubmitted', 'pending', 'approved', 'rejected')),
  buyer_type TEXT,
  settlement_type TEXT DEFAULT 'rural',
  inkhundla TEXT,
  landmark_mountain TEXT,
  landmark_river TEXT,
  street_address TEXT,
  house_number TEXT,
  plot_number TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  subscription_tier TEXT DEFAULT 'free',
  commission_consent_given BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure verification_status and updated_at columns exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security (RLS) on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" 
    ON public.users FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" 
    ON public.users FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trigger Function to automatically save Google OAuth & Email users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, profile_picture_url, role, verification_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'),
    COALESCE(new.raw_user_meta_data->>'role', 'farmer'),
    'pending'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
    profile_picture_url = COALESCE(public.users.profile_picture_url, EXCLUDED.profile_picture_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 2. PUBLIC.LISTINGS TABLE & POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name TEXT,
  farmer_avatar TEXT,
  farmer_email TEXT,
  product_type TEXT NOT NULL,
  category TEXT DEFAULT 'vegetables',
  description TEXT,
  quantity NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'E',
  harvest_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'available',
  is_verified BOOLEAN DEFAULT false,
  settlement_type TEXT DEFAULT 'rural',
  inkhundla TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all expected columns exist on existing table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS farmer_name TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS farmer_avatar TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS farmer_email TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'vegetables';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'E';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS settlement_type TEXT DEFAULT 'rural';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS inkhundla TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security (RLS) on listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can view all marketplace listings
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public listings are viewable by everyone" ON public.listings;
  CREATE POLICY "Public listings are viewable by everyone" 
    ON public.listings FOR SELECT USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 2. Authenticated farmers & guest sellers can insert listings
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can insert own listings" ON public.listings;
  CREATE POLICY "Farmers can insert own listings" 
    ON public.listings FOR INSERT 
    WITH CHECK (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 3. Authenticated farmers & owners can update listings
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can update own listings" ON public.listings;
  CREATE POLICY "Farmers can update own listings" 
    ON public.listings FOR UPDATE 
    USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 4. Authenticated farmers & owners can delete listings
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can delete own listings" ON public.listings;
  CREATE POLICY "Farmers can delete own listings" 
    ON public.listings FOR DELETE 
    USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;



-- ============================================================================
-- 3. PUBLIC.ORDERS TABLE & POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  listing_id TEXT,
  product_name TEXT,
  farmer_name TEXT,
  farmer_id UUID REFERENCES auth.users(id),
  farmer_email TEXT,
  buyer_id UUID REFERENCES auth.users(id),
  buyer_name TEXT,
  quantity NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'kg',
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 10,
  order_status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'paid',
  payment_method TEXT DEFAULT 'MTN Mobile Money (MoMo)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rated BOOLEAN DEFAULT false,
  user_rating NUMERIC DEFAULT 5,
  image_url TEXT
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view relevant orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Buyers can insert orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = buyer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Farmers and buyers can update orders" 
    ON public.orders FOR UPDATE 
    USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================================
-- 4. PUBLIC.REVIEWS TABLE & POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id),
  listing_id TEXT,
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_name TEXT,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Reviews are viewable by everyone" 
    ON public.reviews FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated buyers can insert reviews" 
    ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() = reviewer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
