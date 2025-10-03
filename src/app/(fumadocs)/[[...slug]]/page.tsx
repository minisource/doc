import React from 'react';
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
import { processContentWithComponents, getAvailableComponents } from '@/lib/component-renderer';
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

  // Get available components for processing
  const availableComponents = await getAvailableComponents();

  // Process content with components
  const processedContent = processContentWithComponents(doc.content, availableComponents);

  // Convert processed content back to string for MDX compilation
  // For now, we'll use a simple approach - convert the processed content to a basic format
  let contentString = '';

  if (typeof processedContent === 'string') {
    contentString = processedContent;
  } else if (React.isValidElement(processedContent)) {
    // For React elements, we'll create a simple markdown-like representation
    // This is a simplified approach - in production, you'd want more sophisticated processing
    contentString = doc.content; // Fallback to original content for now
  } else {
    contentString = doc.content; // Fallback to original content
  }

  const mdx = await compileMDX({
    source: contentString,
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
        {/* Render processed components directly if they couldn't be converted to MDX */}
        {typeof processedContent !== 'string' && processedContent}
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
