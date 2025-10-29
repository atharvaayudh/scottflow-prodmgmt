import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Factory() {
  const [factories, setFactories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<any>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    factory_code: '',
    factory_name: '',
    factory_type: 'Own Factory',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    gstin: '',
    is_active: true
  });
  
  const { toast } = useToast();

  // Fetch factories
  const fetchFactories = async () => {
    try {
      setLoading(true);
      let query = supabase.from('factory_master').select('*');
      
      if (!showInactive) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setFactories(data || []);
    } catch (error) {
      console.error('Error fetching factories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch factories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactories();
  }, [showInactive]);

  // Filter factories by type
  const filteredFactories = factories.filter(factory => {
    const matchesSearch = 
      factory.factory_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factory.factory_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factory.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factory.city?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && factory.factory_type === activeTab;
  });

  // Open dialog for add
  const handleAdd = () => {
    setEditingFactory(null);
    setFormData({
      factory_code: '',
      factory_name: '',
      factory_type: 'Own Factory',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      gstin: '',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (factory: any) => {
    setEditingFactory(factory);
    setFormData({
      factory_code: factory.factory_code || '',
      factory_name: factory.factory_name || '',
      factory_type: factory.factory_type || 'Own Factory',
      contact_person: factory.contact_person || '',
      phone: factory.phone || '',
      email: factory.email || '',
      address: factory.address || '',
      city: factory.city || '',
      state: factory.state || '',
      country: factory.country || 'India',
      pincode: factory.pincode || '',
      gstin: factory.gstin || '',
      is_active: factory.is_active !== undefined ? factory.is_active : true
    });
    setIsDialogOpen(true);
  };

  // Save factory
  const handleSave = async () => {
    try {
      // Validation
      if (!formData.factory_code?.trim()) {
        toast({
          title: "Validation Error",
          description: "Factory Code is required",
          variant: "destructive",
        });
        return;
      }

      if (!formData.factory_name?.trim()) {
        toast({
          title: "Validation Error",
          description: "Factory Name is required",
          variant: "destructive",
        });
        return;
      }

      if (!formData.factory_type) {
        toast({
          title: "Validation Error",
          description: "Factory Type is required",
          variant: "destructive",
        });
        return;
      }

      const dataToSave = {
        factory_code: formData.factory_code,
        factory_name: formData.factory_name,
        factory_type: formData.factory_type,
        contact_person: formData.contact_person || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || 'India',
        pincode: formData.pincode || null,
        gstin: formData.gstin || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingFactory) {
        const { error } = await supabase
          .from('factory_master')
          .update(dataToSave)
          .eq('id', editingFactory.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Factory updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('factory_master')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Factory created successfully",
        });
      }

      setIsDialogOpen(false);
      fetchFactories();
    } catch (error: any) {
      console.error('Error saving factory:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save factory",
        variant: "destructive",
      });
    }
  };

  // Delete factory
  const handleDelete = async (factory: any) => {
    if (!confirm(`Are you sure you want to delete ${factory.factory_name}?`)) return;

    try {
      const { error } = await supabase
        .from('factory_master')
        .delete()
        .eq('id', factory.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Factory deleted successfully",
      });

      fetchFactories();
    } catch (error: any) {
      console.error('Error deleting factory:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete factory",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading factories...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Factory Management</CardTitle>
              <CardDescription>Manage your own factories and jobwork partners</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Factory
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by code, name, contact person, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showInactive ? "default" : "outline"}
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Factory Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All Factories ({factories.length})
              </TabsTrigger>
              <TabsTrigger value="Own Factory">
                Own Factory ({factories.filter(f => f.factory_type === 'Own Factory').length})
              </TabsTrigger>
              <TabsTrigger value="Jobwork Factory">
                Jobwork ({factories.filter(f => f.factory_type === 'Jobwork Factory').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {/* Factory Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Factory Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="w-24">Active</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFactories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No factories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFactories.map((factory) => (
                        <TableRow key={factory.id}>
                          <TableCell>
                            <span className="font-mono text-sm">{factory.factory_code}</span>
                          </TableCell>
                          <TableCell className="font-medium">{factory.factory_name}</TableCell>
                          <TableCell>
                            <Badge variant={factory.factory_type === 'Own Factory' ? 'default' : 'secondary'}>
                              {factory.factory_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{factory.contact_person || '-'}</TableCell>
                          <TableCell>{factory.phone || '-'}</TableCell>
                          <TableCell>{factory.city || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={factory.is_active ? "default" : "secondary"}>
                              {factory.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(factory)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(factory)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFactory ? 'Edit Factory' : 'Add Factory'}
            </DialogTitle>
            <DialogDescription>
              {editingFactory ? 'Update factory details' : 'Create a new factory'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Factory Code */}
            <div>
              <Label htmlFor="factory_code">Factory Code *</Label>
              <Input
                id="factory_code"
                placeholder="e.g., FAC-001"
                value={formData.factory_code}
                onChange={(e) => setFormData({ ...formData, factory_code: e.target.value })}
              />
            </div>

            {/* Factory Name */}
            <div>
              <Label htmlFor="factory_name">Factory Name *</Label>
              <Input
                id="factory_name"
                placeholder="e.g., Main Production Unit"
                value={formData.factory_name}
                onChange={(e) => setFormData({ ...formData, factory_name: e.target.value })}
              />
            </div>

            {/* Factory Type */}
            <div>
              <Label htmlFor="factory_type">Factory Type *</Label>
              <Select
                value={formData.factory_type}
                onValueChange={(value) => setFormData({ ...formData, factory_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select factory type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Own Factory">
                    Own Factory
                  </SelectItem>
                  <SelectItem value="Jobwork Factory">
                    Jobwork Factory
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contact Person */}
            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                placeholder="Name of the contact person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Complete address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>

            {/* City, State, Country, Pincode */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>

            {/* GSTIN */}
            <div>
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                placeholder="GSTIN number"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingFactory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
