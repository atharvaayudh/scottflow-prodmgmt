import React from 'react';
import GenericMaster from '@/components/masters/GenericMaster';

const fields = [
  {
    key: 'department_name',
    label: 'Department Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter department name'
  },
  {
    key: 'department_code',
    label: 'Department Code',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter department code'
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea' as const,
    placeholder: 'Enter department description'
  },
  {
    key: 'is_active',
    label: 'Active',
    type: 'switch' as const
  }
];

const searchFields = ['department_name', 'department_code', 'description'];

export default function Departments() {
  return (
    <GenericMaster
      tableName="departments"
      fields={fields}
      title="Departments"
      description="Manage company departments"
      searchFields={searchFields}
    />
  );
}
