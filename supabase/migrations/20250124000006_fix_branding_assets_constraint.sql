-- Fix branding_assets unique constraint to allow proper deactivation
-- Drop the existing unique constraint
ALTER TABLE branding_assets DROP CONSTRAINT IF EXISTS branding_assets_asset_type_is_active_key;

-- Create a partial unique index that only applies to active assets
-- This allows multiple inactive assets of the same type but only one active
CREATE UNIQUE INDEX idx_branding_assets_active_unique 
ON branding_assets (asset_type) 
WHERE is_active = true;

-- Add a comment explaining the constraint
COMMENT ON INDEX idx_branding_assets_active_unique IS 'Ensures only one active asset per type, allows multiple inactive assets';
