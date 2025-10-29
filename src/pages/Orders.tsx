import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CreateOrders from './orders/CreateOrders';
import ViewOrders from './orders/ViewOrders';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('view');

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>Create new orders and view existing orders</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view">
                  View Orders
                </TabsTrigger>
                <TabsTrigger value="create">
                  Create New Order
                </TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="mt-4">
                <ViewOrders />
              </TabsContent>

              <TabsContent value="create" className="mt-4">
                <CreateOrders onOrderCreated={() => setActiveTab('view')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
