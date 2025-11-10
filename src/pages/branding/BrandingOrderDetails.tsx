import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

export default function BrandingOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderAttachments, setOrderAttachments] = useState<any[]>([]);
  const [brandingTypes, setBrandingTypes] = useState<any[]>([]);
  const [factories, setFactories] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMockupImage, setSelectedMockupImage] = useState<number>(0);
  const [selectedReferenceImage, setSelectedReferenceImage] = useState<number>(0);
  
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      fetchBrandingTypes();
      fetchFactories();
      fetchFabrics();
      fetchPeople();
    }
  }, [id]);

  // Reset selected images when attachments change
  useEffect(() => {
    const groupAttachmentsByType = (attachments: any[]) => {
      const grouped: Record<string, any[]> = {
        mockup: [],
        reference: [],
        attachment: []
      };
      attachments.forEach(att => {
        if (grouped[att.file_type]) {
          grouped[att.file_type].push(att);
        }
      });
      return grouped;
    };

    const grouped = groupAttachmentsByType(orderAttachments);
    if (grouped.mockup.length > 0 && selectedMockupImage >= grouped.mockup.length) {
      setSelectedMockupImage(0);
    }
    if (grouped.reference.length > 0 && selectedReferenceImage >= grouped.reference.length) {
      setSelectedReferenceImage(0);
    }
  }, [orderAttachments, selectedMockupImage, selectedReferenceImage]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);

      // Fetch order attachments
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('order_attachments')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: true });

      if (attachmentsError) throw attachmentsError;
      setOrderAttachments(attachmentsData || []);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandingTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('branding_master')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setBrandingTypes(data || []);
    } catch (error) {
      console.error('Error fetching branding types:', error);
    }
  };

  const fetchFactories = async () => {
    try {
      const { data, error } = await supabase
        .from('factory_master')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setFactories(data || []);
    } catch (error) {
      console.error('Error fetching factories:', error);
    }
  };

  const fetchFabrics = async () => {
    try {
      const { data, error } = await supabase
        .from('fabric_master')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setFabrics(data || []);
    } catch (error) {
      console.error('Error fetching fabrics:', error);
    }
  };

  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const getFactoryName = (factoryId: string) => {
    const factory = factories.find(f => f.id === factoryId);
    return factory?.factory_name || factory?.name || factoryId;
  };

  const getSalesPerson = (personId: string) => {
    return people.find(p => p.id === personId);
  };

  const getBrandingTypeName = (brandingTypeId: string) => {
    const branding = brandingTypes.find(bt => bt.id === brandingTypeId);
    return branding?.branding_type || branding?.brand_name || brandingTypeId;
  };

  const handleBrandingStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      const updateData: any = { branding_status: newStatus };
      
      // If status is being set to ready_to_dispatch, set the completed timestamp
      if (newStatus === 'ready_to_dispatch' && order.branding_status !== 'ready_to_dispatch') {
        updateData.branding_completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id)
        .select()
        .single();

      if (error) throw error;

      setOrder({ ...order, ...updateData });
      toast({
        title: "Success",
        description: `Branding status updated to ${getBrandingStatusLabel(newStatus)}`,
      });
    } catch (error: any) {
      console.error('Error updating branding status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update branding status",
        variant: "destructive",
      });
    }
  };

  const handleBrandingCompletionDateChange = async (date: string) => {
    if (!order) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ branding_completion_date: date || null })
        .eq('id', order.id);

      if (error) throw error;

      setOrder({ ...order, branding_completion_date: date || null });
      toast({
        title: "Success",
        description: "Expected completion date updated",
      });
    } catch (error: any) {
      console.error('Error updating branding completion date:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update completion date",
        variant: "destructive",
      });
    }
  };

  const getBrandingStatusLabel = (status: string | null) => {
    if (!status) return 'Not Set';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getBrandingStatusColor = (status: string | null) => {
    switch (status) {
      case 'creating_file':
        return 'secondary';
      case 'printing':
        return 'default';
      case 'fusing':
        return 'default';
      case 'ready_to_dispatch':
        return 'default';
      case 'dispatched':
        return 'default';
      default:
        return 'outline';
    }
  };

  const groupAttachmentsByType = (attachments: any[]) => {
    const grouped: Record<string, any[]> = {
      mockup: [],
      reference: [],
      attachment: []
    };
    
    attachments.forEach(att => {
      if (grouped[att.file_type]) {
        grouped[att.file_type].push(att);
      }
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600">Order not found</p>
            <Button onClick={() => navigate('/branding')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Branding Orders
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedAttachments = groupAttachmentsByType(orderAttachments);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/branding')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Branding Orders
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-muted-foreground">Order #{order.order_number}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
          </Badge>
        </div>

        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Order Number</Label>
                <p className="font-semibold font-mono">{order.order_number}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Customer Name</Label>
                <p className="font-semibold">{order.customer_name}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Customer Phone</Label>
                <p className="font-semibold">{order.customer_phone || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Delivery Date</Label>
                <p className="font-semibold">
                  {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Assigned Factory</Label>
                <p className="font-semibold">
                  {order.assigned_factory_id ? getFactoryName(order.assigned_factory_id) : '-'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Sales Team</Label>
                {order.sales_team_id ? (() => {
                  const salesPerson = getSalesPerson(order.sales_team_id);
                  return salesPerson ? (
                    <div className="flex items-center gap-2 mt-1">
                      {salesPerson.avatar_url ? (
                        <img 
                          src={salesPerson.avatar_url} 
                          alt={salesPerson.employee_name} 
                          className="w-8 h-8 rounded-full object-cover border" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-muted-foreground font-semibold">
                            {salesPerson.employee_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <span className="font-semibold">{salesPerson.employee_name}</span>
                    </div>
                  ) : (
                    <p className="font-semibold">-</p>
                  );
                })() : (
                  <p className="font-semibold">-</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-600">Order Status</Label>
                <Badge variant="outline" className="mt-1">
                  {order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                </Badge>
              </div>
              {order.notes && (
                <div className="col-span-full">
                  <Label className="text-xs text-gray-600">Notes</Label>
                  <p className="font-semibold mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Branding Status */}
        <Card>
          <CardHeader>
            <CardTitle>Branding Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branding_status" className="text-sm font-medium mb-2 block">
                  Branding Status
                </Label>
                <Select
                  value={order.branding_status || ''}
                  onValueChange={handleBrandingStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select branding status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creating_file">Creating File</SelectItem>
                    <SelectItem value="printing">Printing</SelectItem>
                    <SelectItem value="fusing">Fusing</SelectItem>
                    <SelectItem value="ready_to_dispatch">Ready to Dispatch</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                  </SelectContent>
                </Select>
                {order.branding_status && (
                  <div className="mt-2 space-y-2">
                    <Badge variant={getBrandingStatusColor(order.branding_status)}>
                      {getBrandingStatusLabel(order.branding_status)}
                    </Badge>
                    {order.branding_status === 'ready_to_dispatch' && order.branding_completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Completed on: {new Date(order.branding_completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="branding_completion_date" className="text-sm font-medium mb-2 block">
                  Expected Completion Date
                </Label>
                <Input
                  id="branding_completion_date"
                  type="date"
                  value={order.branding_completion_date || ''}
                  onChange={(e) => handleBrandingCompletionDateChange(e.target.value)}
                  className="w-full"
                />
                {order.branding_completion_date && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Expected: {new Date(order.branding_completion_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item, itemIndex) => {
                // Parse specifications safely
                let specs: any = {};
                try {
                  if (typeof item.specifications === 'string') {
                    specs = JSON.parse(item.specifications || '{}');
                  } else if (item.specifications) {
                    specs = item.specifications;
                  }
                } catch (e) {
                  console.error('Error parsing specifications:', e, item.specifications);
                  specs = {};
                }
                
                const totalQty = Array.isArray(specs.sizes) 
                  ? specs.sizes.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0)
                  : item.quantity || 0;
                
                // Extract fabric details
                let fabricName = specs.fabric_name || specs.fabric || (item as any).fabric_name || null;
                let fabricColor = specs.fabric_color || specs.color || (item as any).fabric_color || null;
                let fabricGsm = specs.fabric_gsm || specs.gsm || (specs.weight_gsm ? `${specs.weight_gsm} GSM` : null) || (item as any).fabric_gsm || null;
                let fabricCode = specs.fabric_code || (item as any).fabric_code || null;
                let fabricType = specs.fabric_type || (item as any).fabric_type || null;
                let composition = specs.composition || (item as any).composition || null;
                
                // If fabric name exists but other details are missing, try to fetch from fabric_master
                if (fabricName && fabricName !== '-' && (!fabricColor || fabricColor === '-' || !fabricGsm || fabricGsm === '-')) {
                  const fabricFromMaster = fabrics.find(f => 
                    f.fabric_name === fabricName || 
                    f.fabric_code === fabricCode ||
                    (fabricName && f.fabric_name?.toLowerCase() === fabricName.toLowerCase())
                  );
                  
                  if (fabricFromMaster) {
                    fabricName = fabricName || fabricFromMaster.fabric_name;
                    fabricCode = fabricCode || fabricFromMaster.fabric_code;
                    fabricType = fabricType || fabricFromMaster.fabric_type;
                    composition = composition || fabricFromMaster.composition;
                    fabricGsm = fabricGsm || (fabricFromMaster.gsm ? `${fabricFromMaster.gsm} GSM` : null) || (fabricFromMaster.weight_gsm ? `${fabricFromMaster.weight_gsm} GSM` : null);
                    if (!fabricColor || fabricColor === '-') {
                      fabricColor = fabricFromMaster.color || null;
                    }
                  }
                }
                
                // Set defaults for display
                fabricName = fabricName || '-';
                fabricColor = fabricColor || '-';
                fabricGsm = fabricGsm || '-';
                
                // Get branding details
                const brandingDetails = specs.branding || [];
                
                return (
                  <Card key={item.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="text-base">Item #{itemIndex + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs text-gray-600">Product Category</Label>
                            <p className="font-semibold">{specs.category || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Size Type</Label>
                            <p className="font-semibold">{specs.size_type || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Total Quantity</Label>
                            <p className="font-semibold">{totalQty}</p>
                          </div>
                          {specs.remarks && (
                            <div className="col-span-full">
                              <Label className="text-xs text-gray-600">Remarks</Label>
                              <p className="font-semibold">{specs.remarks}</p>
                            </div>
                          )}
                        </div>

                        {/* Fabric Details */}
                        <div className="pt-2 border-t">
                          <Label className="text-xs text-gray-600 mb-3 block font-medium">Fabric Details</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {fabricCode && fabricCode !== '-' && (
                              <div>
                                <Label className="text-xs text-gray-600">Fabric Code</Label>
                                <p className="font-semibold text-sm">{fabricCode}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-xs text-gray-600">Fabric Name</Label>
                              <p className="font-semibold">{fabricName && fabricName !== '-' ? fabricName : <span className="text-gray-400 italic">Not specified</span>}</p>
                            </div>
                            {fabricType && fabricType !== '-' && fabricType && (
                              <div>
                                <Label className="text-xs text-gray-600">Fabric Type</Label>
                                <p className="font-semibold text-sm">{fabricType}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-xs text-gray-600">Fabric Color</Label>
                              <p className="font-semibold">{fabricColor && fabricColor !== '-' ? fabricColor : <span className="text-gray-400 italic">Not specified</span>}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Fabric GSM</Label>
                              <p className="font-semibold">{fabricGsm && fabricGsm !== '-' ? fabricGsm : <span className="text-gray-400 italic">Not specified</span>}</p>
                            </div>
                            {composition && composition !== '-' && (
                              <div className="col-span-full md:col-span-1">
                                <Label className="text-xs text-gray-600">Composition</Label>
                                <p className="font-semibold text-sm">{composition}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Size Breakdown */}
                        {Array.isArray(specs.sizes) && specs.sizes.length > 0 && (
                          <div className="pt-2 border-t">
                            <Label className="text-xs text-gray-600 mb-2 block">Size Breakdown</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {specs.sizes.map((sizeItem: any, sizeIndex: number) => (
                                <div key={sizeIndex} className="flex justify-between items-center p-2 bg-muted rounded">
                                  <span className="text-sm font-medium">{sizeItem.size || 'N/A'}</span>
                                  <span className="text-sm font-semibold">Qty: {sizeItem.quantity || 0}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Branding Details */}
                        {brandingDetails.length > 0 && (
                          <div className="pt-2 border-t">
                            <Label className="text-xs text-gray-600 mb-3 block font-medium">Branding Details</Label>
                            <div className="space-y-3">
                              {brandingDetails.map((branding: any, brandingIndex: number) => (
                                <div key={brandingIndex} className="p-3 border rounded-lg bg-muted/30">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <Label className="text-xs text-gray-600">Branding Type</Label>
                                      <p className="font-semibold text-sm">
                                        {branding.branding_type_id ? getBrandingTypeName(branding.branding_type_id) : '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-600">Placement</Label>
                                      <p className="font-semibold text-sm">{branding.placement || '-'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-600">Measurement</Label>
                                      <p className="font-semibold text-sm">{branding.measurement || '-'}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Images & Attachments */}
        {(groupedAttachments.mockup.length > 0 || groupedAttachments.reference.length > 0 || groupedAttachments.attachment.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Images & Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mockup Images */}
              {groupedAttachments.mockup.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Mockup Images</Label>
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg border bg-muted overflow-hidden group">
                      <img
                        src={groupedAttachments.mockup[selectedMockupImage]?.file_url}
                        alt={`Mockup ${selectedMockupImage + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '';
                        }}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(groupedAttachments.mockup[selectedMockupImage]?.file_url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Thumbnail Strip */}
                    {groupedAttachments.mockup.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {groupedAttachments.mockup.map((att, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedMockupImage(index)}
                            className={cn(
                              "flex-shrink-0 relative w-20 h-20 rounded border-2 overflow-hidden transition-all",
                              index === selectedMockupImage
                                ? 'border-primary ring-2 ring-primary ring-offset-2'
                                : 'border-gray-300 hover:border-primary/50'
                            )}
                          >
                            <img
                              src={att.file_url}
                              alt={`Mockup thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '';
                              }}
                            />
                            {index === selectedMockupImage && (
                              <div className="absolute inset-0 bg-primary/20"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reference Images */}
              {groupedAttachments.reference.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Reference Images</Label>
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg border bg-muted overflow-hidden group">
                      <img
                        src={groupedAttachments.reference[selectedReferenceImage]?.file_url}
                        alt={`Reference ${selectedReferenceImage + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '';
                        }}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(groupedAttachments.reference[selectedReferenceImage]?.file_url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Thumbnail Strip */}
                    {groupedAttachments.reference.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {groupedAttachments.reference.map((att, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedReferenceImage(index)}
                            className={cn(
                              "flex-shrink-0 relative w-20 h-20 rounded border-2 overflow-hidden transition-all",
                              index === selectedReferenceImage
                                ? 'border-primary ring-2 ring-primary ring-offset-2'
                                : 'border-gray-300 hover:border-primary/50'
                            )}
                          >
                            <img
                              src={att.file_url}
                              alt={`Reference thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '';
                              }}
                            />
                            {index === selectedReferenceImage && (
                              <div className="absolute inset-0 bg-primary/20"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {groupedAttachments.attachment.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Attachments</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {groupedAttachments.attachment.map((att, idx) => {
                      const isImage = att.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                      return (
                        <div key={idx} className="border rounded p-3 hover:bg-muted transition-colors">
                          <div className="flex items-center gap-2">
                            {isImage ? (
                              <img
                                src={att.file_url}
                                alt={`Attachment ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded cursor-pointer"
                                onClick={() => window.open(att.file_url, '_blank')}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{att.file_name || 'Attachment'}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = att.file_url;
                                  link.download = att.file_name || 'attachment';
                                  link.target = '_blank';
                                  link.click();
                                }}
                                className="mt-1 h-6 text-xs"
                              >
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

