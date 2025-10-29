import React from 'react';
import GenericMaster from './GenericMaster';

const fields = [
  {
    key: 'vendor_name',
    label: 'Vendor Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter vendor name'
  },
  {
    key: 'vendor_code',
    label: 'Vendor Code',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter unique vendor code'
  },
  {
    key: 'vendor_type',
    label: 'Vendor Type',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'Supplier', label: 'Supplier' },
      { value: 'Manufacturer', label: 'Manufacturer' },
      { value: 'Service Provider', label: 'Service Provider' },
      { value: 'Contractor', label: 'Contractor' },
      { value: 'Distributor', label: 'Distributor' },
      { value: 'Other', label: 'Other' }
    ],
    placeholder: 'Select vendor type'
  },
  {
    key: 'contact_person',
    label: 'Contact Person',
    type: 'text' as const,
    placeholder: 'Enter contact person name'
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email' as const,
    placeholder: 'Enter email address'
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'text' as const,
    placeholder: 'Enter phone number'
  },
  {
    key: 'address',
    label: 'Address',
    type: 'textarea' as const,
    placeholder: 'Enter complete address'
  },
  {
    key: 'city',
    label: 'City',
    type: 'text' as const,
    placeholder: 'Enter city'
  },
  {
    key: 'state',
    label: 'State',
    type: 'text' as const,
    placeholder: 'Enter state'
  },
  {
    key: 'pincode',
    label: 'Pincode',
    type: 'text' as const,
    placeholder: 'Enter pincode'
  },
  {
    key: 'country',
    label: 'Country',
    type: 'text' as const,
    placeholder: 'Enter country'
  },
  {
    key: 'gstin',
    label: 'GSTIN',
    type: 'text' as const,
    placeholder: 'Enter GSTIN number'
  },
  {
    key: 'pan',
    label: 'PAN',
    type: 'text' as const,
    placeholder: 'Enter PAN number'
  },
  {
    key: 'bank_details',
    label: 'Bank Details',
    type: 'json' as const,
    placeholder: 'Enter bank details as JSON'
  },
  {
    key: 'payment_terms',
    label: 'Payment Terms',
    type: 'text' as const,
    placeholder: 'Enter payment terms'
  },
  {
    key: 'is_active',
    label: 'Active',
    type: 'switch' as const
  }
];

const searchFields = ['vendor_name', 'vendor_code', 'contact_person', 'email', 'phone'];

const filterFields = [
  {
    key: 'vendor_type',
    label: 'Vendor Type',
    options: [
      { value: 'Supplier', label: 'Supplier' },
      { value: 'Manufacturer', label: 'Manufacturer' },
      { value: 'Service Provider', label: 'Service Provider' },
      { value: 'Contractor', label: 'Contractor' },
      { value: 'Distributor', label: 'Distributor' },
      { value: 'Other', label: 'Other' }
    ]
  }
];

export default function VendorMaster() {
  return (
    <GenericMaster
      tableName="vendor_master"
      fields={fields}
      title="Vendor"
      description="Manage vendor and supplier information"
      searchFields={searchFields}
      filterFields={filterFields}
    />
  );
}
