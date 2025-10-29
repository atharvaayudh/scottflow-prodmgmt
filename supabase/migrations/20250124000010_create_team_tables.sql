-- Create departments and designations tables for Team Management
-- Run this in your Supabase SQL editor

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_name VARCHAR(255) NOT NULL,
  department_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_departments_code ON public.departments(department_code);
CREATE INDEX IF NOT EXISTS idx_departments_active ON public.departments(is_active);

-- ============================================
-- DESIGNATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  designation_name VARCHAR(255) NOT NULL,
  designation_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_designations_code ON public.designations(designation_code);
CREATE INDEX IF NOT EXISTS idx_designations_active ON public.designations(is_active);

-- ============================================
-- ADD UPDATED_AT TRIGGER FUNCTION IF NOT EXISTS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at 
  BEFORE UPDATE ON public.departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_designations_updated_at ON public.designations;
CREATE TRIGGER update_designations_updated_at 
  BEFORE UPDATE ON public.designations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR DEPARTMENTS
-- ============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to manage departments" ON public.departments;
DROP POLICY IF EXISTS "Allow authenticated users to view departments" ON public.departments;

-- Allow authenticated users to insert departments
CREATE POLICY "Allow authenticated users to insert departments" ON public.departments
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Allow authenticated users to view departments
CREATE POLICY "Allow authenticated users to view departments" ON public.departments
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to update departments
CREATE POLICY "Allow authenticated users to update departments" ON public.departments
  FOR UPDATE
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to delete departments
CREATE POLICY "Allow authenticated users to delete departments" ON public.departments
  FOR DELETE
  TO authenticated, anon
  USING (true);

-- ============================================
-- RLS POLICIES FOR DESIGNATIONS
-- ============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to manage designations" ON public.designations;
DROP POLICY IF EXISTS "Allow authenticated users to view designations" ON public.designations;

-- Allow authenticated users to insert designations
CREATE POLICY "Allow authenticated users to insert designations" ON public.designations
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Allow authenticated users to view designations
CREATE POLICY "Allow authenticated users to view designations" ON public.designations
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to update designations
CREATE POLICY "Allow authenticated users to update designations" ON public.designations
  FOR UPDATE
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to delete designations
CREATE POLICY "Allow authenticated users to delete designations" ON public.designations
  FOR DELETE
  TO authenticated, anon
  USING (true);
