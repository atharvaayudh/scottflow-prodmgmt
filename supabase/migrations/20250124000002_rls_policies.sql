-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for teams table
CREATE POLICY "Everyone can view teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Admins and production managers can manage teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
    )
  );

-- Create RLS policies for permissions table
CREATE POLICY "Everyone can view permissions" ON permissions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage permissions" ON permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for factories table
CREATE POLICY "Everyone can view factories" ON factories
  FOR SELECT USING (true);

CREATE POLICY "Admins and production managers can manage factories" ON factories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
    )
  );

-- Create RLS policies for product categories table
CREATE POLICY "Everyone can view product categories" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins and production managers can manage product categories" ON product_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
    )
  );

-- Create RLS policies for products table
CREATE POLICY "Everyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admins and production managers can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
    )
  );

-- Create RLS policies for orders table
CREATE POLICY "Users can view orders they created" ON orders
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view orders assigned to their factory" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND team_id IN (
        SELECT team_id FROM users WHERE id = assigned_factory_id
      )
    )
  );

CREATE POLICY "Admins and production managers can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
    )
  );

CREATE POLICY "Admins and production managers can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
    )
  );

CREATE POLICY "Production team can create and update orders" ON orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('production_team', 'production_manager')
    )
  );

CREATE POLICY "Production team can update orders they created" ON orders
  FOR UPDATE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('production_team', 'production_manager')
    )
  );

-- Create RLS policies for order_items table
CREATE POLICY "Users can view order items for orders they can access" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND (
        created_by = auth.uid() OR
        assigned_factory_id IN (
          SELECT id FROM factories WHERE id IN (
            SELECT team_id FROM users WHERE id = auth.uid()
          )
        ) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
        )
      )
    )
  );

CREATE POLICY "Admins and production managers can manage order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
    )
  );

CREATE POLICY "Production team can manage order items for their orders" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND created_by = auth.uid() AND
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('production_team', 'production_manager')
      )
    )
  );

-- Create RLS policies for production_schedules table
CREATE POLICY "Users can view production schedules for their orders" ON production_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND (
        created_by = auth.uid() OR
        assigned_factory_id IN (
          SELECT id FROM factories WHERE id IN (
            SELECT team_id FROM users WHERE id = auth.uid()
          )
        ) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
        )
      )
    )
  );

CREATE POLICY "Admins and production managers can manage production schedules" ON production_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
    )
  );

-- Create RLS policies for quality_checks table
CREATE POLICY "Users can view quality checks for their orders" ON quality_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND (
        created_by = auth.uid() OR
        assigned_factory_id IN (
          SELECT id FROM factories WHERE id IN (
            SELECT team_id FROM users WHERE id = auth.uid()
          )
        ) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
        )
      )
    )
  );

CREATE POLICY "Admins and production managers can manage quality checks" ON quality_checks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
    )
  );

CREATE POLICY "Production team can create quality checks" ON quality_checks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('production_team', 'production_manager')
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'production_team');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
