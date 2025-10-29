import React from 'react';
import GenericMaster from './GenericMaster';

const fields = [
  {
    key: 'customization_name',
    label: 'Customization Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter customization name'
  },
  {
    key: 'customization_code',
    label: 'Customization Code',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter unique customization code'
  },
  {
    key: 'customization_type',
    label: 'Customization Type',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'Embroidery', label: 'Embroidery' },
      { value: 'Printing', label: 'Printing' },
      { value: 'Stitching', label: 'Stitching' },
      { value: 'Branding', label: 'Branding' },
      { value: 'Finishing', label: 'Finishing' },
      { value: 'Packaging', label: 'Packaging' },
      { value: 'Other', label: 'Other' }
    ],
    placeholder: 'Select customization type'
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea' as const,
    placeholder: 'Enter customization description'
  },
  {
    key: 'cost_per_unit',
    label: 'Cost per Unit',
    type: 'number' as const,
    placeholder: 'Enter cost per unit'
  },
  {
    key: 'time_required_hours',
    label: 'Time Required (Hours)',
    type: 'number' as const,
    placeholder: 'Enter time required in hours'
  },
  {
    key: 'is_active',
    label: 'Active',
    type: 'switch' as const
  }
];

const searchFields = ['customization_name', 'customization_code', 'description'];

const filterFields = [
  {
    key: 'customization_type',
    label: 'Customization Type',
    options: [
      { value: 'Embroidery', label: 'Embroidery' },
      { value: 'Printing', label: 'Printing' },
      { value: 'Stitching', label: 'Stitching' },
      { value: 'Branding', label: 'Branding' },
      { value: 'Finishing', label: 'Finishing' },
      { value: 'Packaging', label: 'Packaging' },
      { value: 'Other', label: 'Other' }
    ]
  }
];

export default function CustomizationMaster() {
  return (
    <GenericMaster
      tableName="customization_master"
      fields={fields}
      title="Customization"
      description="Manage customization options and pricing"
      searchFields={searchFields}
      filterFields={filterFields}
    />
  );
}
