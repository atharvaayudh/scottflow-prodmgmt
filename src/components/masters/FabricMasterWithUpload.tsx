import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  List,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/ui/image-upload';

interface Color {
  color_name: string;
  color_hex?: string;
}

export default function FabricMasterWithUpload() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({
    fabric_code: '',
    fabric_name: '',
    color: '',
    gsm: '',
    uom: 'Meters',
    image_url: '',
    is_active: true
  });
  const [colors, setColors] = useState<Color[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  const { toast } = useToast();

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from('fabric_master').select('*');
      
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

  useEffect(() => {
    fetchData();
  }, [showInactive]);


  // Add color
  const addColor = () => {
    if (!colorInput.trim()) return;
    
    const newColor: Color = {
      color_name: colorInput.trim(),
      color_hex: ''
    };
    
    setColors([...colors, newColor]);
    setColorInput('');
  };

  // Remove color
  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // Open dialog for add
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      fabric_code: '',
      fabric_name: '',
      color: '',
      gsm: '',
      uom: 'Meters',
      image_url: '',
      is_active: true
    });
    setColors([]);
    setColorInput('');
    setIsDialogOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      fabric_code: item.fabric_code || '',
      fabric_name: item.fabric_name || '',
      color: item.color || '',
      gsm: item.gsm || '',
      uom: item.uom || 'Meters',
      image_url: item.image_url || '',
      is_active: item.is_active !== undefined ? item.is_active : true
    });
    
    // Parse colors from JSON if it's a string
    let parsedColors = [];
    if (item.colors) {
      if (typeof item.colors === 'string') {
        parsedColors = JSON.parse(item.colors);
      } else {
        parsedColors = item.colors;
      }
    }
    setColors(parsedColors);
    setColorInput('');
    setIsDialogOpen(true);
  };

  // Save data
  const handleSave = async () => {
    try {
      // Validation
      if (!formData.fabric_code?.trim()) {
        toast({
          title: "Validation Error",
          description: "Fabric Code is required",
          variant: "destructive",
        });
        return;
      }

      if (!formData.fabric_name?.trim()) {
        toast({
          title: "Validation Error",
          description: "Fabric Name is required",
          variant: "destructive",
        });
        return;
      }

      const dataToSave = {
        fabric_code: formData.fabric_code,
        fabric_name: formData.fabric_name,
        color: formData.color || null,
        gsm: formData.gsm || null,
        uom: formData.uom || 'Meters',
        colors: colors.length > 0 ? colors : null,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingItem) {
        // Update
        const { error } = await supabase
          .from('fabric_master')
          .update(dataToSave)
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Fabric updated successfully",
        });
      } else {
        // Create
        const { error } = await supabase
          .from('fabric_master')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Fabric created successfully",
        });
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving fabric:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save fabric",
        variant: "destructive",
      });
    }
  };

  // Delete data
  const handleDelete = async (item: any) => {
    if (!confirm(`Are you sure you want to delete ${item.fabric_name}?`)) return;

    try {
      const { error } = await supabase
        .from('fabric_master')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fabric deleted successfully",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting fabric:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete fabric",
        variant: "destructive",
      });
    }
  };

  // Filter data
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.fabric_code?.toLowerCase().includes(searchLower) ||
      item.fabric_name?.toLowerCase().includes(searchLower) ||
      item.color?.toLowerCase().includes(searchLower) ||
      item.gsm?.toString().includes(searchLower)
    );
  });

  // Parse colors from JSON
  const getColors = (colors: any) => {
    if (!colors) return [];
    if (typeof colors === 'string') {
      try {
        return JSON.parse(colors);
      } catch {
        return [];
      }
    }
    return colors;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fabrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fabric Master</CardTitle>
              <CardDescription>Manage fabrics with multiple colors</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
              >
                {viewMode === 'table' ? <Grid3X3 className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
                {viewMode === 'table' ? 'Card View' : 'Table View'}
              </Button>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fabric
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by code, name, color, or GSM..."
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

      {/* Data Display */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Image</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Fabric Name</TableHead>
                    <TableHead>Colors</TableHead>
                    <TableHead>GSM</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead className="w-24">Active</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No fabrics found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => {
                      const fabricColors = getColors(item.colors);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.fabric_name}
                                className="w-16 h-16 object-cover rounded border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{item.fabric_code}</span>
                          </TableCell>
                          <TableCell className="font-medium">{item.fabric_name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {fabricColors.length > 0 ? (
                                fabricColors.map((color: Color, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {color.color_name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.gsm ? `${item.gsm} GSM` : '-'}</TableCell>
                          <TableCell>{item.uom || 'Meters'}</TableCell>
                          <TableCell>
                            <Badge variant={item.is_active ? "default" : "secondary"}>
                              {item.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item) => {
            const fabricColors = getColors(item.colors);
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.fabric_name}
                        className="w-full h-48 object-contain bg-muted"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.fabric_name}</h3>
                        <p className="text-sm text-gray-500 font-mono">{item.fabric_code}</p>
                      </div>
                    </div>
                    
                    {fabricColors.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {fabricColors.map((color: Color, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {color.color_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-4">
                      {item.gsm && <div>GSM: {item.gsm}</div>}
                      <div>UOM: {item.uom || 'Meters'}</div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Fabric' : 'Add Fabric'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update fabric details' : 'Create a new fabric'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Fabric Code */}
            <div>
              <Label htmlFor="fabric_code">Fabric Code *</Label>
              <Input
                id="fabric_code"
                placeholder="e.g., FB-001"
                value={formData.fabric_code}
                onChange={(e) => setFormData({ ...formData, fabric_code: e.target.value })}
              />
            </div>

            {/* Fabric Name */}
            <div>
              <Label htmlFor="fabric_name">Fabric Name *</Label>
              <Input
                id="fabric_name"
                placeholder="e.g., Cotton Twill"
                value={formData.fabric_name}
                onChange={(e) => setFormData({ ...formData, fabric_name: e.target.value })}
              />
            </div>

            {/* GSM */}
            <div>
              <Label htmlFor="gsm">GSM</Label>
              <Input
                id="gsm"
                type="number"
                placeholder="e.g., 180"
                value={formData.gsm}
                onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
              />
            </div>

            {/* UOM */}
            <div>
              <Label htmlFor="uom">Unit of Measurement</Label>
              <Input
                id="uom"
                placeholder="Meters"
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">e.g., Meters, Yards, Rolls</p>
            </div>

            {/* Colors */}
            <div>
              <Label>Colors</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add color (e.g., Red, Blue, Green)"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addColor();
                    }
                  }}
                />
                <Button type="button" onClick={addColor}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Display colors */}
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded bg-gray-50">
                  {colors.map((color, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {color.color_name}
                      <button
                        onClick={() => removeColor(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload Section */}
            <ImageUpload
              label="Fabric Image"
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              bucket="product-images"
              folder="fabrics"
              previewSize="md"
              maxSize={5}
            />

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
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
