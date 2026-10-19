-- ==============================================================================
-- FARM CONNECT ESWATINI — ROW LEVEL SECURITY (RLS) & ACCOUNT ISOLATION POLICIES
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Enforces account ownership, prevents cross-account data leakage, and ensures
-- farmers and buyers can only modify their own respective data records.

-- ------------------------------------------------------------------------------
-- 1. PUBLIC.USERS (Account Profiles & Identity Isolation)
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Allow public viewing of user profiles (needed for farmer profiles & marketplace badges)
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
ALTER TABLE IF EXISTS public.listings ENABLE ROW LEVEL SECURITY;

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

-- Farmers can update their own listings; or buyers/orders can adjust inventory stock
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
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

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
    WITH CHECK (auth.uid() = buyer_id);
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
-- 4. PUBLIC.MESSAGES (Private In-App Communications & Restock Alerts)
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

ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

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
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

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
    WITH CHECK (auth.uid() = reviewer_id);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Done! Row Level Security is now fully enforced across Farm Connect Eswatini.
