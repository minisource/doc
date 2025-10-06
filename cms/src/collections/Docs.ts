import type { CollectionConfig } from 'payload'
import { writeFileSync, existsSync, mkdirSync, unlinkSync, readdirSync, readFileSync, rmdirSync } from 'fs'
import { join, dirname } from 'path'

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { data: {}, body: content }

  const frontmatter = match[1]
  const body = match[2]

  const data: any = {}
  frontmatter.split('\n').forEach(line => {
    const [key, ...value] = line.split(':')
    if (key && value.length) {
      const val = value.join(':').trim()
      if (val === 'true') data[key.trim()] = true
      else if (val === 'false') data[key.trim()] = false
      else if (!isNaN(Number(val))) data[key.trim()] = Number(val)
      else data[key.trim()] = val.replace(/^["']|["']$/g, '')
    }
  })

  return { data, body }
}

function removeEmptyDirs(dir: string) {
  try {
    const items = readdirSync(dir)
    if (items.length === 0) {
      rmdirSync(dir)
      // Recursively check parent
      const parent = dirname(dir)
      if (parent !== dir) { // Avoid infinite loop
        removeEmptyDirs(parent)
      }
    }
  } catch (err) {
    // Ignore
  }
}

export const Docs: CollectionConfig = {
  slug: 'docs',
  admin: {
    useAsTitle: 'slug',
  },
  fields: [
    {
      name: 'slug',
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
          if (!existsSync(docsDir)) {
            mkdirSync(docsDir, { recursive: true })
          }
          const filePath = join(docsDir, `${doc.slug}.mdx`)
          mkdirSync(dirname(filePath), { recursive: true })
          writeFileSync(filePath, doc.content, 'utf8')
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const contentDir = existsSync(join(process.cwd(), 'content')) ? 'content' : join('..', 'doc', 'content')
        const filePath = join(process.cwd(), contentDir, 'docs', `${doc.slug}.mdx`)
        try {
          unlinkSync(filePath)
          // Remove empty directories
          removeEmptyDirs(dirname(filePath))
        } catch (err) {
          // File may not exist, ignore
        }
      },
    ],
  },
}