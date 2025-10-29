import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface OrderItem {
  id: string;
  product_category: string;
  fabric_name: string;
  fabric_color: string;
  fabric_gsm: string;
  size_type: string;
  size_quantities: SizeQuantity[];
  unit_price: number;
  total_price: number;
  gst_percent?: number;
  remarks: string;
}

interface CreateOrdersProps {
  onOrderCreated: () => void;
}

export default function CreateOrders({ onOrderCreated }: CreateOrdersProps) {
  const [orderData, setOrderData] = useState({
    order_number: '',
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    delivery_date: '',
    notes: '',
    assigned_factory_id: ''
  });
  
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customer_name: '',
    mobile_number: '',
    city: '',
    state: ''
  });
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [factories, setFactories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [sizeTypes, setSizeTypes] = useState<any[]>([]);
  
  const [newItem, setNewItem] = useState({
    product_category: '',
    fabric_name: '',
    fabric_color: '',
    fabric_gsm: '',
    size_type: '',
    size_quantities: [] as SizeQuantity[],
    unit_price: 0,
    gst_percent: 0,
    remarks: ''
  });
  
  const [selectedSizeType, setSelectedSizeType] = useState<any>(null);
  const [selectedFabric, setSelectedFabric] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  // Per-item GST handled in newItem/orderItems

  // Category image picker state
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryView, setCategoryView] = useState<'grid' | 'list'>('grid');
  const [tempSelectedCategoryId, setTempSelectedCategoryId] = useState<string | null>(null);

  // Fabric image picker state
  const [isFabricPickerOpen, setIsFabricPickerOpen] = useState(false);
  const [fabricSearch, setFabricSearch] = useState('');
  const [fabricView, setFabricView] = useState<'grid' | 'list'>('grid');
  const [tempSelectedFabricId, setTempSelectedFabricId] = useState<string | null>(null);

  // Size type image picker state
  const [isSizeTypePickerOpen, setIsSizeTypePickerOpen] = useState(false);
  const [sizeTypeSearch, setSizeTypeSearch] = useState('');
  const [sizeTypeView, setSizeTypeView] = useState<'grid' | 'list'>('grid');
  const [tempSelectedSizeTypeId, setTempSelectedSizeTypeId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchFactories();
    fetchCategories();
    fetchFabrics();
    fetchSizeTypes();
    generateOrderNumber();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customer_master')
      .select('*')
      .eq('is_active', true);
    setCustomers(data || []);
  };

  const fetchFactories = async () => {
    const { data } = await supabase
      .from('factory_master')
      .select('*')
      .eq('is_active', true);
    setFactories(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true);
    setCategories(data || []);
  };

  const fetchFabrics = async () => {
    const { data } = await supabase
      .from('fabric_master')
      .select('*')
      .eq('is_active', true);
    setFabrics(data || []);
  };

  const fetchSizeTypes = async () => {
    const { data } = await supabase
      .from('size_master')
      .select('*')
      .eq('is_active', true);
    setSizeTypes(data || []);
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    setOrderData({ ...orderData, order_number: `ORD-${timestamp}-${random}` });
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setOrderData({
        ...orderData,
        customer_id: customerId,
        customer_name: customer.customer_name,
        customer_email: '',
        customer_phone: customer.mobile_number || ''
      });
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.customer_name || !newCustomer.mobile_number || !newCustomer.city || !newCustomer.state) {
      toast({
        title: "Validation Error",
        description: "All customer fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customer_master')
        .insert([{
          customer_name: newCustomer.customer_name,
          mobile_number: newCustomer.mobile_number,
          city: newCustomer.city,
          state: newCustomer.state,
          is_active: true
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer created successfully",
      });

      // Refresh customers list
      await fetchCustomers();
      
      // Set the newly created customer
      if (data && data[0]) {
        setOrderData({
          ...orderData,
          customer_id: data[0].id,
          customer_name: data[0].customer_name,
          customer_phone: data[0].mobile_number || ''
        });
        setNewItem({ ...newItem }); // Trigger any updates needed
      }

      // Reset and close dialog
      setNewCustomer({
        customer_name: '',
        mobile_number: '',
        city: '',
        state: ''
      });
      setIsCustomerDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    }
  };

  const handleFabricNameChange = (fabricName: string) => {
    const fabric = fabrics.find(f => f.fabric_name === fabricName);
    if (fabric) {
      setSelectedFabric(fabric);
      setNewItem({
        ...newItem,
        fabric_name: fabricName,
        fabric_color: '',
        fabric_gsm: fabric.gsm ? `${fabric.gsm} GSM` : ''
      });
    }
  };

  const handleColorChange = (color: string) => {
    const fabric = fabrics.find(f => f.fabric_name === newItem.fabric_name);
    if (fabric) {
      setNewItem({ ...newItem, fabric_color: color });
    }
  };

  const handleCategoryChange = (category: string) => {
    const categoryData = categories.find(c => c.category_name === category);
    if (categoryData) {
      setSelectedCategory(categoryData);
    }
  };

  const handleSizeTypeChange = (sizeType: string) => {
    const selectedSizeTypeData = sizeTypes.find(s => s.size_type === sizeType);
    if (selectedSizeTypeData && selectedSizeTypeData.sizes) {
      setSelectedSizeType(selectedSizeTypeData);
      
      // Parse sizes if it's a string, otherwise use as-is
      let sizesArray: string[] = [];
      if (typeof selectedSizeTypeData.sizes === 'string') {
        try {
          sizesArray = selectedSizeTypeData.sizes.split(',').map(s => s.trim());
        } catch {
          sizesArray = [selectedSizeTypeData.sizes];
        }
      } else {
        sizesArray = selectedSizeTypeData.sizes;
      }
      
      // Initialize size quantities
      const sizeQuantities: SizeQuantity[] = sizesArray.map(size => ({
        size: size,
        quantity: 0
      }));
      
      setNewItem({
        ...newItem,
        size_type: sizeType,
        size_quantities: sizeQuantities
      });
    }
  };

  const handleAddItem = () => {
    if (!newItem.product_category || !newItem.fabric_name || !newItem.fabric_color || !newItem.size_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Category, Fabric Name, Color, and Size Type)",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one size has quantity > 0
    const hasQuantity = newItem.size_quantities.some(sq => sq.quantity > 0);
    if (!hasQuantity) {
      toast({
        title: "Validation Error",
        description: "Please enter quantity for at least one size",
        variant: "destructive",
      });
      return;
    }

    const totalQuantity = newItem.size_quantities.reduce((sum, sq) => sum + sq.quantity, 0);

    const itemToAdd: OrderItem = {
      id: Date.now().toString(),
      product_category: newItem.product_category,
      fabric_name: newItem.fabric_name,
      fabric_color: newItem.fabric_color,
      fabric_gsm: newItem.fabric_gsm,
      size_type: newItem.size_type,
      size_quantities: newItem.size_quantities,
      unit_price: newItem.unit_price,
      total_price: totalQuantity * newItem.unit_price * (1 + (newItem.gst_percent || 0) / 100),
      remarks: newItem.remarks,
      gst_percent: newItem.gst_percent
    };

    setOrderItems([...orderItems, itemToAdd]);
    setNewItem({
      product_category: '',
      fabric_name: '',
      fabric_color: '',
      fabric_gsm: '',
      size_type: '',
      size_quantities: [],
      unit_price: 0,
      gst_percent: 0,
      remarks: ''
    });
    setSelectedSizeType(null);
    setSelectedFabric(null);
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!orderData.order_number || !orderData.customer_id) {
      toast({
        title: "Validation Error",
        description: "Order number and customer are required",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate totals (per-item GST)
      const subtotal = orderItems.reduce((sum, item) => {
        const qty = item.size_quantities.reduce((s, sq) => s + sq.quantity, 0);
        return sum + qty * item.unit_price;
      }, 0);
      const totalGstAmount = orderItems.reduce((sum, item) => {
        const qty = item.size_quantities.reduce((s, sq) => s + sq.quantity, 0);
        const gst = (qty * item.unit_price) * ((item.gst_percent || 0) / 100);
        return sum + gst;
      }, 0);
      const totalAmount = subtotal + totalGstAmount;

      // Create order
      const { data: orderDataInserted, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderData.order_number,
            customer_name: orderData.customer_name,
            customer_phone: orderData.customer_phone || null,
            status: 'pending',
            total_amount: totalAmount,
            notes: orderData.notes || null,
            delivery_date: orderData.delivery_date || null,
            assigned_factory_id: orderData.assigned_factory_id || null
          }
        ])
        .select();

      if (orderError) throw orderError;

      const orderId = orderDataInserted[0].id;

      // Create order items
      const orderItemsToInsert = orderItems.map(item => {
        const totalQuantity = item.size_quantities.reduce((sum, sq) => sum + sq.quantity, 0);
        return {
          order_id: orderId,
          product_id: null,
          quantity: totalQuantity,
          unit_price: item.unit_price,
          total_price: totalQuantity * item.unit_price * (1 + ((item.gst_percent || 0) / 100)),
          gst_percent: item.gst_percent || 0,
          gst_amount: (totalQuantity * item.unit_price) * ((item.gst_percent || 0) / 100),
          specifications: JSON.stringify({
            category: item.product_category,
            fabric: item.fabric,
            size_type: item.size_type,
            sizes: item.size_quantities,
            remarks: item.remarks
          })
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Order created successfully",
      });

      // Reset form
      setOrderData({
        order_number: '',
        customer_id: '',
        customer_name: '',
        customer_phone: '',
        delivery_date: '',
        notes: '',
        assigned_factory_id: ''
      });
      setOrderItems([]);
      generateOrderNumber();
      onOrderCreated();
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="order_number">Order Number *</Label>
              <Input
                id="order_number"
                value={orderData.order_number}
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="customer_id">Customer *</Label>
              <div className="flex gap-2">
                <Select
                  value={orderData.customer_id}
                  onValueChange={handleCustomerSelect}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.customer_name} - {customer.mobile_number} ({customer.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCustomerDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="customer_phone">Customer Phone</Label>
              <Input
                id="customer_phone"
                placeholder="Enter customer phone"
                value={orderData.customer_phone}
                onChange={(e) => setOrderData({ ...orderData, customer_phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="delivery_date">Delivery Date</Label>
              <Input
                id="delivery_date"
                type="date"
                value={orderData.delivery_date}
                onChange={(e) => setOrderData({ ...orderData, delivery_date: e.target.value })}
              />
            </div>

          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes"
              value={orderData.notes}
              onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Item Form */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="product_category">Product Category *</Label>
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => {
                    setTempSelectedCategoryId(selectedCategory?.id || null);
                    setCategorySearch('');
                    setIsCategoryPickerOpen(true);
                  }}
                  aria-haspopup="dialog"
                  aria-label="Select product category"
                >
                  <span className={newItem.product_category ? "text-foreground" : "text-muted-foreground"}>
                    {newItem.product_category || 'Select category'}
                  </span>
                  <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>

              <div>
                <Label htmlFor="fabric_name">Fabric Name *</Label>
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                  onClick={() => {
                    setTempSelectedFabricId(selectedFabric?.id || null);
                    setFabricSearch('');
                    setIsFabricPickerOpen(true);
                  }}
                  aria-haspopup="dialog"
                  aria-label="Select fabric"
                >
                  <span className={newItem.fabric_name ? "text-foreground" : "text-muted-foreground"}>
                    {newItem.fabric_name || 'Select fabric'}
                  </span>
                  <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>

              <div>
                <Label htmlFor="size_type">Size Type *</Label>
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                  onClick={() => {
                    setTempSelectedSizeTypeId(selectedSizeType?.id || null);
                    setSizeTypeSearch('');
                    setIsSizeTypePickerOpen(true);
                  }}
                  aria-haspopup="dialog"
                  aria-label="Select size type"
                >
                  <span className={newItem.size_type ? "text-foreground" : "text-muted-foreground"}>
                    {newItem.size_type || 'Select size type'}
                  </span>
                  <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Fabric Color and GSM */}
            {newItem.fabric_name && selectedFabric && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fabric_color">Fabric Color *</Label>
                  <Select
                    value={newItem.fabric_color}
                    onValueChange={handleColorChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedFabric.colors && typeof selectedFabric.colors === 'string' ? (
                        JSON.parse(selectedFabric.colors).map((color: any, index: number) => (
                          <SelectItem key={index} value={color.color_name}>
                            {color.color_name}
                          </SelectItem>
                        ))
                      ) : (
                        selectedFabric.colors?.map((color: any, index: number) => (
                          <SelectItem key={index} value={color.color_name}>
                            {color.color_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fabric_gsm">GSM (Auto)</Label>
                  <Input
                    id="fabric_gsm"
                    value={newItem.fabric_gsm}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div />
              </div>
            )}

            

            

            {/* Size Quantities */}
            {newItem.size_quantities.length > 0 && (
              <div className="space-y-2">
                <Label>Size Quantities *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-background rounded border">
                  {newItem.size_quantities.map((sizeQty, index) => (
                    <div key={index} className="flex flex-col gap-1">
                      <Label className="text-xs">{sizeQty.size}</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={sizeQty.quantity}
                        onChange={(e) => {
                          const updatedSizes = [...newItem.size_quantities];
                          updatedSizes[index].quantity = parseInt(e.target.value) || 0;
                          setNewItem({ ...newItem, size_quantities: updatedSizes });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">

              <div>
                <Label htmlFor="unit_price">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="item_gst">GST %</Label>
                <Input
                  id="item_gst"
                  type="number"
                  min="0"
                  step="0.1"
                  value={newItem.gst_percent}
                  onChange={(e) => setNewItem({ ...newItem, gst_percent: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  placeholder="Enter remarks"
                  value={newItem.remarks}
                  onChange={(e) => setNewItem({ ...newItem, remarks: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Button onClick={handleAddItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Fabric Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>GSM</TableHead>
                  <TableHead>Size Type</TableHead>
                  <TableHead>Sizes & Quantities</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No items added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  orderItems.map((item) => {
                    const totalQuantity = item.size_quantities.reduce((sum, sq) => sum + sq.quantity, 0);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_category}</TableCell>
                        <TableCell>{item.fabric_name}</TableCell>
                        <TableCell>{item.fabric_color}</TableCell>
                        <TableCell>{item.fabric_gsm}</TableCell>
                        <TableCell>{item.size_type}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.size_quantities
                              .filter(sq => sq.quantity > 0)
                              .map((sq, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {sq.size}: {sq.quantity}
                                </Badge>
                              ))}
                            <Badge variant="default" className="text-xs">
                              Total: {totalQuantity}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => {
                              const newPrice = parseFloat(e.target.value) || 0;
                              setOrderItems(orderItems.map(i =>
                                i.id === item.id
                                  ? { ...i, unit_price: newPrice, total_price: totalQuantity * newPrice }
                                  : i
                              ));
                            }}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{(totalQuantity * item.unit_price * (1 + ((item.gst_percent || 0) / 100))).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{item.remarks || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Total Summary */}
          {orderItems.length > 0 && (() => {
            const subtotal = orderItems.reduce((sum, item) => {
              const qty = item.size_quantities.reduce((s, sq) => s + sq.quantity, 0);
              return sum + qty * item.unit_price;
            }, 0);
            const gstAmt = orderItems.reduce((sum, item) => {
              const qty = item.size_quantities.reduce((s, sq) => s + sq.quantity, 0);
              return sum + (qty * item.unit_price) * ((item.gst_percent || 0) / 100);
            }, 0);
            const grandTotal = subtotal + gstAmt;
            return (
              <div className="flex justify-end p-4 bg-muted rounded-lg w-full">
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-8 justify-end text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
                  <div className="flex items-center gap-8 justify-end text-sm text-gray-600">
                    <span>GST (per item)</span>
                    <span className="font-medium">₹{gstAmt.toFixed(2)}</span>
            </div>
                  <div className="flex items-center gap-8 justify-end text-lg font-bold">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Creating...' : 'Create Order'}
        </Button>
      </div>

      {/* Create Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>Add a new customer to the system</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new_customer_name">Customer Name *</Label>
              <Input
                id="new_customer_name"
                placeholder="Enter customer name"
                value={newCustomer.customer_name}
                onChange={(e) => setNewCustomer({ ...newCustomer, customer_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="new_mobile_number">Mobile Number *</Label>
              <Input
                id="new_mobile_number"
                placeholder="Enter mobile number"
                value={newCustomer.mobile_number}
                onChange={(e) => setNewCustomer({ ...newCustomer, mobile_number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new_city">City *</Label>
                <Input
                  id="new_city"
                  placeholder="Enter city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="new_state">State *</Label>
                <Input
                  id="new_state"
                  placeholder="Enter state"
                  value={newCustomer.state}
                  onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer}>
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  {/* Category Image Picker */}
  <Dialog open={isCategoryPickerOpen} onOpenChange={setIsCategoryPickerOpen}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Select Product Category</DialogTitle>
        <DialogDescription>Pick a category by image or switch to list view</DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search categories by name or code..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setCategoryView(categoryView === 'grid' ? 'list' : 'grid')}
          >
            {categoryView === 'grid' ? 'List view' : 'Grid view'}
          </Button>
    </div>

        {categoryView === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
            {categories
              .filter(c => {
                const q = categorySearch.toLowerCase();
                return !q || c.category_name?.toLowerCase().includes(q) || c.category_code?.toLowerCase().includes(q);
              })
              .map((c) => {
                const selected = tempSelectedCategoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`text-left rounded border p-2 hover:border-primary focus:outline-none ${selected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTempSelectedCategoryId(c.id)}
                    onDoubleClick={() => {
                      setNewItem({ ...newItem, product_category: c.category_name });
                      setSelectedCategory(c);
                      setIsCategoryPickerOpen(false);
                    }}
                  >
                    <div className="w-full h-28 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {c.image_url ? (
                        <img src={c.image_url} alt={c.category_name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="font-medium text-sm line-clamp-1">{c.category_name}</div>
                      <div className="text-xs text-muted-foreground">{c.category_code}</div>
                    </div>
                  </button>
                );
              })}
          </div>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto rounded border">
            {categories
              .filter(c => {
                const q = categorySearch.toLowerCase();
                return !q || c.category_name?.toLowerCase().includes(q) || c.category_code?.toLowerCase().includes(q);
              })
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 border-b hover:bg-muted ${tempSelectedCategoryId === c.id ? 'bg-muted' : ''}`}
                  onClick={() => setTempSelectedCategoryId(c.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {c.image_url ? (
                        <img src={c.image_url} alt={c.category_name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-[10px] text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{c.category_name}</div>
                      <div className="text-xs text-muted-foreground">{c.category_code}</div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setIsCategoryPickerOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const chosen = categories.find(c => c.id === tempSelectedCategoryId);
            if (chosen) {
              setNewItem({ ...newItem, product_category: chosen.category_name });
              setSelectedCategory(chosen);
            }
            setIsCategoryPickerOpen(false);
          }}
          disabled={!tempSelectedCategoryId}
        >
          Select
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Fabric Image Picker */}
  <Dialog open={isFabricPickerOpen} onOpenChange={setIsFabricPickerOpen}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Select Fabric</DialogTitle>
        <DialogDescription>Pick a fabric by image or switch to list view</DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search fabrics by name or code..."
            value={fabricSearch}
            onChange={(e) => setFabricSearch(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setFabricView(fabricView === 'grid' ? 'list' : 'grid')}
          >
            {fabricView === 'grid' ? 'List view' : 'Grid view'}
          </Button>
        </div>

        {fabricView === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
            {fabrics
              .filter(f => {
                const q = fabricSearch.toLowerCase();
                return !q || f.fabric_name?.toLowerCase().includes(q) || f.fabric_code?.toLowerCase().includes(q);
              })
              .map((f) => {
                const selected = tempSelectedFabricId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`text-left rounded border p-2 hover:border-primary focus:outline-none ${selected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTempSelectedFabricId(f.id)}
                    onDoubleClick={() => {
                      setSelectedFabric(f);
                      setNewItem({
                        ...newItem,
                        fabric_name: f.fabric_name,
                        fabric_color: '',
                        fabric_gsm: f.gsm ? `${f.gsm} GSM` : ''
                      });
                      setIsFabricPickerOpen(false);
                    }}
                  >
                    <div className="w-full h-28 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {f.image_url ? (
                        <img src={f.image_url} alt={f.fabric_name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="font-medium text-sm line-clamp-1">{f.fabric_name}</div>
                      <div className="text-xs text-muted-foreground">{f.fabric_code}</div>
                    </div>
                  </button>
                );
              })}
          </div>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto rounded border">
            {fabrics
              .filter(f => {
                const q = fabricSearch.toLowerCase();
                return !q || f.fabric_name?.toLowerCase().includes(q) || f.fabric_code?.toLowerCase().includes(q);
              })
              .map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 border-b hover:bg-muted ${tempSelectedFabricId === f.id ? 'bg-muted' : ''}`}
                  onClick={() => setTempSelectedFabricId(f.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {f.image_url ? (
                        <img src={f.image_url} alt={f.fabric_name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-[10px] text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{f.fabric_name}</div>
                      <div className="text-xs text-muted-foreground">{f.fabric_code}</div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setIsFabricPickerOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const chosen = fabrics.find(f => f.id === tempSelectedFabricId);
            if (chosen) {
              setSelectedFabric(chosen);
              setNewItem({
                ...newItem,
                fabric_name: chosen.fabric_name,
                fabric_color: '',
                fabric_gsm: chosen.gsm ? `${chosen.gsm} GSM` : ''
              });
            }
            setIsFabricPickerOpen(false);
          }}
          disabled={!tempSelectedFabricId}
        >
          Select
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Size Type Image Picker */}
  <Dialog open={isSizeTypePickerOpen} onOpenChange={setIsSizeTypePickerOpen}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Select Size Type</DialogTitle>
        <DialogDescription>Pick a size type by image or switch to list view</DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search size types..."
            value={sizeTypeSearch}
            onChange={(e) => setSizeTypeSearch(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setSizeTypeView(sizeTypeView === 'grid' ? 'list' : 'grid')}
          >
            {sizeTypeView === 'grid' ? 'List view' : 'Grid view'}
          </Button>
        </div>

        {sizeTypeView === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
            {sizeTypes
              .filter(s => {
                const q = sizeTypeSearch.toLowerCase();
                return !q || s.size_type?.toLowerCase().includes(q);
              })
              .map((s) => {
                const selected = tempSelectedSizeTypeId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`text-left rounded border p-2 hover:border-primary focus:outline-none ${selected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTempSelectedSizeTypeId(s.id)}
                    onDoubleClick={() => {
                      // Reuse existing logic to set sizes for the type
                      handleSizeTypeChange(s.size_type);
                      setIsSizeTypePickerOpen(false);
                    }}
                  >
                    <div className="w-full h-28 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.size_type} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="font-medium text-sm line-clamp-1">{s.size_type}</div>
                    </div>
                  </button>
                );
              })}
          </div>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto rounded border">
            {sizeTypes
              .filter(s => {
                const q = sizeTypeSearch.toLowerCase();
                return !q || s.size_type?.toLowerCase().includes(q);
              })
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 border-b hover:bg-muted ${tempSelectedSizeTypeId === s.id ? 'bg-muted' : ''}`}
                  onClick={() => setTempSelectedSizeTypeId(s.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.size_type} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-[10px] text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{s.size_type}</div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setIsSizeTypePickerOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const chosen = sizeTypes.find(s => s.id === tempSelectedSizeTypeId);
            if (chosen) {
              handleSizeTypeChange(chosen.size_type);
            }
            setIsSizeTypePickerOpen(false);
          }}
          disabled={!tempSelectedSizeTypeId}
        >
          Select
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
    </div>
  );
}
