import React from 'react';
import GenericMaster from './GenericMaster';

const fields = [
  {
    key: 'customer_name',
    label: 'Customer Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter customer name'
  },
  {
    key: 'mobile_number',
    label: 'Mobile Number',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter mobile number'
  },
  {
    key: 'city',
    label: 'City',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter city'
  },
  {
    key: 'state',
    label: 'State',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter state'
  },
  {
    key: 'is_active',
    label: 'Active',
    type: 'switch' as const
  }
];

const searchFields = ['customer_name', 'mobile_number', 'city', 'state'];

export default function CustomerMaster() {
  return (
    <GenericMaster
      tableName="customer_master"
      fields={fields}
      title="Customer"
      description="Manage customer information"
      searchFields={searchFields}
    />
  );
}
