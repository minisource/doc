import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { createFromSource } from 'fumadocs-core/search/server';
import type { Doc } from '@/payload-types';

const mockSource = {
  getPages: async () => {
    const payload = await getPayload({ config: configPromise });

    const docs = await payload.find({
      collection: 'docs',
      limit: 1000,
    });

    return docs.docs
      .filter((doc: Doc) => doc.slug !== 'index') // Exclude home page from search
      .map((doc: Doc) => ({
        slugs: doc.slug.split('/'),
        url: `/${doc.slug}`,
        data: {
          title: doc.title,
          description: doc.description || '',
          body: JSON.stringify(doc.content), // Simple text extraction
        },
      }));
  },
};

export const { GET } = createFromSource(mockSource as any, {
  // https://docs.orama.com/open-source/supported-languages
  language: 'english',
});
