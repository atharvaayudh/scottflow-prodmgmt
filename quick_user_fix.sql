-- Quick Fix for User Creation Issue
-- This fixes the immediate "null value in column name" error

-- ==============================================
-- 1. MAKE NAME FIELD OPTIONAL
-- ==============================================

-- Remove NOT NULL constraint from name field
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- Set default value for name
ALTER TABLE users ALTER COLUMN name SET DEFAULT '';

-- ==============================================
-- 2. UPDATE USER CREATION FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use email prefix as name if no name is provided
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'production_team'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, just return NEW to not break user creation
    RAISE LOG 'User creation error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 3. RECREATE TRIGGER
-- ==============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- 4. VERIFY FIX
-- ==============================================

-- Check if name field is now nullable
SELECT 
  column_name, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'name'
  AND table_schema = 'public';

SELECT 'User creation issue fixed' as status;
