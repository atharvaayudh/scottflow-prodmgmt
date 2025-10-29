-- Fix infinite recursion in RLS policies
-- The issue is that policies are checking the users table while users table has RLS enabled
-- We need to create a security definer function to check user roles without RLS

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Admins and production managers can manage teams" ON teams;
DROP POLICY IF EXISTS "Only admins can manage permissions" ON permissions;
DROP POLICY IF EXISTS "Admins and production managers can manage factories" ON factories;
DROP POLICY IF EXISTS "Admins and production managers can manage product categories" ON product_categories;
DROP POLICY IF EXISTS "Admins and production managers can manage products" ON products;
DROP POLICY IF EXISTS "Admins and production managers can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins and production managers can manage orders" ON orders;
DROP POLICY IF EXISTS "Production team can create and update orders" ON orders;
DROP POLICY IF EXISTS "Production team can update orders they created" ON orders;
DROP POLICY IF EXISTS "Admins and production managers can manage order items" ON order_items;
DROP POLICY IF EXISTS "Production team can manage order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Admins and production managers can manage production schedules" ON production_schedules;
DROP POLICY IF EXISTS "Admins and production managers can manage quality checks" ON quality_checks;
DROP POLICY IF EXISTS "Production team can create quality checks" ON quality_checks;

-- Create a security definer function to check user roles without RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to check if user is admin or production manager
CREATE OR REPLACE FUNCTION public.is_admin_or_production_manager(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'production_manager') FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to check if user is production team or manager
CREATE OR REPLACE FUNCTION public.is_production_team_or_manager(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('production_team', 'production_manager') FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies using the security definer functions
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins and production managers can manage teams" ON teams
  FOR ALL USING (public.is_admin_or_production_manager(auth.uid()));

CREATE POLICY "Only admins can manage permissions" ON permissions
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins and production managers can manage factories" ON factories
  FOR ALL USING (public.is_admin_or_production_manager(auth.uid()));

CREATE POLICY "Admins and production managers can manage product categories" ON product_categories
  FOR ALL USING (public.is_admin_or_production_manager(auth.uid()));

CREATE POLICY "Admins and production managers can manage products" ON products
  FOR ALL USING (public.is_admin_or_production_manager(auth.uid()));

CREATE POLICY "Admins and production managers can view all orders" ON orders
  FOR SELECT USING (public.is_admin_or_production_manager(auth.uid()));

CREATE POLICY "Admins and production managers can manage orders" ON orders
  FOR ALL USING (public.is_admin_or_production_manager(auth.uid()));

CREATE POLICY "Production team can create and update orders" ON orders
  FOR INSERT WITH CHECK (public.is_production_team_or_manager(auth.uid()));

CREATE POLICY "Production team can update orders they created" ON orders
  FOR UPDATE USING (
    created_by = auth.uid() AND public.is_production_team_or_manager(auth.uid())
  );

CREATE POLICY "Admins and production managers can manage order items" ON order_items
  FOR ALL USING (public.is_admin_or_production_manager(auth.uid()));

CREATE POLICY "Production team can manage order items for their orders" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND created_by = auth.uid() AND
      public.is_production_team_or_manager(auth.uid())
    )
  );

CREATE POLICY "Admins and production managers can manage production schedules" ON production_schedules
  FOR ALL USING (public.is_admin_or_production_manager(auth.uid()));

CREATE POLICY "Admins and production managers can manage quality checks" ON quality_checks
  FOR ALL USING (public.is_admin_or_production_manager(auth.uid()));

CREATE POLICY "Production team can create quality checks" ON quality_checks
  FOR INSERT WITH CHECK (public.is_production_team_or_manager(auth.uid()));

-- Fix configuration table policies
DROP POLICY IF EXISTS "Admins can manage company config" ON company_config;
DROP POLICY IF EXISTS "Admins can manage branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Admins can manage document settings" ON document_settings;

CREATE POLICY "Admins can manage company config" ON company_config
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage branding assets" ON branding_assets
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage document settings" ON document_settings
  FOR ALL USING (public.is_admin(auth.uid()));

-- Fix storage policies
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;

CREATE POLICY "Authenticated users can upload branding assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated' AND
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update branding assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding-assets' AND
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete branding assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding-assets' AND
    public.is_admin(auth.uid())
  );
