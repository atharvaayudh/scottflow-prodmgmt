import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Shirt, 
  Box, 
  Palette, 
  Ruler, 
  Settings, 
  Users, 
  Building2,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Import individual master components (we'll create these)
import ProductCategoryMaster from '@/components/masters/ProductCategoryMaster';
import FabricMaster from '@/components/masters/FabricMaster';
import ItemMaster from '@/components/masters/ItemMaster';
import BrandingMaster from '@/components/masters/BrandingMaster';
import SizeMaster from '@/components/masters/SizeMaster';
import CustomizationMaster from '@/components/masters/CustomizationMaster';
import CustomerMaster from '@/components/masters/CustomerMaster';
import VendorMaster from '@/components/masters/VendorMaster';

const masterTabs = [
  {
    id: 'product-categories',
    label: 'Product Categories',
    icon: Package,
    description: 'Manage product categories and subcategories',
    color: 'bg-blue-500'
  },
  {
    id: 'fabric',
    label: 'Fabric Master',
    icon: Shirt,
    description: 'Manage fabric types, compositions, and suppliers',
    color: 'bg-green-500'
  },
  {
    id: 'items',
    label: 'Item Master',
    icon: Box,
    description: 'Manage raw materials and finished goods',
    color: 'bg-purple-500'
  },
  {
    id: 'branding',
    label: 'Branding Master',
    icon: Palette,
    description: 'Manage brand information and guidelines',
    color: 'bg-pink-500'
  },
  {
    id: 'sizes',
    label: 'Size Master',
    icon: Ruler,
    description: 'Manage size charts and measurements',
    color: 'bg-orange-500'
  },
  {
    id: 'customization',
    label: 'Customization Master',
    icon: Settings,
    description: 'Manage customization options and pricing',
    color: 'bg-indigo-500'
  },
  {
    id: 'customers',
    label: 'Customer Master',
    icon: Users,
    description: 'Manage customer information and details',
    color: 'bg-teal-500'
  },
  {
    id: 'vendors',
    label: 'Vendor Master',
    icon: Building2,
    description: 'Manage vendor and supplier information',
    color: 'bg-red-500'
  }
];

export default function Masters() {
  const [activeTab, setActiveTab] = useState('product-categories');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTabs = masterTabs.filter(tab =>
    tab.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderMasterContent = () => {
    switch (activeTab) {
      case 'product-categories':
        return <ProductCategoryMaster />;
      case 'fabric':
        return <FabricMaster />;
      case 'items':
        return <ItemMaster />;
      case 'branding':
        return <BrandingMaster />;
      case 'sizes':
        return <SizeMaster />;
      case 'customization':
        return <CustomizationMaster />;
      case 'customers':
        return <CustomerMaster />;
      case 'vendors':
        return <VendorMaster />;
      default:
        return <ProductCategoryMaster />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Masters</h1>
            <p className="text-muted-foreground mt-2">
              Manage master data for your production system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search masters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Master Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Card 
                key={tab.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isActive ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${tab.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {tab.label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Active
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Master Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(() => {
                  const activeTabData = masterTabs.find(tab => tab.id === activeTab);
                  if (!activeTabData) return null;
                  const Icon = activeTabData.icon;
                  return (
                    <>
                      <div className={`p-2 rounded-lg ${activeTabData.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>{activeTabData.label}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activeTabData.description}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderMasterContent()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
