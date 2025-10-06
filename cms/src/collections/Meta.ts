import type { CollectionConfig } from 'payload'
import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'

export const Meta: CollectionConfig = {
  slug: 'meta',
  admin: {
    useAsTitle: 'path',
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'create' || operation === 'update') {
          const contentDir = existsSync(join(process.cwd(), 'content')) ? 'content' : join('..', 'doc', 'content')
          const docsDir = join(process.cwd(), contentDir, 'docs')
          const filePath = join(docsDir, doc.path, 'meta.json')
          mkdirSync(dirname(filePath), { recursive: true })
          writeFileSync(filePath, doc.content, 'utf8')
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const contentDir = existsSync(join(process.cwd(), 'content')) ? 'content' : join('..', 'doc', 'content')
        const filePath = join(process.cwd(), contentDir, 'docs', doc.path, 'meta.json')
        try {
          unlinkSync(filePath)
        } catch (err) {
          // File may not exist, ignore
        }
      },
    ],
  },
}