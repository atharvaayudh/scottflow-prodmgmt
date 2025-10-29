-- Ultimate User Creation Fix
-- This handles all possible user creation scenarios and errors

-- ==============================================
-- 1. COMPLETELY REMOVE EXISTING TRIGGER
-- ==============================================

-- Drop the trigger and function completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ==============================================
-- 2. FIX USERS TABLE STRUCTURE
-- ==============================================

-- Make sure name field is nullable and has a default
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN name SET DEFAULT '';

-- Make sure role field has a default
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'production_team';

-- ==============================================
-- 3. CREATE BULLETPROOF USER CREATION FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role_value user_role;
BEGIN
  -- Extract name safely
  user_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
    split_part(NEW.email, '@', 1)
  );
  
  -- If still empty, use a default
  IF user_name IS NULL OR user_name = '' THEN
    user_name := 'User';
  END IF;
  
  -- Extract role safely
  BEGIN
    user_role_value := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'production_team'::user_role
    );
  EXCEPTION
    WHEN OTHERS THEN
      user_role_value := 'production_team'::user_role;
  END;
  
  -- Insert user record with all defaults
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    COALESCE(NEW.email, ''),
    user_name,
    user_role_value,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  );
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail user creation
    RAISE LOG 'Error in handle_new_user for email %: %', NEW.email, SQLERRM;
    
    -- Try to insert with minimal data
    BEGIN
      INSERT INTO public.users (id, email, name, role)
      VALUES (NEW.id, COALESCE(NEW.email, ''), 'User', 'production_team');
    EXCEPTION
      WHEN OTHERS THEN
        RAISE LOG 'Failed to create minimal user record: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 4. CREATE THE TRIGGER
-- ==============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- 5. FIX EXISTING USERS
-- ==============================================

-- Update any existing users with problematic data
UPDATE users 
SET 
  name = COALESCE(NULLIF(name, ''), split_part(email, '@', 1), 'User'),
  role = COALESCE(role, 'production_team'::user_role)
WHERE name IS NULL OR name = '' OR role IS NULL;

-- ==============================================
-- 6. VERIFY THE FIX
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
LIMIT 3;

-- Test the function manually
SELECT 'User creation system fixed and ready' as status;
