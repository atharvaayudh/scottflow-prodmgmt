import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type CompanyConfig = Tables<'company_config'>;
type BrandingAsset = Tables<'branding_assets'>;
type DocumentSetting = Tables<'document_settings'>;

interface ConfigContextType {
  companyConfig: CompanyConfig | null;
  brandingAssets: {
    headerLogo: BrandingAsset | null;
    sidebarLogo: BrandingAsset | null;
    authorizedSignatory: BrandingAsset | null;
  };
  documentSettings: Record<string, string>;
  loading: boolean;
  error: string | null;
  updateCompanyConfig: (config: Partial<CompanyConfig>) => Promise<void>;
  uploadBrandingAsset: (file: File, assetType: 'header_logo' | 'sidebar_logo' | 'authorized_signatory') => Promise<void>;
  updateDocumentSetting: (key: string, value: string) => Promise<void>;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

interface ConfigProviderProps {
  children: React.ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig | null>(null);
  const [brandingAssets, setBrandingAssets] = useState({
    headerLogo: null as BrandingAsset | null,
    sidebarLogo: null as BrandingAsset | null,
    authorizedSignatory: null as BrandingAsset | null,
  });
  const [documentSettings, setDocumentSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyConfig = async () => {
    try {
      // Get the first record if multiple exist (handle duplicates)
      const { data, error } = await supabase
        .from('company_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCompanyConfig(data || null);
    } catch (err) {
      console.error('Error fetching company config:', err);
      setError('Failed to load company configuration');
    }
  };

  const fetchBrandingAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('branding_assets')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const assets = {
        headerLogo: data.find(asset => asset.asset_type === 'header_logo') || null,
        sidebarLogo: data.find(asset => asset.asset_type === 'sidebar_logo') || null,
        authorizedSignatory: data.find(asset => asset.asset_type === 'authorized_signatory') || null,
      };

      setBrandingAssets(assets);
    } catch (err) {
      console.error('Error fetching branding assets:', err);
      setError('Failed to load branding assets');
    }
  };

  const fetchDocumentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('document_settings')
        .select('*');

      if (error) throw error;

      const settings: Record<string, string> = {};
      data.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value || '';
      });

      setDocumentSettings(settings);
    } catch (err) {
      console.error('Error fetching document settings:', err);
      setError('Failed to load document settings');
    }
  };

  const refreshConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchCompanyConfig(),
      fetchBrandingAssets(),
      fetchDocumentSettings(),
    ]);
    
    setLoading(false);
  }, []);

  const updateCompanyConfig = async (config: Partial<CompanyConfig>) => {
    try {
      if (!companyConfig) {
        // Create new config
        const { data, error } = await supabase
          .from('company_config')
          .insert([config])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        setCompanyConfig(data);
      } else {
        // Update existing config
        const { data, error } = await supabase
          .from('company_config')
          .update(config)
          .eq('id', companyConfig.id)
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        setCompanyConfig(data);
      }
    } catch (err) {
      console.error('Error updating company config:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update company configuration';
      setError(errorMessage);
      throw err;
    }
  };

  const uploadBrandingAsset = async (file: File, assetType: 'header_logo' | 'sidebar_logo' | 'authorized_signatory') => {
    try {
      // Check if storage bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        throw new Error('Failed to access storage');
      }
      
      const brandingBucket = buckets.find(bucket => bucket.id === 'branding-assets');
      if (!brandingBucket) {
        throw new Error('Branding assets storage bucket not found. Please contact administrator.');
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${assetType}_${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('branding-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Storage error: ${uploadError.message}`);
      }

      // Get file URL
      const { data: { publicUrl } } = supabase.storage
        .from('branding-assets')
        .getPublicUrl(filePath);

      // Deactivate existing asset of this type using a transaction-like approach
      const { error: deactivateError } = await supabase
        .from('branding_assets')
        .update({ is_active: false })
        .eq('asset_type', assetType)
        .eq('is_active', true);

      if (deactivateError) {
        console.error('Deactivate error:', deactivateError);
        // Continue with upload even if deactivation fails
      }

      // Create new asset record
      const { data, error } = await supabase
        .from('branding_assets')
        .insert([{
          asset_type: assetType,
          asset_name: file.name,
          file_path: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          is_active: true,
        }])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Update local state
      setBrandingAssets(prev => ({
        ...prev,
        [assetType === 'header_logo' ? 'headerLogo' : 
         assetType === 'sidebar_logo' ? 'sidebarLogo' : 'authorizedSignatory']: data
      }));

    } catch (err) {
      console.error('Error uploading branding asset:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload branding asset';
      setError(errorMessage);
      throw err;
    }
  };

  const updateDocumentSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('document_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          setting_type: 'text',
        });

      if (error) throw error;

      setDocumentSettings(prev => ({
        ...prev,
        [key]: value,
      }));
    } catch (err) {
      console.error('Error updating document setting:', err);
      setError('Failed to update document setting');
      throw err;
    }
  };

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const value: ConfigContextType = {
    companyConfig,
    brandingAssets,
    documentSettings,
    loading,
    error,
    updateCompanyConfig,
    uploadBrandingAsset,
    updateDocumentSetting,
    refreshConfig,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
