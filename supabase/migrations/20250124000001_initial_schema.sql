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
