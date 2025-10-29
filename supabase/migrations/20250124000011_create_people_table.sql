-- Create people table for Team Management
-- Run this in your Supabase SQL editor

-- ============================================
-- PEOPLE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
  reporting_manager_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
  joining_date DATE,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster searches and foreign keys
CREATE INDEX IF NOT EXISTS idx_people_code ON public.people(employee_code);
CREATE INDEX IF NOT EXISTS idx_people_active ON public.people(is_active);
CREATE INDEX IF NOT EXISTS idx_people_department ON public.people(department_id);
CREATE INDEX IF NOT EXISTS idx_people_designation ON public.people(designation_id);
CREATE INDEX IF NOT EXISTS idx_people_manager ON public.people(reporting_manager_id);
CREATE INDEX IF NOT EXISTS idx_people_email ON public.people(email);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_people_updated_at ON public.people;
CREATE TRIGGER update_people_updated_at 
  BEFORE UPDATE ON public.people 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR PEOPLE
-- ============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert people" ON public.people;
DROP POLICY IF EXISTS "Allow authenticated users to view people" ON public.people;
DROP POLICY IF EXISTS "Allow authenticated users to update people" ON public.people;
DROP POLICY IF EXISTS "Allow authenticated users to delete people" ON public.people;

-- Allow authenticated users to insert people
CREATE POLICY "Allow authenticated users to insert people" ON public.people
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Allow authenticated users to view people
CREATE POLICY "Allow authenticated users to view people" ON public.people
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to update people
CREATE POLICY "Allow authenticated users to update people" ON public.people
  FOR UPDATE
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to delete people
CREATE POLICY "Allow authenticated users to delete people" ON public.people
  FOR DELETE
  TO authenticated, anon
  USING (true);
