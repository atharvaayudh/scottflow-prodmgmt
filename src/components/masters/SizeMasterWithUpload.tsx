import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  EyeOff,
  Image as ImageIcon,
  Grid3X3,
  List
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/ui/image-upload';

export default function SizeMasterWithUpload() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  const { toast } = useToast();

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from('size_master').select('*');
      
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
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  // Save data
  const saveData = async () => {
    try {
      if (!formData.size_type || !formData.sizes) {
        toast({
          title: "Validation Error",
          description: "Please fill in Size Type and Sizes fields",
          variant: "destructive",
        });
        return;
      }

      if (editingItem) {
        const { error } = await supabase
          .from('size_master')
          .update(formData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Size updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('size_master')
          .insert([formData]);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Size created successfully",
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
        description: "Failed to save data",
        variant: "destructive",
      });
    }
  };

  // Delete data
  const deleteData = async (id: string) => {
    try {
      const { error } = await supabase
        .from('size_master')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "Success",
        description: "Size deleted successfully",
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
        .from('size_master')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "Success",
        description: `Size ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
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

  // Filter data
  const filteredData = data.filter(item => 
    item.size_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sizes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Search sizes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          
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
      </div>

      {/* Data Display */}
      {viewMode === 'table' ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size Type</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Sizes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.size_type}</TableCell>
                  <TableCell>
                    {item.image_url ? (
                      <div className="flex items-center space-x-2">
                        <img 
                          src={item.image_url} 
                          alt={item.size_type}
                          className="w-12 h-12 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden flex items-center space-x-2">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={item.image_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center space-x-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.sizes?.split(',').map((size: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {size.trim()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredData.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.size_type}</CardTitle>
                  <Badge variant={item.is_active ? 'default' : 'secondary'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image */}
                {item.image_url ? (
                  <div className="relative">
                    <img 
                      src={item.image_url} 
                      alt={item.size_type}
                      className="w-full h-32 object-contain rounded border bg-muted"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-32 bg-muted rounded border flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Image not available</p>
                        <a 
                          href={item.image_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs flex items-center justify-center space-x-1 mt-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View Original</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-muted rounded border flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No image</p>
                    </div>
                  </div>
                )}

                {/* Sizes */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sizes</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.sizes?.split(',').map((size: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {size.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Size' : 'Create New Size'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the size details' : 'Fill in the details to create a new size'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="size_type">
                Size Type <span className="text-red-500">*</span>
              </Label>
              <Input
                id="size_type"
                value={formData.size_type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, size_type: e.target.value }))}
                placeholder="Enter size type (e.g., Clothing, Footwear, Accessories)"
                required
              />
            </div>

            <ImageUpload
              label="Size Chart Image"
              value={formData.image_url || ''}
              onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              bucket="product-images"
              folder="size-charts"
              previewSize="md"
              maxSize={5}
            />

            <div>
              <Label htmlFor="sizes">
                Sizes <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sizes"
                value={formData.sizes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sizes: e.target.value }))}
                placeholder="Enter sizes separated by commas (e.g., S,M,L,XL,2XL,3XL or 38,40,42,44,46)"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate multiple sizes with commas
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active" className="text-sm">
                Active
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveData} disabled={uploading}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Size
        </Button>
      </div>
    </div>
  );
}
