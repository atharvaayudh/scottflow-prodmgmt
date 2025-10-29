-- Test User Creation
-- This tests if the user creation system is working

-- ==============================================
-- 1. CHECK USERS TABLE STRUCTURE
-- ==============================================

-- Verify the table structure is correct
SELECT 
  'Table Structure Check' as test_type,
  column_name, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==============================================
-- 2. CHECK EXISTING USERS
-- ==============================================

-- Check current users
SELECT 
  'Current Users' as test_type,
  count(*) as user_count,
  count(CASE WHEN name IS NULL OR name = '' THEN 1 END) as users_without_names,
  count(CASE WHEN role IS NULL THEN 1 END) as users_without_roles
FROM public.users;

-- ==============================================
-- 3. CHECK TRIGGER EXISTS
-- ==============================================

-- Check if trigger exists
SELECT 
  'Trigger Check' as test_type,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
  AND event_object_table = 'users';

-- ==============================================
-- 4. CHECK FUNCTION EXISTS
-- ==============================================

-- Check if function exists
SELECT 
  'Function Check' as test_type,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';

-- ==============================================
-- 5. FINAL STATUS
-- ==============================================

SELECT 'User creation system diagnostic complete' as status;
