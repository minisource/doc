import type { CollectionConfig } from 'payload'
import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { join } from 'path'

export const ApiSpecs: CollectionConfig = {
  slug: 'api-specs',
  admin: {
    useAsTitle: 'name',
  },
  auth: { useAPIKey: true },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'specUrl',
      type: 'text',
      label: 'OpenAPI Spec URL',
      required: true,
    },
    {
      name: 'version',
      type: 'text',
      label: 'API Version',
    },
    {
      name: 'baseUrl',
      type: 'text',
      label: 'API Base URL',
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'create' || operation === 'update' && doc.specUrl) {
          try {
            // Fetch the OpenAPI spec
            const response = await fetch(doc.specUrl)
            if (!response.ok) throw new Error(`Failed to fetch spec: ${response.status}`)
            const spec = await response.json()

            // Write to doc's public/swagger.json
            const swaggerPath = join(process.cwd(), '..', 'doc', 'public', 'swagger.json')
            writeFileSync(swaggerPath, JSON.stringify(spec, null, 2), 'utf8')

            // Run the generate script
            execSync(`cd ../doc && npx tsx scripts/generate-api.ts`, { stdio: 'inherit' })

            console.log(`Generated API docs for ${doc.name}`)
          } catch (error) {
            console.error(`Failed to generate API docs for ${doc.name}:`, error)
          }
        }
      },
    ],
  },
}