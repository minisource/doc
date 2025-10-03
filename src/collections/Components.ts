import type { CollectionConfig } from 'payload';

export const Components: CollectionConfig = {
  slug: 'components',
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Accordion', value: 'accordion' },
        { label: 'Auto Type Table', value: 'auto-type-table' },
        { label: 'Banner', value: 'banner' },
        { label: 'Code Block', value: 'code-block' },
        { label: 'Files', value: 'files' },
        { label: 'GitHub Info', value: 'github-info' },
        { label: 'Graph View', value: 'graph-view' },
        { label: 'Zoomable Image', value: 'zoomable-image' },
        { label: 'Inline TOC', value: 'inline-toc' },
        { label: 'Steps', value: 'steps' },
        { label: 'Tabs', value: 'tabs' },
        { label: 'Type Table', value: 'type-table' },
        { label: 'Callout', value: 'callout' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this component does',
      },
    },
    {
      name: 'placeholder',
      type: 'text',
      required: true,
      admin: {
        description: 'Text to insert in rich text editor (e.g., {{accordion}})',
      },
    },
    {
      name: 'configuration',
      type: 'json',
      admin: {
        description: 'Component-specific configuration options',
      },
    },
    {
      name: 'preview',
      type: 'textarea',
      admin: {
        description: 'Example usage or preview',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Layout', value: 'layout' },
        { label: 'Content', value: 'content' },
        { label: 'Interactive', value: 'interactive' },
        { label: 'Data Display', value: 'data-display' },
        { label: 'Media', value: 'media' },
      ],
    },
  ],
  timestamps: true,
};