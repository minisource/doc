import type { CollectionConfig } from 'payload';

export const SidebarGroups: CollectionConfig = {
  slug: 'sidebar-groups',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'enabled', 'order'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description for the group',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon name (e.g., "home", "settings")',
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
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'defaultOpen',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this group should be expanded by default',
      },
    },
  ],
  timestamps: true,
};