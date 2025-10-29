-- Fix Users Table Policies to Prevent Infinite Recursion
-- This removes problematic policies that cause circular dependencies

-- ==============================================
-- 1. DROP ALL EXISTING USER POLICIES
-- ==============================================

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Authenticated users can manage users" ON users;

-- ==============================================
-- 2. CREATE SIMPLE USER POLICIES
-- ==============================================

-- Create very simple policies that don't cause recursion
CREATE POLICY "Simple users view policy" ON users
  FOR SELECT USING (true);

CREATE POLICY "Simple users insert policy" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Simple users update policy" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Simple users delete policy" ON users
  FOR DELETE USING (true);

-- ==============================================
-- 3. VERIFY USER POLICIES
-- ==============================================

-- Check user policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- ==============================================
-- 4. TEST USER ACCESS
-- ==============================================

-- Test if we can query users table
SELECT 
  'Users table test' as test_type,
  count(*) as user_count
FROM users;

SELECT 'Users table policies fixed - no more infinite recursion' as status;
