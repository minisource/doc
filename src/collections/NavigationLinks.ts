import type { CollectionConfig } from 'payload';

export const NavigationLinks: CollectionConfig = {
  slug: 'navigation-links',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'url', 'enabled'],
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
        description: 'Display order (lower numbers appear first)',
      },
    },
  ],
  timestamps: true,
};