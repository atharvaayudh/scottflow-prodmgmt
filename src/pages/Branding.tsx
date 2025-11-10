import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Branding() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchOrdersWithBranding();
  }, [statusFilter]);

  const fetchOrdersWithBranding = async () => {
    try {
      setLoading(true);
      
      // First, fetch all order items that have branding
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('order_id, specifications')
        .not('specifications', 'is', null);

      if (itemsError) throw itemsError;

      // Filter items that have branding array with at least one entry
      const ordersWithBranding = new Set<string>();
      
      itemsData?.forEach((item: any) => {
        try {
          const specs = typeof item.specifications === 'string' 
            ? JSON.parse(item.specifications) 
            : item.specifications;
          
          if (specs?.branding && Array.isArray(specs.branding) && specs.branding.length > 0) {
            ordersWithBranding.add(item.order_id);
          }
        } catch (e) {
          // Skip items with invalid JSON
        }
      });

      if (ordersWithBranding.size === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch orders that have branding
      let query = supabase
        .from('orders')
        .select('*')
        .in('id', Array.from(ordersWithBranding));

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: ordersData, error: ordersError } = await query.order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (error: any) {
      console.error('Error fetching orders with branding:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders with branding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: any) => {
    // Navigate to branding order details page (money hidden)
    navigate(`/branding/${order.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'in_production':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'on_hold':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders with branding...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Branding Orders</CardTitle>
            <CardDescription>Orders with branding requirements</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by order number, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_production">In Production</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {loading ? 'Loading...' : 'No orders with branding found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow 
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewOrder(order)}
                        >
                          <TableCell className="font-mono">{order.order_number}</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>{order.customer_email || '-'}</TableCell>
                          <TableCell>{order.customer_phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(order.status)}>
                              {order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewOrder(order);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

