import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useConfig } from '@/contexts/ConfigContext';
import { useToast } from '@/hooks/use-toast';
import { Building2, Image, FileText, Upload, X, Save, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SampleDocument from '@/components/documents/SampleDocument';

export default function Configurations() {
  const { 
    companyConfig, 
    brandingAssets, 
    documentSettings, 
    loading, 
    error,
    updateCompanyConfig, 
    uploadBrandingAsset, 
    updateDocumentSetting 
  } = useConfig();
  
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'invoice' | 'quotation' | 'order'>('invoice');
  const [documentSaving, setDocumentSaving] = useState<string | null>(null);

  // Company config form state
  const [companyForm, setCompanyForm] = useState({
    company_name: companyConfig?.company_name || '',
    company_code: companyConfig?.company_code || '',
    address: companyConfig?.address || '',
    city: companyConfig?.city || '',
    state: companyConfig?.state || '',
    country: companyConfig?.country || 'India',
    pincode: companyConfig?.pincode || '',
    phone: companyConfig?.phone || '',
    email: companyConfig?.email || '',
    website: companyConfig?.website || '',
    gstin: companyConfig?.gstin || '',
    pan: companyConfig?.pan || '',
    cin: companyConfig?.cin || '',
  });

  // Document settings form state
  const [documentForm, setDocumentForm] = useState({
    invoice_prefix: documentSettings.invoice_prefix || '',
    quotation_prefix: documentSettings.quotation_prefix || '',
    order_prefix: documentSettings.order_prefix || '',
    currency: documentSettings.currency || 'INR',
    currency_symbol: documentSettings.currency_symbol || '₹',
    terms_conditions: documentSettings.terms_conditions || '',
    footer_text: documentSettings.footer_text || '',
    authorized_signatory_name: documentSettings.authorized_signatory_name || '',
    authorized_signatory_designation: documentSettings.authorized_signatory_designation || '',
  });

  // Sync company form with context data when it loads
  useEffect(() => {
    if (companyConfig) {
      setCompanyForm({
        company_name: companyConfig.company_name || '',
        company_code: companyConfig.company_code || '',
        address: companyConfig.address || '',
        city: companyConfig.city || '',
        state: companyConfig.state || '',
        country: companyConfig.country || 'India',
        pincode: companyConfig.pincode || '',
        phone: companyConfig.phone || '',
        email: companyConfig.email || '',
        website: companyConfig.website || '',
        gstin: companyConfig.gstin || '',
        pan: companyConfig.pan || '',
        cin: companyConfig.cin || '',
      });
    }
  }, [companyConfig]);

  // Sync document form with context data when it loads
  useEffect(() => {
    setDocumentForm({
      invoice_prefix: documentSettings.invoice_prefix || '',
      quotation_prefix: documentSettings.quotation_prefix || '',
      order_prefix: documentSettings.order_prefix || '',
      currency: documentSettings.currency || 'INR',
      currency_symbol: documentSettings.currency_symbol || '₹',
      terms_conditions: documentSettings.terms_conditions || '',
      footer_text: documentSettings.footer_text || '',
      authorized_signatory_name: documentSettings.authorized_signatory_name || '',
      authorized_signatory_designation: documentSettings.authorized_signatory_designation || '',
    });
  }, [documentSettings]);

  // Debounced auto-save for document settings
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (key: string, value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleDocumentSettingSave(key, value);
        }, 1000); // 1 second delay
      };
    })(),
    []
  );

  const handleCompanyConfigSave = async () => {
    const validationErrors = validateCompanyForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(', '),
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await updateCompanyConfig(companyForm);
      toast({
        title: "Success",
        description: "Company configuration updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentSettingSave = async (key: string, value: string) => {
    try {
      setDocumentSaving(key);
      await updateDocumentSetting(key, value);
      toast({
        title: "Success",
        description: "Document setting updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document setting.",
        variant: "destructive",
      });
    } finally {
      setDocumentSaving(null);
    }
  };

  const handleFileUpload = async (file: File, assetType: 'header_logo' | 'sidebar_logo' | 'authorized_signatory') => {
    try {
      setUploading(assetType);
      await uploadBrandingAsset(file, assetType);
      toast({
        title: "Success",
        description: `${assetType.replace('_', ' ')} uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  // Form validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateGSTIN = (gstin: string) => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const validatePAN = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateCIN = (cin: string) => {
    const cinRegex = /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
    return cinRegex.test(cin);
  };

  const validateCompanyForm = () => {
    const errors: string[] = [];
    
    if (!companyForm.company_name.trim()) {
      errors.push('Company name is required');
    }
    
    if (!companyForm.company_code.trim()) {
      errors.push('Company code is required');
    }
    
    if (companyForm.email && !validateEmail(companyForm.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (companyForm.phone && !validatePhone(companyForm.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    if (companyForm.gstin && !validateGSTIN(companyForm.gstin)) {
      errors.push('Please enter a valid GSTIN (15 characters)');
    }
    
    if (companyForm.pan && !validatePAN(companyForm.pan)) {
      errors.push('Please enter a valid PAN (10 characters)');
    }
    
    if (companyForm.cin && !validateCIN(companyForm.cin)) {
      errors.push('Please enter a valid CIN (21 characters)');
    }
    
    return errors;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, assetType: 'header_logo' | 'sidebar_logo' | 'authorized_signatory') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      handleFileUpload(file, assetType);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading configuration...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurations</h1>
          <p className="text-muted-foreground mt-2">
            Manage company details, branding assets, and document settings.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Details
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Branding Assets
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Document Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={companyForm.company_name}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_code">Company Code *</Label>
                    <Input
                      id="company_code"
                      value={companyForm.company_code}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, company_code: e.target.value }))}
                      placeholder="Enter company code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter company address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={companyForm.city}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={companyForm.state}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={companyForm.pincode}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="Enter website URL"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      value={companyForm.gstin}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, gstin: e.target.value }))}
                      placeholder="Enter GSTIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN</Label>
                    <Input
                      id="pan"
                      value={companyForm.pan}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, pan: e.target.value }))}
                      placeholder="Enter PAN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cin">CIN</Label>
                    <Input
                      id="cin"
                      value={companyForm.cin}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, cin: e.target.value }))}
                      placeholder="Enter CIN"
                    />
                  </div>
                </div>

                <Button onClick={handleCompanyConfigSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Company Details'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Header Logo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Header Logo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {brandingAssets.headerLogo ? (
                    <div className="space-y-2">
                      <img
                        src={brandingAssets.headerLogo.file_path}
                        alt="Header Logo"
                        className="w-full h-24 object-contain border rounded"
                      />
                      <p className="text-sm text-muted-foreground">
                        {brandingAssets.headerLogo.asset_name}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">No logo uploaded</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="header_logo">Upload Header Logo</Label>
                    <Input
                      id="header_logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'header_logo')}
                      disabled={uploading === 'header_logo'}
                    />
                    {uploading === 'header_logo' && (
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Logo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sidebar Logo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {brandingAssets.sidebarLogo ? (
                    <div className="space-y-2">
                      <img
                        src={brandingAssets.sidebarLogo.file_path}
                        alt="Sidebar Logo"
                        className="w-full h-24 object-contain border rounded"
                      />
                      <p className="text-sm text-muted-foreground">
                        {brandingAssets.sidebarLogo.asset_name}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">No logo uploaded</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="sidebar_logo">Upload Sidebar Logo</Label>
                    <Input
                      id="sidebar_logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'sidebar_logo')}
                      disabled={uploading === 'sidebar_logo'}
                    />
                    {uploading === 'sidebar_logo' && (
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Authorized Signatory */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Authorized Signatory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {brandingAssets.authorizedSignatory ? (
                    <div className="space-y-2">
                      <img
                        src={brandingAssets.authorizedSignatory.file_path}
                        alt="Authorized Signatory"
                        className="w-full h-24 object-contain border rounded"
                      />
                      <p className="text-sm text-muted-foreground">
                        {brandingAssets.authorizedSignatory.asset_name}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">No signature uploaded</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="authorized_signatory">Upload Signature</Label>
                    <Input
                      id="authorized_signatory"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'authorized_signatory')}
                      disabled={uploading === 'authorized_signatory'}
                    />
                    {uploading === 'authorized_signatory' && (
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                    <Input
                      id="invoice_prefix"
                      value={documentForm.invoice_prefix}
                      onChange={(e) => {
                        setDocumentForm(prev => ({ ...prev, invoice_prefix: e.target.value }));
                        debouncedSave('invoice_prefix', e.target.value);
                      }}
                      placeholder="INV"
                      disabled={documentSaving === 'invoice_prefix'}
                    />
                    {documentSaving === 'invoice_prefix' && (
                      <p className="text-sm text-muted-foreground">Saving...</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quotation_prefix">Quotation Prefix</Label>
                    <Input
                      id="quotation_prefix"
                      value={documentForm.quotation_prefix}
                      onChange={(e) => {
                        setDocumentForm(prev => ({ ...prev, quotation_prefix: e.target.value }));
                        debouncedSave('quotation_prefix', e.target.value);
                      }}
                      placeholder="QUO"
                      disabled={documentSaving === 'quotation_prefix'}
                    />
                    {documentSaving === 'quotation_prefix' && (
                      <p className="text-sm text-muted-foreground">Saving...</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="order_prefix">Order Prefix</Label>
                    <Input
                      id="order_prefix"
                      value={documentForm.order_prefix}
                      onChange={(e) => {
                        setDocumentForm(prev => ({ ...prev, order_prefix: e.target.value }));
                        debouncedSave('order_prefix', e.target.value);
                      }}
                      placeholder="ORD"
                      disabled={documentSaving === 'order_prefix'}
                    />
                    {documentSaving === 'order_prefix' && (
                      <p className="text-sm text-muted-foreground">Saving...</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={documentForm.currency}
                      onChange={(e) => {
                        setDocumentForm(prev => ({ ...prev, currency: e.target.value }));
                        debouncedSave('currency', e.target.value);
                      }}
                      placeholder="INR"
                      disabled={documentSaving === 'currency'}
                    />
                    {documentSaving === 'currency' && (
                      <p className="text-sm text-muted-foreground">Saving...</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                  <Textarea
                    id="terms_conditions"
                    value={documentForm.terms_conditions}
                    onChange={(e) => {
                      setDocumentForm(prev => ({ ...prev, terms_conditions: e.target.value }));
                      debouncedSave('terms_conditions', e.target.value);
                    }}
                    placeholder="Enter terms and conditions"
                    rows={4}
                    disabled={documentSaving === 'terms_conditions'}
                  />
                  {documentSaving === 'terms_conditions' && (
                    <p className="text-sm text-muted-foreground">Saving...</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer_text">Footer Text</Label>
                  <Input
                    id="footer_text"
                    value={documentForm.footer_text}
                    onChange={(e) => {
                      setDocumentForm(prev => ({ ...prev, footer_text: e.target.value }));
                      debouncedSave('footer_text', e.target.value);
                    }}
                    placeholder="Thank you for your business!"
                    disabled={documentSaving === 'footer_text'}
                  />
                  {documentSaving === 'footer_text' && (
                    <p className="text-sm text-muted-foreground">Saving...</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="authorized_signatory_name">Authorized Signatory Name</Label>
                    <Input
                      id="authorized_signatory_name"
                      value={documentForm.authorized_signatory_name}
                      onChange={(e) => {
                        setDocumentForm(prev => ({ ...prev, authorized_signatory_name: e.target.value }));
                        debouncedSave('authorized_signatory_name', e.target.value);
                      }}
                      placeholder="John Doe"
                      disabled={documentSaving === 'authorized_signatory_name'}
                    />
                    {documentSaving === 'authorized_signatory_name' && (
                      <p className="text-sm text-muted-foreground">Saving...</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authorized_signatory_designation">Designation</Label>
                    <Input
                      id="authorized_signatory_designation"
                      value={documentForm.authorized_signatory_designation}
                      onChange={(e) => {
                        setDocumentForm(prev => ({ ...prev, authorized_signatory_designation: e.target.value }));
                        debouncedSave('authorized_signatory_designation', e.target.value);
                      }}
                      placeholder="Managing Director"
                      disabled={documentSaving === 'authorized_signatory_designation'}
                    />
                    {documentSaving === 'authorized_signatory_designation' && (
                      <p className="text-sm text-muted-foreground">Saving...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Preview how your documents will look with the current configuration.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setDocumentType('invoice')}
                      className={documentType === 'invoice' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Invoice
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDocumentType('quotation')}
                      className={documentType === 'quotation' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Quotation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDocumentType('order')}
                      className={documentType === 'order' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Purchase Order
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <SampleDocument 
                      documentType={documentType}
                      documentNumber={`${documentForm[`${documentType}_prefix`] || 'DOC'}-001`}
                      date={new Date().toLocaleDateString()}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
