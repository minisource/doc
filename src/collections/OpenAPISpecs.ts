import type { CollectionConfig } from 'payload';

export const OpenAPISpecs: CollectionConfig = {
  slug: 'open-api-specs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'version', 'enabled'],
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
        description: 'Description of this API specification',
      },
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      admin: {
        description: 'API version (e.g., v1, v2, 1.0.0)',
      },
    },
    {
      name: 'specFile',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload your OpenAPI/Swagger JSON or YAML file',
      },
    },
    {
      name: 'baseUrl',
      type: 'text',
      admin: {
        description: 'Base URL for the API (optional, can be overridden in spec)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug for this API documentation (e.g., api/v1)',
      },
    },
    {
      name: 'servers',
      type: 'array',
      admin: {
        description: 'API servers/endpoints',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
    },
    {
      name: 'authentication',
      type: 'group',
      admin: {
        description: 'Authentication configuration',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Bearer Token', value: 'bearer' },
            { label: 'API Key', value: 'apiKey' },
            { label: 'Basic Auth', value: 'basic' },
            { label: 'OAuth2', value: 'oauth2' },
          ],
          defaultValue: 'none',
        },
        {
          name: 'apiKeyName',
          type: 'text',
          admin: {
            condition: (data) => data.authentication?.type === 'apiKey',
            description: 'Name of the API key header/parameter',
          },
        },
        {
          name: 'apiKeyLocation',
          type: 'select',
          options: [
            { label: 'Header', value: 'header' },
            { label: 'Query', value: 'query' },
            { label: 'Cookie', value: 'cookie' },
          ],
          admin: {
            condition: (data) => data.authentication?.type === 'apiKey',
          },
          defaultValue: 'header',
        },
      ],
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