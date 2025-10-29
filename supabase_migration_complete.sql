  -- Complete Migration Script for Scott International Production Management System
  -- Run this script in your Supabase SQL Editor

  -- Enable necessary extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Create custom types
  CREATE TYPE user_role AS ENUM (
    'admin',
    'production_manager', 
    'production_team',
    'branding_partners',
    'factories',
    'jobwork_factories'
  );

  CREATE TYPE order_status AS ENUM (
    'draft',
    'pending',
    'confirmed',
    'in_production',
    'completed',
    'cancelled',
    'on_hold'
  );

  CREATE TYPE factory_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'maintenance'
  );

  -- Teams table (created first since users references it)
  CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Users table
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    role user_role NOT NULL DEFAULT 'production_team',
    team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
  );

  -- Permissions table
  CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module VARCHAR(100) NOT NULL,
    create_permission BOOLEAN DEFAULT FALSE,
    read_permission BOOLEAN DEFAULT FALSE,
    update_permission BOOLEAN DEFAULT FALSE,
    delete_permission BOOLEAN DEFAULT FALSE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Factories table
  CREATE TABLE factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    status factory_status DEFAULT 'active',
    capacity INTEGER,
    specializations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Product categories table
  CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Products table
  CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES product_categories(id),
    specifications JSONB,
    unit VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Orders table
  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    status order_status DEFAULT 'draft',
    total_amount DECIMAL(12,2),
    notes TEXT,
    delivery_date DATE,
    created_by UUID REFERENCES users(id),
    assigned_factory_id UUID REFERENCES factories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Order items table
  CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Production schedules table
  CREATE TABLE production_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    factory_id UUID REFERENCES factories(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Quality checks table
  CREATE TABLE quality_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    factory_id UUID REFERENCES factories(id),
    check_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes for better performance
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_role ON users(role);
  CREATE INDEX idx_orders_status ON orders(status);
  CREATE INDEX idx_orders_created_at ON orders(created_at);
  CREATE INDEX idx_orders_factory ON orders(assigned_factory_id);
  CREATE INDEX idx_order_items_order ON order_items(order_id);
  CREATE INDEX idx_factories_status ON factories(status);
  CREATE INDEX idx_products_category ON products(category_id);

  -- Create updated_at trigger function
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Add updated_at triggers to all tables
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON factories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_production_schedules_updated_at BEFORE UPDATE ON production_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_quality_checks_updated_at BEFORE UPDATE ON quality_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  -- Insert default data
  INSERT INTO teams (name, description) VALUES 
    ('Production Team', 'Main production team'),
    ('Quality Control', 'Quality assurance team'),
    ('Management', 'Management team');

  -- Insert default permissions
  INSERT INTO permissions (module, create_permission, read_permission, update_permission, delete_permission, role) VALUES
    ('orders', true, true, true, true, 'admin'),
    ('orders', true, true, true, false, 'production_manager'),
    ('orders', false, true, true, false, 'production_team'),
    ('factories', true, true, true, true, 'admin'),
    ('factories', true, true, true, false, 'production_manager'),
    ('factories', false, true, false, false, 'production_team'),
    ('users', true, true, true, true, 'admin'),
    ('users', false, true, true, false, 'production_manager'),
    ('masters', true, true, true, true, 'admin'),
    ('masters', true, true, true, false, 'production_manager'),
    ('masters', false, true, false, false, 'production_team');

  -- Insert sample product categories
  INSERT INTO product_categories (name, code, description) VALUES
    ('Apparel', 'APP', 'Clothing and fashion items'),
    ('Accessories', 'ACC', 'Fashion accessories'),
    ('Footwear', 'FOT', 'Shoes and footwear'),
    ('Bags', 'BAG', 'Handbags and luggage');

  -- Insert sample products
  INSERT INTO products (name, code, description, category_id, unit) VALUES
    ('Cotton T-Shirt', 'TSH001', 'Basic cotton t-shirt', (SELECT id FROM product_categories WHERE code = 'APP'), 'pieces'),
    ('Denim Jeans', 'JEA001', 'Classic denim jeans', (SELECT id FROM product_categories WHERE code = 'APP'), 'pieces'),
    ('Leather Belt', 'BEL001', 'Genuine leather belt', (SELECT id FROM product_categories WHERE code = 'ACC'), 'pieces'),
    ('Canvas Sneakers', 'SNE001', 'Casual canvas sneakers', (SELECT id FROM product_categories WHERE code = 'FOT'), 'pairs'),
    ('Leather Handbag', 'BAG001', 'Premium leather handbag', (SELECT id FROM product_categories WHERE code = 'BAG'), 'pieces');

  -- Insert sample factories
  INSERT INTO factories (name, code, address, contact_person, phone, email, capacity, specializations) VALUES
    ('Mumbai Garments Ltd', 'MGL001', 'Mumbai, Maharashtra', 'Rajesh Kumar', '+91-9876543210', 'rajesh@mgl.com', 1000, ARRAY['apparel', 'textiles']),
    ('Delhi Manufacturing Co', 'DMC001', 'Delhi, NCR', 'Priya Sharma', '+91-9876543211', 'priya@dmc.com', 800, ARRAY['accessories', 'footwear']),
    ('Chennai Textiles', 'CT001', 'Chennai, Tamil Nadu', 'Suresh Reddy', '+91-9876543212', 'suresh@ct.com', 1200, ARRAY['apparel', 'textiles', 'bags']);

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

-- Configuration tables for company settings and branding

-- Company configuration table
CREATE TABLE company_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  gstin VARCHAR(15),
  pan VARCHAR(10),
  cin VARCHAR(21),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branding assets table
CREATE TABLE branding_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type VARCHAR(50) NOT NULL, -- 'header_logo', 'sidebar_logo', 'authorized_signatory'
  asset_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(asset_type, is_active) -- Only one active asset per type
);

-- Document settings table
CREATE TABLE document_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text', -- 'text', 'number', 'boolean', 'json'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for configuration tables
CREATE INDEX idx_company_config_code ON company_config(company_code);
CREATE INDEX idx_branding_assets_type ON branding_assets(asset_type);
CREATE INDEX idx_branding_assets_active ON branding_assets(is_active);
CREATE INDEX idx_document_settings_key ON document_settings(setting_key);

-- Add updated_at triggers for configuration tables
CREATE TRIGGER update_company_config_updated_at BEFORE UPDATE ON company_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branding_assets_updated_at BEFORE UPDATE ON branding_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_settings_updated_at BEFORE UPDATE ON document_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for configuration tables
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_config
CREATE POLICY "Everyone can view company config" ON company_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage company config" ON company_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for branding_assets
CREATE POLICY "Everyone can view branding assets" ON branding_assets
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage branding assets" ON branding_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for document_settings
CREATE POLICY "Everyone can view document settings" ON document_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage document settings" ON document_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default company configuration
INSERT INTO company_config (company_name, company_code, address, city, state, country, pincode, phone, email, website, gstin, pan) VALUES
('Scott International', 'SCOTT001', '123 Business Park, Industrial Area', 'Mumbai', 'Maharashtra', 'India', '400001', '+91-22-12345678', 'info@scottinternational.com', 'www.scottinternational.com', '27AABCS1234C1Z5', 'AABCS1234C');

-- Insert default document settings
INSERT INTO document_settings (setting_key, setting_value, setting_type, description) VALUES
('invoice_prefix', 'INV', 'text', 'Prefix for invoice numbers'),
('quotation_prefix', 'QUO', 'text', 'Prefix for quotation numbers'),
('order_prefix', 'ORD', 'text', 'Prefix for order numbers'),
('currency', 'INR', 'text', 'Default currency for documents'),
('currency_symbol', '₹', 'text', 'Currency symbol'),
('terms_conditions', 'Terms and conditions apply. Please refer to our standard terms.', 'text', 'Default terms and conditions'),
('footer_text', 'Thank you for your business!', 'text', 'Footer text for documents'),
('authorized_signatory_name', 'John Doe', 'text', 'Name of authorized signatory'),
('authorized_signatory_designation', 'Managing Director', 'text', 'Designation of authorized signatory');
