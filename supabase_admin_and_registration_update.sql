-- ====================================================================
-- FarmConnect Eswatini - Administrator Access & User Registration Update
-- ====================================================================

-- 1. Ensure all expected profile columns exist in public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS settlement_type TEXT DEFAULT 'rural';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS inkhundla TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS landmark_mountain TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS landmark_river TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS house_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plot_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS buyer_type TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS commission_consent_given BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Upgrade authorized administrator accounts in public.users
UPDATE public.users 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE LOWER(TRIM(email)) IN (
  'menzimalumane@gmail.com', 
  'farmconnectsz@gmail.com', 
  'farmconnect.sz@gmail.com'
);

-- 3. Comprehensive Database Trigger Function
-- Handles both Google OAuth and Form Registrations seamlessly,
-- automatically persists all registration metadata to public.users,
-- and strictly enforces the administrator allowlist.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  clean_email TEXT;
  assigned_role TEXT;
  is_admin BOOLEAN;
BEGIN
  clean_email := LOWER(TRIM(new.email));
  is_admin := clean_email IN ('menzimalumane@gmail.com', 'farmconnectsz@gmail.com', 'farmconnect.sz@gmail.com');

  -- Enforce Administrator Allowlist
  IF is_admin THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'buyer');
    -- Guarantee ordinary users never receive admin role
    IF assigned_role = 'admin' THEN
      assigned_role := 'buyer';
    END IF;
  END IF;

  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    phone_number,
    profile_picture_url,
    settlement_type,
    inkhundla,
    landmark_mountain,
    landmark_river,
    street_address,
    house_number,
    plot_number,
    buyer_type,
    commission_consent_given,
    subscription_tier,
    is_verified,
    verification_status,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    assigned_role,
    COALESCE(new.raw_user_meta_data->>'phone_number', new.phone, ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 
      CASE WHEN assigned_role = 'farmer' 
        THEN 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'
        ELSE 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      END
    ),
    COALESCE(new.raw_user_meta_data->>'settlement_type', 'rural'),
    new.raw_user_meta_data->>'inkhundla',
    new.raw_user_meta_data->>'landmark_mountain',
    new.raw_user_meta_data->>'landmark_river',
    new.raw_user_meta_data->>'street_address',
    new.raw_user_meta_data->>'house_number',
    new.raw_user_meta_data->>'plot_number',
    new.raw_user_meta_data->>'buyer_type',
    COALESCE((new.raw_user_meta_data->>'commission_consent_given')::BOOLEAN, false),
    COALESCE(new.raw_user_meta_data->>'subscription_tier', 'free'),
    false,
    'pending',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    role = CASE 
      WHEN clean_email IN ('menzimalumane@gmail.com', 'farmconnectsz@gmail.com', 'farmconnect.sz@gmail.com') THEN 'admin'
      WHEN public.users.role = 'admin' THEN public.users.role
      ELSE COALESCE(EXCLUDED.role, public.users.role)
    END,
    phone_number = COALESCE(NULLIF(EXCLUDED.phone_number, ''), public.users.phone_number),
    profile_picture_url = COALESCE(EXCLUDED.profile_picture_url, public.users.profile_picture_url),
    settlement_type = COALESCE(EXCLUDED.settlement_type, public.users.settlement_type),
    inkhundla = COALESCE(EXCLUDED.inkhundla, public.users.inkhundla),
    landmark_mountain = COALESCE(EXCLUDED.landmark_mountain, public.users.landmark_mountain),
    landmark_river = COALESCE(EXCLUDED.landmark_river, public.users.landmark_river),
    street_address = COALESCE(EXCLUDED.street_address, public.users.street_address),
    house_number = COALESCE(EXCLUDED.house_number, public.users.house_number),
    plot_number = COALESCE(EXCLUDED.plot_number, public.users.plot_number),
    buyer_type = COALESCE(EXCLUDED.buyer_type, public.users.buyer_type),
    commission_consent_given = COALESCE(EXCLUDED.commission_consent_given, public.users.commission_consent_given),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Row Level Security Policies on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
  CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.users FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
  CREATE POLICY "Users can insert own profile" 
    ON public.users FOR INSERT 
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
  -- Users can update their own row, but cannot change role to 'admin' unless authorized
  CREATE POLICY "Users can update own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
      auth.uid() = id 
      AND (
        role != 'admin' 
        OR LOWER(TRIM(email)) IN ('menzimalumane@gmail.com', 'farmconnectsz@gmail.com', 'farmconnect.sz@gmail.com')
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
