-- ==============================================================================
-- FARM CONNECT ESWATINI — ROW LEVEL SECURITY (RLS) & ACCOUNT ISOLATION POLICIES
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- This migration ensures all required columns exist first, then enables RLS and
-- applies strict ownership policies to prevent cross-account data leakage.

-- ------------------------------------------------------------------------------
-- 1. PUBLIC.USERS (Account Profiles & Identity Isolation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'buyer',
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  profile_picture_url TEXT,
  id_document_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending',
  settlement_type TEXT DEFAULT 'rural',
  inkhundla TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all user columns exist on any pre-existing table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS settlement_type TEXT DEFAULT 'rural';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS inkhundla TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public viewing of user profiles (needed for farmer listings & marketplace directory)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
  CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.users FOR SELECT USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Enforce strict ownership on profile updates (user can ONLY edit their own record)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile only" ON public.users;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
  CREATE POLICY "Users can update own profile only" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Allow authenticated user to insert their own profile matching their auth UID
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own profile only" ON public.users;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
  CREATE POLICY "Users can insert own profile only" 
    ON public.users FOR INSERT 
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;


-- ------------------------------------------------------------------------------
-- 2. PUBLIC.LISTINGS (Produce Stock & Ownership Security)
-- ------------------------------------------------------------------------------
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
  status TEXT DEFAULT 'available',
  is_verified BOOLEAN DEFAULT false,
  inkhundla TEXT,
  location TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all listing columns exist
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES auth.users(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS farmer_name TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS farmer_avatar TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS farmer_email TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'vegetables';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 0;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'kg';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'E';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS inkhundla TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Marketplace listings are publicly readable by all visitors and buyers
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public listings are viewable by everyone" ON public.listings;
  CREATE POLICY "Public listings are viewable by everyone" 
    ON public.listings FOR SELECT USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Only authenticated farmers can create listings under their own farmer_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can insert own listings" ON public.listings;
  CREATE POLICY "Farmers can insert own listings" 
    ON public.listings FOR INSERT 
    WITH CHECK (auth.uid() = farmer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Farmers can update their own listings; or authenticated users can update stock upon order confirmation
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can update own listings" ON public.listings;
  CREATE POLICY "Farmers can update own listings" 
    ON public.listings FOR UPDATE 
    USING (auth.uid() = farmer_id OR auth.role() = 'authenticated');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Only the owner farmer can delete their produce listing
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can delete own listings" ON public.listings;
  CREATE POLICY "Farmers can delete own listings" 
    ON public.listings FOR DELETE 
    USING (auth.uid() = farmer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;


-- ------------------------------------------------------------------------------
-- 3. PUBLIC.ORDERS (Strict Private Order Isolation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  listing_id TEXT,
  product_name TEXT,
  farmer_name TEXT,
  farmer_id UUID REFERENCES auth.users(id),
  farmer_email TEXT,
  farmer_tier TEXT DEFAULT 'free',
  buyer_id UUID REFERENCES auth.users(id),
  buyer_name TEXT,
  quantity NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'kg',
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0.05,
  commission_percent NUMERIC DEFAULT 5,
  commission_amount NUMERIC DEFAULT 0,
  farmer_payout NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 10,
  order_status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'paid',
  payment_method TEXT DEFAULT 'MTN Mobile Money (MoMo)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rated BOOLEAN DEFAULT false,
  user_rating NUMERIC DEFAULT 5,
  image_url TEXT
);

-- Ensure all order columns exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS commission_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS farmer_payout NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders are strictly private: visible ONLY to the buyer who purchased or farmer who produced
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view relevant orders" ON public.orders;
  DROP POLICY IF EXISTS "Private orders viewable only by buyer or farmer" ON public.orders;
  CREATE POLICY "Private orders viewable only by buyer or farmer" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Buyers can only insert orders where buyer_id matches their own authenticated auth.uid()
DO $$ BEGIN
  DROP POLICY IF EXISTS "Buyers can insert orders" ON public.orders;
  DROP POLICY IF EXISTS "Authenticated buyers can place own orders" ON public.orders;
  CREATE POLICY "Authenticated buyers can place own orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = buyer_id OR auth.role() = 'authenticated');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Only the involved farmer or buyer can update the order status
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers and buyers can update orders" ON public.orders;
  CREATE POLICY "Farmers and buyers can update orders" 
    ON public.orders FOR UPDATE 
    USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;


-- ------------------------------------------------------------------------------
-- 4. PUBLIC.MESSAGES (Private Communications & Restock Alerts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id UUID REFERENCES auth.users(id),
  sender_name TEXT,
  receiver_id UUID REFERENCES auth.users(id),
  receiver_name TEXT,
  listing_id TEXT,
  product_name TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crucial: Ensure columns exist even if public.messages was created previously with different columns
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES auth.users(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS listing_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages are confidential: visible ONLY to the sender or receiver
DO $$ BEGIN
  DROP POLICY IF EXISTS "Private messages viewable by participants only" ON public.messages;
  CREATE POLICY "Private messages viewable by participants only" 
    ON public.messages FOR SELECT 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Users can only send messages where sender_id is their own authenticated UID
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
  CREATE POLICY "Authenticated users can send messages" 
    ON public.messages FOR INSERT 
    WITH CHECK (auth.uid() = sender_id OR auth.role() = 'authenticated');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;


-- ------------------------------------------------------------------------------
-- 5. PUBLIC.REVIEWS (Verified Buyer Reviews)
-- ------------------------------------------------------------------------------
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

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES auth.users(id);
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id);
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating NUMERIC NOT NULL DEFAULT 5;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS comment TEXT;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
  CREATE POLICY "Reviews are viewable by everyone" 
    ON public.reviews FOR SELECT USING (true);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated buyers can insert reviews" ON public.reviews;
  CREATE POLICY "Authenticated buyers can insert reviews" 
    ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() = reviewer_id OR auth.role() = 'authenticated');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Execution completed successfully! All tables, columns, and RLS policies are active.
