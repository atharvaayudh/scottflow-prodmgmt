import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import People from './team/People';
import Departments from './team/Departments';
import Designation from './team/Designation';

export default function Team() {
  const [activeTab, setActiveTab] = useState('people');

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>Manage employees, departments, and designations</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="people">
                  People
                </TabsTrigger>
                <TabsTrigger value="departments">
                  Departments
                </TabsTrigger>
                <TabsTrigger value="designation">
                  Designation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="people" className="mt-4">
                <People />
              </TabsContent>

              <TabsContent value="departments" className="mt-4">
                <Departments />
              </TabsContent>

              <TabsContent value="designation" className="mt-4">
                <Designation />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
