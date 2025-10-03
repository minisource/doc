import type { CollectionConfig } from 'payload';

export const Tools: CollectionConfig = {
  slug: 'tools',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'enabled'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Utility', value: 'utility' },
        { label: 'Admin Tool', value: 'admin' },
        { label: 'Content Tool', value: 'content' },
        { label: 'Analytics', value: 'analytics' },
      ],
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'configuration',
      type: 'json',
      admin: {
        description: 'Tool-specific configuration options',
      },
    },
    {
      name: 'permissions',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Admin Only', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
        { label: 'Public', value: 'public' },
      ],
    },
  ],
  timestamps: true,
};