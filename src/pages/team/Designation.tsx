import React from 'react';
import GenericMaster from '@/components/masters/GenericMaster';

const fields = [
  {
    key: 'designation_name',
    label: 'Designation Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter designation name'
  },
  {
    key: 'designation_code',
    label: 'Designation Code',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter designation code'
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea' as const,
    placeholder: 'Enter designation description'
  },
  {
    key: 'is_active',
    label: 'Active',
    type: 'switch' as const
  }
];

const searchFields = ['designation_name', 'designation_code', 'description'];

export default function Designation() {
  return (
    <GenericMaster
      tableName="designations"
      fields={fields}
      title="Designations"
      description="Manage job designations"
      searchFields={searchFields}
    />
  );
}
