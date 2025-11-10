import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function GRN() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goods Receipt Note (GRN)</h2>
          <p className="text-muted-foreground">Record and track received goods and materials</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create GRN
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>GRN List</CardTitle>
          <CardDescription>All goods receipt notes will be displayed here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No GRN records found</p>
            <p className="text-sm mt-2">Click "Create GRN" to add a new goods receipt note</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

