import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BillsOfMaterial from './procurement/BillsOfMaterial';
import PurchaseOrder from './procurement/PurchaseOrder';
import GRN from './procurement/GRN';

export default function Procurement() {
  const [activeTab, setActiveTab] = useState('bills-of-material');

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Procurement Management</CardTitle>
            <CardDescription>Manage bills of material, purchase orders, and goods receipt notes</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bills-of-material">
                  Bills of Material
                </TabsTrigger>
                <TabsTrigger value="purchase-order">
                  Purchase Order
                </TabsTrigger>
                <TabsTrigger value="grn">
                  GRN
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bills-of-material" className="mt-4">
                <BillsOfMaterial />
              </TabsContent>

              <TabsContent value="purchase-order" className="mt-4">
                <PurchaseOrder />
              </TabsContent>

              <TabsContent value="grn" className="mt-4">
                <GRN />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

