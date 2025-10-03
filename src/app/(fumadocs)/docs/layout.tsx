import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { ReactNode } from 'react';
import { getNavOptions } from '@/app/(fumadocs)/layout.config';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { getSidebarNavigation } from '@/lib/navigation';
import type { Doc } from '@/payload-types';

export default async function Layout({ children }: { children: ReactNode }) {
  const payload = await getPayload({ config: configPromise });

  // Get docs for the main tree
  const docs = await payload.find({
    collection: 'docs',
    limit: 1000,
    sort: 'order',
  });

  // Get sidebar navigation from Payload CMS
  const sidebarNav = await getSidebarNavigation();

  // Build the main docs tree
  const docsTree = {
    name: 'docs',
    children: docs.docs.map((doc: Doc) => ({
      type: 'page' as const,
      name: doc.title,
      url: `/docs/${doc.slug}`,
    })),
  };

  // Combine docs tree with sidebar navigation
  const combinedTree = {
    name: 'docs',
    children: [
      ...docsTree.children,
      // Add sidebar groups as folders
      ...sidebarNav.map(group => ({
        type: 'folder' as const,
        name: group.title,
        description: group.description,
        icon: group.icon,
        defaultOpen: group.defaultOpen,
        children: group.items.map(item => ({
          type: 'page' as const,
          name: item.title,
          description: item.description,
          icon: item.icon,
          url: item.href,
          external: item.external,
        })),
      })),
    ],
  };

  // Get navigation options
  const navOptions = await getNavOptions();

  return (
    <DocsLayout tree={combinedTree} {...navOptions}>
      {children}
    </DocsLayout>
  );
}