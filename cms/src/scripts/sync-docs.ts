import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { getPayload } from 'payload'
import config from '../payload.config'
import 'dotenv/config'

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

async function syncDocs() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const contentDir = existsSync(join(process.cwd(), 'content')) ? join(process.cwd(), 'content') : join(process.cwd(), '..', 'doc', 'content')
  const docsDir = join(contentDir, 'docs')

  if (!existsSync(docsDir)) {
    console.log('Docs directory does not exist')
    return
  }

  const files = readdirSync(docsDir).filter(file => file.endsWith('.mdx'))

  // Get all existing docs
  const existingDocs = await payload.find({
    collection: 'docs',
    limit: 1000
  })

  const existingSlugs = new Set(existingDocs.docs.map(doc => doc.slug))

  // Import or update from files
  for (const file of files) {
    const filePath = join(docsDir, file)
    const content = readFileSync(filePath, 'utf8')
    const { data, body } = parseFrontmatter(content)

    const slug = file.replace('.mdx', '')

    const docData = {
      slug,
      content,
    }

    if (existingSlugs.has(slug)) {
      // Update if changed
      const existing = existingDocs.docs.find(doc => doc.slug === slug)
      if (existing && existing.content !== docData.content) {
        try {
          await payload.update({
            collection: 'docs',
            id: existing.id,
            data: docData as any
          })
          console.log(`Updated ${slug}`)
        } catch (err) {
          console.log(`Failed to update ${slug}: ${(err as Error).message}`)
        }
      }
    } else {
      try {
        await payload.create({
          collection: 'docs',
          data: docData as any
        })
        console.log(`Imported ${slug}`)
      } catch (err) {
        console.log(`Skipped ${slug}, invalid data: ${(err as Error).message}`)
      }
    }
  }

  // Delete docs not in files
  for (const doc of existingDocs.docs) {
    if (!files.includes(`${doc.slug}.mdx`)) {
      await payload.delete({
        collection: 'docs',
        id: doc.id
      })
      console.log(`Deleted ${doc.slug}`)
    }
  }

  console.log('Sync complete')
  process.exit(0)
}

syncDocs().catch((err) => {
  console.error(err)
  process.exit(1)
})