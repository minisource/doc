import type {File, Payload, PayloadRequest} from "payload";
import {seedMedia} from "../../collections/Media";
import {seedUsers} from "../../collections/Users";
import {promises as fs} from "fs";
import path from "path";

export async function seed({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<{message: string}> {
  payload.logger.info("🌱 Seeding database...");

  await Promise.all(
    ["users", "docs", "tools"].map(async (collection) => {
      if (collection === "users") {
        await payload.db.deleteMany({
          collection: collection as "users",
          req,
          where: {
            // email: { not_equals: 'test@gmail.com' },
          },
        });
      } else {
        await payload.db.deleteMany({collection: collection as any, req, where: {}});
      }

      if (payload.collections[collection as keyof typeof payload.collections].config.versions) {
        await payload.db.deleteVersions({collection: collection as any, req, where: {}});
      }
    })
  );

  const mediaDir = path.resolve("./media");

  try {
    await fs.rm(mediaDir, {recursive: true, force: true});
    payload.logger.info(`🗑 Deleted media directory: ${mediaDir}`);
  } catch (error) {
    payload.logger.warn(
      `⚠ Failed to delete media directory: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  try {
    await seedUsers(payload, req);
    await seedMedia(payload);
    await seedDocs(payload);
    await seedTools(payload);
  } catch (error) {
    payload.logger.error(
      `❌ Error seeding initial data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  payload.logger.info("🎉 Database seeded successfully! 🌱");

  return {message: "Database seeded successfully!"};
}

export async function seedDocs(payload: Payload) {
  payload.logger.info("📄 Seeding docs...");

  const docs = [
    {
      title: "Welcome",
      slug: "index",
      description: "Welcome to our documentation platform",
      content: `# Welcome to Our Documentation Platform

Welcome to our comprehensive documentation platform! This is the core page that users see when they first visit our site.

Here you can find all the information you need to get started and make the most of our platform.

## Getting Started

Check out our [Getting Started guide](/getting-started) to begin your journey.

## Features

- **Easy Navigation**: Intuitive sidebar navigation
- **Search Functionality**: Find what you need quickly
- **Rich Content**: Support for code blocks and formatting
- **CMS Integration**: Full content management through Payload CMS`,
      order: 0,
    },
    {
      title: "Getting Started",
      slug: "getting-started",
      description: "Learn how to get started with our platform",
      content: `# 🚀 Getting Started with Fumadocs

This is a **demo documentation page** built with \`fumadocs\`.
We’ll walk through different components you can use.

---

## 📌 Callouts

<div class="callout callout-info">
This is an **info** callout. Use it to highlight useful information.
</div>

<div class="callout callout-warning">
This is a **warning** callout. Be careful when you see this.
</div>

<div class="callout callout-error">
This is an **error** callout. Something went wrong!
</div>

---

## 📝 Code Blocks

Use fenced code blocks for syntax highlighting.

\`\`\`tsx
// Normal fenced code block
export default function Hello() {
  return <h1>Hello Fumadocs 👋</h1>;
}
\`\`\`

---

## 📋 Steps

1. **First Step**: This is the first step in our process.
2. **Second Step**: Now we're moving to the second step.
3. **Final Step**: This concludes our step-by-step guide.

---

## 🎨 Features

- **Easy Navigation**: Intuitive sidebar navigation
- **Search Functionality**: Find what you need quickly
- **Rich Content**: Support for code blocks and formatting
- **CMS Integration**: Full content management through Payload CMS`,
      order: 1,
    },
    {
      title: "API Reference",
      slug: "api-reference",
      description: "Complete API reference",
      content: `# 📚 API Reference

This section contains the complete API reference for our platform.

## Authentication

### POST /api/auth/login

Authenticate a user and receive an access token.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  }
}
\`\`\`

## Users

### GET /api/users

Retrieve a list of users.

**Query Parameters:**
- \`limit\` (optional): Number of users to return (default: 10)
- \`offset\` (optional): Number of users to skip (default: 0)

**Response:**
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
\`\`\`

### POST /api/users

Create a new user.

**Request Body:**
\`\`\`\`json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "New User"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "New User",
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
\`\`\``,
      order: 2,
    },
  ];

  for (const doc of docs) {
    await payload.create({
      collection: "docs",
      data: doc as any,
    });
    payload.logger.info(`✅ Created doc: ${doc.title}`);
  }

  payload.logger.info("📄 Docs seeded!");
}

export async function seedTools(payload: Payload) {
  payload.logger.info("🔧 Seeding tools...");

  const tools = [
    {
      name: "Media Cleanup",
      description: "Automatically remove unused media files older than 30 days",
      type: "utility",
      enabled: true,
      permissions: ["admin"],
      configuration: {
        daysOld: 30,
        autoRun: false,
      },
    },
    {
      name: "Search Index Rebuild",
      description: "Rebuild the search index for documentation",
      type: "utility",
      enabled: true,
      permissions: ["admin", "editor"],
      configuration: {
        batchSize: 100,
      },
    },
    {
      name: "Documentation Export",
      description: "Export all documentation as JSON for backup or migration",
      type: "utility",
      enabled: true,
      permissions: ["admin"],
      configuration: {
        includeMetadata: true,
        format: "json",
      },
    },
    {
      name: "System Statistics",
      description: "View system statistics and usage metrics",
      type: "analytics",
      enabled: true,
      permissions: ["admin"],
      configuration: {
        refreshInterval: 300, // 5 minutes
      },
    },
    {
      name: "Content Validator",
      description: "Validate documentation content for consistency and completeness",
      type: "content",
      enabled: false,
      permissions: ["admin", "editor"],
      configuration: {
        checkLinks: true,
        checkImages: true,
        minWordCount: 50,
      },
    },
  ];

  for (const tool of tools) {
    await payload.create({
      collection: "tools",
      data: tool as any,
    });
    payload.logger.info(`✅ Created tool: ${tool.name}`);
  }

  payload.logger.info("🔧 Tools seeded!");
}

export async function getOrUploadMedia(
  payload: Payload,
  req: PayloadRequest,
  url: string | undefined,
  filename: string,
  alt: string
): Promise<any> {
  if (!url) return null;

  try {
    const existingMedia = await payload.find({
      collection: "media",
      where: {alt: {equals: alt}},
      limit: 1,
    });

    if (existingMedia.docs.length > 0) {
      payload.logger.info(
        `🔄 Reusing existing media: ${filename} (alt: ${alt})`
      );
      return existingMedia.docs[0];
    }

    payload.logger.info(`📥 Fetching image: ${url}`);
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`Failed to fetch ${url}, status: ${res.status}`);

    const data = Buffer.from(await res.arrayBuffer());

    const contentType =
      res.headers.get("content-type") || "application/octet-stream";

    const uploadedFile = await payload.create({
      collection: "media",
      file: {
        name: filename,
        data,
        mimetype: contentType,
        size: data.length,
      },
      data: {alt},
    });

    payload.logger.info(`✅ Uploaded image: ${filename}`);
    return uploadedFile;
  } catch (error) {
    payload.logger.warn(
      `⚠ Error handling media (${filename}): ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return null;
  }
}
