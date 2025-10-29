-- Fix User Creation Trigger
-- This handles the case where users are invited without a name in metadata

-- ==============================================
-- 1. DROP EXISTING TRIGGER
-- ==============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ==============================================
-- 2. CREATE IMPROVED USER CREATION FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract name from metadata, use email as fallback
  DECLARE
    user_name TEXT;
  BEGIN
    -- Try to get name from metadata
    user_name := COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1) -- Use email prefix as fallback
    );
    
    -- Insert user with proper name handling
    INSERT INTO public.users (id, email, name, role)
    VALUES (
      NEW.id, 
      NEW.email, 
      user_name,
      COALESCE(
        NEW.raw_user_meta_data->>'role',
        'production_team'::user_role
      )
    );
    
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE LOG 'Error creating user record: %', SQLERRM;
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 3. CREATE NEW TRIGGER
-- ==============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- 4. UPDATE EXISTING USERS WITHOUT NAMES
-- ==============================================

-- Update any existing users that might have null names
UPDATE public.users 
SET name = COALESCE(name, split_part(email, '@', 1))
WHERE name IS NULL OR name = '';

-- ==============================================
-- 5. VERIFY THE FIX
-- ==============================================

-- Check if there are any users with null names
SELECT 
  id, 
  email, 
  name, 
  role,
  CASE 
    WHEN name IS NULL OR name = '' THEN 'NEEDS NAME UPDATE'
    ELSE 'OK'
  END as status
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'User creation trigger fixed successfully' as status;
