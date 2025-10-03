import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
// import {s3Storage} from "@payloadcms/storage-s3";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from 'payload'

import { fileURLToPath } from 'url'
import path from 'path'
import sharp from 'sharp'

import {seed} from "./lib/seed";

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Docs } from './collections/Docs'
import { Tools } from './collections/Tools'
import { NavigationLinks } from './collections/NavigationLinks'
import { SidebarGroups } from './collections/SidebarGroups'
import { SidebarItems } from './collections/SidebarItems'
import { Components } from './collections/Components'
import { OpenAPISpecs } from './collections/OpenAPISpecs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  onInit: async (payload) => {
    // Create a mock request for seeding operations
    const mockReq = {} as any;

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    const {totalDocs} = await payload.count({
      collection: "users",
      where: {
        email: {
          equals: adminEmail,
        },
      },
    });

    if (!totalDocs) {
      await seed({payload, req: mockReq});
    }
  },
  sharp,
  debug: true,
  defaultDepth: 3,
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'Español',
        code: 'es',
      },
      {
        label: 'Français',
        code: 'fr',
      },
      {
        label: 'Deutsch',
        code: 'de',
      },
      {
        label: 'فارسی',
        code: 'fa',
      },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  admin: {
  autoLogin:
    process.env.NODE_ENV === "development"
      ? {
          email: process.env.ADMIN_EMAIL || "admin@example.com",
          password: process.env.ADMIN_PASSWORD || "admin",
          prefillOnly: true,
        }
      : false,
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
   collections: [Users, Media, Docs, Tools, NavigationLinks, SidebarGroups, SidebarItems, Components, OpenAPISpecs],
   editor: lexicalEditor(),
   secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE',
   typescript: {
     outputFile: path.resolve(dirname, 'payload-types.ts'),
   },
   serverURL: process.env.NODE_ENV === "development" ? 'http://localhost:3000' : process.env.BASE_URL,
   cors: process.env.CORS_WHITELIST_ORIGINS
     ? process.env.CORS_WHITELIST_ORIGINS.split(",")
     : ["http://localhost:3000"],
   csrf: process.env.CSRF_WHITELIST_ORIGINS
     ? process.env.CSRF_WHITELIST_ORIGINS.split(",")
     : ["http://localhost:3000"],
   db: sqliteAdapter({
     client: {
       url: process.env.DATABASE_URI || process.env.TURSO_DATABASE_URL || 'file:./sqlite.db',
       authToken: process.env.AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || '',
     },
   }),
  plugins: [
    vercelBlobStorage({
      enabled: process.env.NODE_ENV !== "development",
      collections: {
        media: {
          prefix: "./media",
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
    // s3Storage({
    //   enabled: process.env.NODE_ENV !== "development",
    //   collections: {
    //     media: {
    //       prefix: "./media",
    //     },
    //   },
    //   bucket: process.env.S3_BUCKET || "",
    //   config: {
    //     forcePathStyle: true, // Important for using Supabase
    //     credentials: {
    //       accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    //       secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    //     },
    //     region: process.env.S3_REGION || "",
    //     endpoint: process.env.S3_ENDPOINT || "",
    //   },
    // }),
  ],
})
