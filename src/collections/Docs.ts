import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const Docs: CollectionConfig = {
  slug: 'docs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug for the documentation page',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description for SEO and previews',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Markdown content for the documentation page',
      },
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        description: 'Order for sorting pages',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'docs',
      admin: {
        description: 'Parent documentation page for nested structure',
      },
    },
  ],
  timestamps: true,
};