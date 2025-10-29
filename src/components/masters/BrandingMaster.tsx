import React from 'react';
import GenericMaster from './GenericMaster';

const fields = [
  {
    key: 'branding_type',
    label: 'Branding Type',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter branding type (e.g., Logo, Text, Pattern, Embroidery)'
  },
  {
    key: 'is_active',
    label: 'Active',
    type: 'switch' as const
  }
];

const searchFields = ['branding_type'];

export default function BrandingMaster() {
  return (
    <GenericMaster
      tableName="branding_master"
      fields={fields}
      title="Branding"
      description="Manage brand information and guidelines"
      searchFields={searchFields}
    />
  );
}
