-- Fix Users Table Structure
-- This makes the users table more flexible for user creation

-- ==============================================
-- 1. UPDATE USERS TABLE STRUCTURE
-- ==============================================

-- Make name field have a default value instead of being strictly NOT NULL
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- Add a default value for name
ALTER TABLE users ALTER COLUMN name SET DEFAULT '';

-- ==============================================
-- 2. UPDATE EXISTING USERS
-- ==============================================

-- Update any existing users with null or empty names
UPDATE users 
SET name = COALESCE(
  NULLIF(name, ''), 
  split_part(email, '@', 1)
)
WHERE name IS NULL OR name = '';

-- ==============================================
-- 3. CREATE OR REPLACE USER CREATION FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract name from metadata, use email prefix as fallback
  DECLARE
    user_name TEXT;
    user_role_value user_role;
  BEGIN
    -- Get name from metadata or use email prefix
    user_name := COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    );
    
    -- Get role from metadata or use default
    user_role_value := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'production_team'::user_role
    );
    
    -- Insert user record
    INSERT INTO public.users (id, email, name, role)
    VALUES (NEW.id, NEW.email, user_name, user_role_value);
    
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail user creation
      RAISE LOG 'Error creating user record for %: %', NEW.email, SQLERRM;
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 4. RECREATE TRIGGER
-- ==============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- 5. VERIFY USERS TABLE STRUCTURE
-- ==============================================

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing users
SELECT 
  id, 
  email, 
  name, 
  role,
  created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'Users table structure fixed successfully' as status;
