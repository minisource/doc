import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/(fumadocs)/layout.config';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import type { Doc } from '@/payload-types';

export default async function Layout({ children }: { children: ReactNode }) {
  const payload = await getPayload({ config: configPromise });

  const docs = await payload.find({
    collection: 'docs',
    limit: 1000,
    sort: 'order',
  });

  const tree = {
    name: 'docs',
    children: docs.docs.map((doc: Doc) => ({
      type: 'page' as const,
      name: doc.title,
      url: `/docs/${doc.slug}`,
    })),
  };

  return (
    <DocsLayout tree={tree} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}
