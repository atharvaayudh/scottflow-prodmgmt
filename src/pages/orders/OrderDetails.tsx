import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderAttachments, setOrderAttachments] = useState<any[]>([]);
  const [brandingTypes, setBrandingTypes] = useState<any[]>([]);
  const [factories, setFactories] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  
  // Check if we're coming from BOM page (hide money fields)
  const fromBOM = location.state?.fromBOM || false;

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      fetchBrandingTypes();
      fetchFactories();
      fetchFabrics();
      fetchPeople();
    }
  }, [id]);

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

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });

      setOrder({ ...order, status: newStatus });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getBrandingTypeName = (brandingTypeId: string) => {
    const branding = brandingTypes.find(bt => bt.id === brandingTypeId);
    return branding?.branding_type || branding?.brand_name || brandingTypeId;
  };

  const getFactoryName = (factoryId: string) => {
    const factory = factories.find(f => f.id === factoryId);
    return factory?.factory_name || factory?.name || factoryId;
  };

  const getSalesPerson = (personId: string) => {
    return people.find(p => p.id === personId);
  };

  const groupAttachmentsByType = (attachments: any[]) => {
    const grouped: Record<string, any[]> = {
      mockup: [],
      reference: [],
      attachment: []
    };
    
    attachments.forEach(att => {
      if (att.file_type && grouped[att.file_type]) {
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
            <p className="text-gray-600 mb-4">Order not found</p>
            <Button onClick={() => navigate('/orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedAttachments = groupAttachmentsByType(orderAttachments);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(fromBOM ? '/procurement' : '/orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-sm text-gray-600">{order.order_number}</p>
            </div>
          </div>
          <Badge variant={order.status === 'completed' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
            {order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
          </Badge>
        </div>

        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Customer Name</Label>
                <p className="font-semibold">{order.customer_name}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Customer Phone</Label>
                <p className="font-semibold">{order.customer_phone || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Customer Email</Label>
                <p className="font-semibold">{order.customer_email || '-'}</p>
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
                      <Label className="text-xs text-gray-600">Status</Label>
                <div className="mt-1">
                  <Select
                    value={order.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_production">In Production</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t">
                <Label className="text-xs text-gray-600">Notes</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
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
                
                // Extract fabric details - try multiple possible formats with better fallbacks
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
                    // Use fabric master data as fallback
                    fabricName = fabricName || fabricFromMaster.fabric_name;
                    fabricCode = fabricCode || fabricFromMaster.fabric_code;
                    fabricType = fabricType || fabricFromMaster.fabric_type;
                    composition = composition || fabricFromMaster.composition;
                    fabricGsm = fabricGsm || (fabricFromMaster.gsm ? `${fabricFromMaster.gsm} GSM` : null) || (fabricFromMaster.weight_gsm ? `${fabricFromMaster.weight_gsm} GSM` : null);
                    // Color is selected by user, so don't override it
                    if (!fabricColor || fabricColor === '-') {
                      fabricColor = fabricFromMaster.color || null;
                    }
                  }
                }
                
                // Set defaults for display
                fabricName = fabricName || '-';
                fabricColor = fabricColor || '-';
                fabricGsm = fabricGsm || '-';
                
                return (
                  <Card key={item.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="text-base">Item #{itemIndex + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Basic Information */}
                        <div className={`grid gap-4 ${fromBOM ? 'grid-cols-2 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                          <div>
                            <Label className="text-xs text-gray-600">Product Category</Label>
                            <p className="font-semibold">{specs.category || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Size Type</Label>
                            <p className="font-semibold">{specs.size_type || '-'}</p>
                          </div>
                          {!fromBOM && (
                            <>
                              <div>
                                <Label className="text-xs text-gray-600">Unit Price</Label>
                                <p className="font-semibold">₹{item.unit_price?.toFixed(2) || '0.00'}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">GST %</Label>
                                <p className="font-semibold">{item.gst_percent?.toFixed(2) || '0.00'}%</p>
                              </div>
                            </>
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
                                  <span className="text-sm text-gray-600">Qty: {sizeItem.quantity || 0}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Remarks */}
                        {specs.remarks && (
                          <div className="pt-2 border-t">
                            <Label className="text-xs text-gray-600 mb-2 block">Remarks</Label>
                            <p className="text-sm whitespace-pre-wrap bg-muted p-2 rounded">{specs.remarks}</p>
                          </div>
                        )}

                        {/* Item Summary */}
                        {!fromBOM && (
                          <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                <div className="text-sm text-gray-600">
                                  <span>Total Quantity: </span>
                                  <span className="font-semibold">{totalQty}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span>Subtotal: </span>
                                  <span className="font-semibold">₹{(totalQty * (item.unit_price || 0)).toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <div className="text-sm text-gray-600">
                                  <span>GST Amount: </span>
                                  <span className="font-semibold">₹{item.gst_amount?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="text-lg font-bold">
                                  <span>Item Total: </span>
                                  <span>₹{item.total_price?.toFixed(2) || '0.00'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {fromBOM && (
                          <div className="pt-2 border-t">
                            <div className="text-sm text-gray-600">
                              <span>Total Quantity: </span>
                              <span className="font-semibold">{totalQty}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Order Summary */}
            {!fromBOM && (
              <div className="flex justify-end pt-4 mt-4 border-t">
                <div className="text-right space-y-2 min-w-[200px]">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ₹{orderItems.reduce((sum, item) => {
                        const specs = typeof item.specifications === 'string' 
                          ? JSON.parse(item.specifications || '{}')
                          : item.specifications || {};
                        const qty = Array.isArray(specs.sizes) 
                          ? specs.sizes.reduce((s: number, size: any) => s + (size.quantity || 0), 0)
                          : item.quantity || 0;
                        return sum + (qty * (item.unit_price || 0));
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>GST (per item):</span>
                    <span className="font-medium">
                      ₹{orderItems.reduce((sum, item) => sum + (item.gst_amount || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{order.total_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Images & Attachments */}
        {orderAttachments.length > 0 && (
          <div className="space-y-6">
            {/* Mockup Images */}
            {groupedAttachments.mockup.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mockup Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupedAttachments.mockup.map((att, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <div className="relative aspect-square bg-muted rounded overflow-hidden">
                          <img
                            src={att.file_url}
                            alt={att.file_name || `Mockup ${idx + 1}`}
                            className="w-full h-full object-contain cursor-pointer hover:opacity-90"
                            onClick={() => window.open(att.file_url, '_blank')}
                            onError={(e) => {
                              e.currentTarget.src = '';
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 truncate">{att.file_name || 'mockup.jpg'}</p>
                        {(att.branding_type_id || att.placement || att.measurement) && (
                          <div className="text-xs space-y-1 pt-2 border-t">
                            {att.branding_type_id && (
                              <p><span className="font-medium">Branding:</span> {getBrandingTypeName(att.branding_type_id)}</p>
                            )}
                            {att.placement && (
                              <p><span className="font-medium">Placement:</span> {att.placement}</p>
                            )}
                            {att.measurement && (
                              <p><span className="font-medium">Measurement:</span> {att.measurement}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reference Images */}
            {groupedAttachments.reference.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reference Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupedAttachments.reference.map((att, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <div className="relative aspect-square bg-muted rounded overflow-hidden">
                          <img
                            src={att.file_url}
                            alt={att.file_name || `Reference ${idx + 1}`}
                            className="w-full h-full object-contain cursor-pointer hover:opacity-90"
                            onClick={() => window.open(att.file_url, '_blank')}
                            onError={(e) => {
                              e.currentTarget.src = '';
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 truncate">{att.file_name || 'reference.jpg'}</p>
                        {(att.branding_type_id || att.placement || att.measurement) && (
                          <div className="text-xs space-y-1 pt-2 border-t">
                            {att.branding_type_id && (
                              <p><span className="font-medium">Branding:</span> {getBrandingTypeName(att.branding_type_id)}</p>
                            )}
                            {att.placement && (
                              <p><span className="font-medium">Placement:</span> {att.placement}</p>
                            )}
                            {att.measurement && (
                              <p><span className="font-medium">Measurement:</span> {att.measurement}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {groupedAttachments.attachment.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedAttachments.attachment.map((att, idx) => {
                      const isImage = att.file_url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                      
                      return (
                        <div key={idx} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{att.file_name || `Attachment ${idx + 1}`}</p>
                                <p className="text-xs text-gray-500">{att.mime_type || 'File'}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(att.file_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          {isImage && (
                            <div className="relative aspect-video bg-muted rounded overflow-hidden mt-2">
                              <img
                                src={att.file_url}
                                alt={att.file_name || `Attachment ${idx + 1}`}
                                className="w-full h-full object-contain cursor-pointer hover:opacity-90"
                                onClick={() => window.open(att.file_url, '_blank')}
                                onError={(e) => {
                                  e.currentTarget.src = '';
                                }}
                              />
                            </div>
                          )}
                          {(att.branding_type_id || att.placement || att.measurement) && (
                            <div className="text-xs space-y-1 pt-2 border-t">
                              {att.branding_type_id && (
                                <p><span className="font-medium">Branding:</span> {getBrandingTypeName(att.branding_type_id)}</p>
                              )}
                              {att.placement && (
                                <p><span className="font-medium">Placement:</span> {att.placement}</p>
                              )}
                              {att.measurement && (
                                <p><span className="font-medium">Measurement:</span> {att.measurement}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

