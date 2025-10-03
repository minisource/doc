import type { CollectionConfig } from 'payload';

export const SidebarItems: CollectionConfig = {
  slug: 'sidebar-items',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'url', 'group', 'enabled'],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description for the item',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon name (e.g., "file", "folder")',
      },
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'sidebar-groups',
      admin: {
        description: 'Parent group (leave empty for root level items)',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'sidebar-items',
      admin: {
        description: 'Parent item for nested structure',
      },
    },
    {
      name: 'external',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Open link in new tab',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        description: 'Display order within group (lower numbers appear first)',
      },
    },
  ],
  timestamps: true,
};