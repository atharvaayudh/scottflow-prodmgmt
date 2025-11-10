-- Create order_attachments table for storing order images and files
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.order_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('mockup', 'reference', 'attachment')),
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON public.order_attachments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_attachments_file_type ON public.order_attachments(file_type);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_order_attachments_updated_at ON public.order_attachments;
CREATE TRIGGER update_order_attachments_updated_at 
  BEFORE UPDATE ON public.order_attachments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_attachments
DROP POLICY IF EXISTS "Allow authenticated users to insert order attachments" ON public.order_attachments;
DROP POLICY IF EXISTS "Allow authenticated users to view order attachments" ON public.order_attachments;
DROP POLICY IF EXISTS "Allow authenticated users to update order attachments" ON public.order_attachments;
DROP POLICY IF EXISTS "Allow authenticated users to delete order attachments" ON public.order_attachments;

CREATE POLICY "Allow authenticated users to insert order attachments" ON public.order_attachments
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view order attachments" ON public.order_attachments
  FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow authenticated users to update order attachments" ON public.order_attachments
  FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow authenticated users to delete order attachments" ON public.order_attachments
  FOR DELETE
  TO authenticated, anon
  USING (true);
