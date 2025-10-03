import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import type { Payload } from 'payload';

/**
 * Utility function to get payload instance
 */
export async function getPayloadInstance(): Promise<Payload> {
  return await getPayload({ config: configPromise });
}

/**
 * Utility function to clean up old files from media collection
 */
export async function cleanupOldMedia(daysOld: number = 30): Promise<{ deleted: number }> {
  const payload = await getPayloadInstance();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const oldMedia = await payload.find({
    collection: 'media',
    where: {
      createdAt: {
        less_than: cutoffDate.toISOString(),
      },
    },
  });

  let deleted = 0;
  for (const media of oldMedia.docs) {
    // Check if media is still referenced
    const usersWithAvatar = await payload.find({
      collection: 'users',
      where: {
        avatar: {
          equals: media.id,
        },
      },
    });

    if (usersWithAvatar.docs.length === 0) {
      await payload.delete({
        collection: 'media',
        id: media.id,
      });
      deleted++;
    }
  }

  return { deleted };
}

/**
 * Utility function to regenerate search index
 */
export async function regenerateSearchIndex(): Promise<{ indexed: number }> {
  const payload = await getPayloadInstance();

  const docs = await payload.find({
    collection: 'docs',
    limit: 1000,
  });

  // Here you could integrate with a search service like Algolia, MeiliSearch, etc.
  // For now, we'll just return the count
  return { indexed: docs.docs.length };
}

/**
 * Utility function to export documentation as JSON
 */
export async function exportDocumentation(): Promise<any[]> {
  const payload = await getPayloadInstance();

  const docs = await payload.find({
    collection: 'docs',
    limit: 1000,
  });

  return docs.docs.map(doc => ({
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    content: doc.content,
    order: doc.order,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

/**
 * Utility function to get system statistics
 */
export async function getSystemStats(): Promise<{
  users: number;
  docs: number;
  media: number;
  tools: number;
}> {
  const payload = await getPayloadInstance();

  const [users, docs, media, tools] = await Promise.all([
    payload.count({ collection: 'users' }),
    payload.count({ collection: 'docs' }),
    payload.count({ collection: 'media' }),
    payload.count({ collection: 'tools' }),
  ]);

  return {
    users: users.totalDocs,
    docs: docs.totalDocs,
    media: media.totalDocs,
    tools: tools.totalDocs,
  };
}