import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { Doc } from '@/payload-types';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const slug = params.slug?.join('/') || 'index';

  const payload = await getPayload({ config: configPromise });

  const docs = await payload.find({
    collection: 'docs',
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  const doc = docs.docs[0] as Doc;
  if (!doc) notFound();

  return (
    <DocsPage>
      <DocsTitle>{doc.title}</DocsTitle>
      <DocsDescription>{doc.description || ''}</DocsDescription>
      <DocsBody>
        {doc.content ? <RichText data={doc.content} /> : <p>No content yet.</p>}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  // Since Payload is not available at build time, return empty for now
  // In production, this would be handled by ISR or dynamic rendering
  return [];
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const slug = params.slug?.join('/') || 'index';

  const payload = await getPayload({ config: configPromise });

  const docs = await payload.find({
    collection: 'docs',
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  const doc = docs.docs[0] as Doc;
  if (!doc) notFound();

  return {
    title: doc.title,
    description: doc.description || '',
  };
}
