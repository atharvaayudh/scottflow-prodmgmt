import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function BillsOfMaterial() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .neq('status', 'completed') // Exclude completed orders
        .neq('status', 'cancelled'); // Also exclude cancelled orders

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: any) => {
    navigate(`/orders/${order.id}`, { state: { fromBOM: true } });
  };

  const handleDeleteOrder = async (order: any) => {
    if (!confirm(`Are you sure you want to delete order ${order.order_number}?`)) return;

    try {
      // Delete order items first
      await supabase.from('order_items').delete().eq('order_id', order.id);
      
      // Delete order
      const { error } = await supabase.from('orders').delete().eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });

      fetchOrders();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete order",
        variant: "destructive",
      });
    }
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

  const getBrandingStatusLabel = (status: string | null) => {
    if (!status) return null;
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

  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bills of Material</h2>
          <p className="text-muted-foreground">Orders requiring material procurement (excluding completed orders)</p>
        </div>
      </div>

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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_production">In Production</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders for Material Procurement</CardTitle>
          <CardDescription>All non-completed orders that require material procurement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Branding Status</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {loading ? 'Loading...' : 'No orders found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow 
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
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
                        {order.branding_status ? (
                          <Badge variant={getBrandingStatusColor(order.branding_status)}>
                            {getBrandingStatusLabel(order.branding_status)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

