import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function People() {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    employee_name: '',
    employee_code: '',
    phone: '',
    email: '',
    department_id: '',
    designation_id: '',
    reporting_manager_id: '',
    joining_date: '',
    address: '',
    is_active: true
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchPeople();
    fetchDepartments();
    fetchDesignations();
  }, [showInactive]);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      let query = supabase.from('people').select('*');
      
      if (!showInactive) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error fetching people:', error);
      toast({
        title: "Error",
        description: "Failed to fetch people",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').eq('is_active', true);
    setDepartments(data || []);
  };

  const fetchDesignations = async () => {
    const { data } = await supabase.from('designations').select('*').eq('is_active', true);
    setDesignations(data || []);
  };

  const handleAdd = () => {
    setEditingPerson(null);
    setFormData({
      employee_name: '',
      employee_code: '',
      phone: '',
      email: '',
      department_id: '',
      designation_id: '',
      reporting_manager_id: '',
      joining_date: '',
      address: '',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (person: any) => {
    setEditingPerson(person);
    setFormData({
      employee_name: person.employee_name || '',
      employee_code: person.employee_code || '',
      phone: person.phone || '',
      email: person.email || '',
      department_id: person.department_id || '',
      designation_id: person.designation_id || '',
      reporting_manager_id: person.reporting_manager_id || '',
      joining_date: person.joining_date || '',
      address: person.address || '',
      is_active: person.is_active !== undefined ? person.is_active : true
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.employee_name || !formData.employee_code) {
        toast({
          title: "Validation Error",
          description: "Employee name and code are required",
          variant: "destructive",
        });
        return;
      }

      const dataToSave = {
        employee_name: formData.employee_name,
        employee_code: formData.employee_code,
        phone: formData.phone || null,
        email: formData.email || null,
        department_id: formData.department_id || null,
        designation_id: formData.designation_id || null,
        reporting_manager_id: formData.reporting_manager_id || null,
        joining_date: formData.joining_date || null,
        address: formData.address || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingPerson) {
        const { error } = await supabase
          .from('people')
          .update(dataToSave)
          .eq('id', editingPerson.id);

        if (error) throw error;

        toast({ title: "Success", description: "Person updated successfully" });
      } else {
        const { error } = await supabase.from('people').insert([dataToSave]);

        if (error) throw error;

        toast({ title: "Success", description: "Person created successfully" });
      }

      setIsDialogOpen(false);
      fetchPeople();
    } catch (error: any) {
      console.error('Error saving person:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save person",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (person: any) => {
    if (!confirm(`Are you sure you want to delete ${person.employee_name}?`)) return;

    try {
      const { error } = await supabase.from('people').delete().eq('id', person.id);
      if (error) throw error;

      toast({ title: "Success", description: "Person deleted successfully" });
      fetchPeople();
    } catch (error: any) {
      console.error('Error deleting person:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete person",
        variant: "destructive",
      });
    }
  };

  const filteredPeople = people.filter(person =>
    person.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading people...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, code, or phone..."
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
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead className="w-24">Active</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeople.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No people found
                </TableCell>
              </TableRow>
            ) : (
              filteredPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell><span className="font-mono text-sm">{person.employee_code}</span></TableCell>
                  <TableCell className="font-medium">{person.employee_name}</TableCell>
                  <TableCell>{person.phone || '-'}</TableCell>
                  <TableCell>{person.email || '-'}</TableCell>
                  <TableCell>{person.department_id ? 'Dept' : '-'}</TableCell>
                  <TableCell>{person.designation_id ? 'Desig' : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={person.is_active ? "default" : "secondary"}>
                      {person.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(person)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(person)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPerson ? 'Edit Person' : 'Add Person'}</DialogTitle>
            <DialogDescription>
              {editingPerson ? 'Update person details' : 'Create a new employee'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_code">Employee Code *</Label>
                <Input
                  id="employee_code"
                  placeholder="EMP-001"
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="employee_name">Employee Name *</Label>
                <Input
                  id="employee_name"
                  placeholder="John Doe"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+91-1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="department_id">Department</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="designation_id">Designation</Label>
                <Select
                  value={formData.designation_id}
                  onValueChange={(value) => setFormData({ ...formData, designation_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map(designation => (
                      <SelectItem key={designation.id} value={designation.id}>
                        {designation.designation_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="joining_date">Joining Date</Label>
                <Input
                  id="joining_date"
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingPerson ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
