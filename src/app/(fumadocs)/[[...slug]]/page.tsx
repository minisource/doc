import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { compileMDX } from '@fumadocs/mdx-remote';
import { getMDXComponents } from '@/mdx-components';
import type { Doc } from '@/payload-types';

// Create MDX components without problematic imports
const safeMDXComponents = {
  ...getMDXComponents(),
  // Remove any components that might cause script issues
};

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

  const mdx = await compileMDX({
    source: doc.content,
    components: safeMDXComponents,
    mdxOptions: {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    },
  });

  return (
    <DocsPage>
      <DocsTitle>{doc.title}</DocsTitle>
      <DocsDescription>{doc.description || ''}</DocsDescription>
      <DocsBody>
        <mdx.body components={safeMDXComponents} />
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
