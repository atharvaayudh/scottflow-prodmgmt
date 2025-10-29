import { useConfig } from '@/contexts/ConfigContext';

export const useCompanyBranding = () => {
  const { companyConfig, brandingAssets, documentSettings } = useConfig();

  return {
    companyName: companyConfig?.company_name || 'Scott International',
    companyCode: companyConfig?.company_code || 'SCOTT001',
    address: companyConfig?.address || '',
    city: companyConfig?.city || '',
    state: companyConfig?.state || '',
    pincode: companyConfig?.pincode || '',
    phone: companyConfig?.phone || '',
    email: companyConfig?.email || '',
    website: companyConfig?.website || '',
    gstin: companyConfig?.gstin || '',
    pan: companyConfig?.pan || '',
    cin: companyConfig?.cin || '',
    headerLogo: brandingAssets.headerLogo?.file_path || null,
    sidebarLogo: brandingAssets.sidebarLogo?.file_path || null,
    authorizedSignatory: brandingAssets.authorizedSignatory?.file_path || null,
    authorizedSignatoryName: documentSettings.authorized_signatory_name || 'John Doe',
    authorizedSignatoryDesignation: documentSettings.authorized_signatory_designation || 'Managing Director',
    currency: documentSettings.currency || 'INR',
    currencySymbol: documentSettings.currency_symbol || '₹',
    termsConditions: documentSettings.terms_conditions || '',
    footerText: documentSettings.footer_text || 'Thank you for your business!',
  };
};
