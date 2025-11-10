import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PurchaseOrder() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Purchase Orders</h2>
          <p className="text-muted-foreground">Create and manage purchase orders for procurement</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders List</CardTitle>
          <CardDescription>All purchase orders will be displayed here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No purchase orders found</p>
            <p className="text-sm mt-2">Click "Create Purchase Order" to add a new purchase order</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

