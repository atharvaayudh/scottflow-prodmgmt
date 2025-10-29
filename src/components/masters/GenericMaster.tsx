import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MasterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'switch' | 'json';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface GenericMasterProps {
  tableName: string;
  fields: MasterField[];
  title: string;
  description: string;
  searchFields: string[];
  filterFields?: { key: string; label: string; options: { value: string; label: string }[] }[];
}

export default function GenericMaster({ 
  tableName, 
  fields, 
  title, 
  description,
  searchFields,
  filterFields = []
}: GenericMasterProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showInactive, setShowInactive] = useState(false);
  
  const { toast } = useToast();

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from(tableName).select('*');
      
      // Apply filters
      if (!showInactive) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: `Failed to fetch data from ${tableName}. Please check if the table exists.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save data
  const saveData = async () => {
    try {
      // Check if all required fields are filled
      const requiredFields = fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => !formData[field.key]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`,
          variant: "destructive",
        });
        return;
      }
      
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from(tableName)
          .update(formData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from(tableName)
          .insert([formData]);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Item created successfully",
        });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Error",
        description: `Failed to save data to ${tableName}. Please check if the table exists and has the correct structure.`,
        variant: "destructive",
      });
    }
  };

  // Delete data
  const deleteData = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error",
        description: "Failed to delete data",
        variant: "destructive",
      });
    }
  };

  // Toggle active status
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "Success",
        description: `Item ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  // Filter data based on search and filters
  const filteredData = data.filter(item => {
    const matchesSearch = searchFields.some(field => 
      item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilters = Object.entries(filters).every(([key, value]) => 
      !value || value === 'all' || item[key] === value
    );
    
    return matchesSearch && matchesFilters;
  });

  useEffect(() => {
    fetchData();
  }, [showInactive]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {filterFields.map((filter) => (
          <Select
            key={filter.key}
            value={filters[filter.key] || ''}
            onValueChange={(value) => setFilters(prev => ({ ...prev, [filter.key]: value }))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value || 'none'}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive" className="text-sm">
            Show Inactive
          </Label>
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field) => (
                <TableHead key={field.key}>{field.label}</TableHead>
              ))}
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                {fields.map((field) => (
                  <TableCell key={field.key}>
                    {field.type === 'switch' ? (
                      <Badge variant={item[field.key] ? 'default' : 'secondary'}>
                        {item[field.key] ? 'Yes' : 'No'}
                      </Badge>
                    ) : field.type === 'json' ? (
                      <pre className="text-xs bg-muted p-1 rounded">
                        {JSON.stringify(item[field.key], null, 2)}
                      </pre>
                    ) : (
                      item[field.key] || '-'
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Badge variant={item.is_active ? 'default' : 'secondary'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(item.id, item.is_active)}
                    >
                      {item.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteData(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${title}` : `Create New ${title}`}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the item details' : 'Fill in the details to create a new item'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <Label htmlFor={field.key}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                
                {field.type === 'text' || field.type === 'email' ? (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : field.type === 'number' ? (
                  <Input
                    id={field.key}
                    type="number"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) || 0 }))}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={3}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.key] || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, [field.key]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value || 'none'}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'switch' ? (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={field.key}
                      checked={formData[field.key] || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [field.key]: checked }))}
                    />
                    <Label htmlFor={field.key} className="text-sm">
                      {formData[field.key] ? 'Yes' : 'No'}
                    </Label>
                  </div>
                ) : field.type === 'json' ? (
                  <Textarea
                    id={field.key}
                    value={formData[field.key] ? JSON.stringify(formData[field.key], null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFormData(prev => ({ ...prev, [field.key]: parsed }));
                      } catch {
                        setFormData(prev => ({ ...prev, [field.key]: e.target.value }));
                      }
                    }}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                  />
                ) : null}
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveData}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add New {title}
        </Button>
      </div>
    </div>
  );
}
