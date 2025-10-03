import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import type { NavigationLink, SidebarGroup, SidebarItem } from '@/payload-types';

/**
 * Get navigation links for layout (header navigation)
 */
export async function getNavigationLinks(): Promise<Array<{
  text: string;
  url: string;
  external?: boolean;
}>> {
  const payload = await getPayload({ config: configPromise });

  const links = await payload.find({
    collection: 'navigation-links',
    where: {
      enabled: {
        equals: true,
      },
    },
    sort: 'order',
  });

  return links.docs.map((link: NavigationLink) => ({
    text: link.label,
    url: link.url,
    external: link.external || false,
  }));
}

/**
 * Get sidebar navigation structure
 */
export async function getSidebarNavigation(): Promise<Array<{
  title: string;
  description?: string;
  icon?: string;
  defaultOpen?: boolean;
  items: Array<{
    title: string;
    description?: string;
    icon?: string;
    href: string;
    external?: boolean;
  }>;
}>> {
  const payload = await getPayload({ config: configPromise });

  // Get all enabled groups
  const groups = await payload.find({
    collection: 'sidebar-groups',
    where: {
      enabled: {
        equals: true,
      },
    },
    sort: 'order',
  });

  // Get all enabled items
  const items = await payload.find({
    collection: 'sidebar-items',
    where: {
      enabled: {
        equals: true,
      },
    },
    sort: 'order',
    depth: 2, // Include relationships
  });

  // Build the sidebar structure
  const sidebar = groups.docs.map((group: SidebarGroup) => {
    // Find items belonging to this group
    const groupItems = items.docs
      .filter((item: SidebarItem) => {
        // Check if item belongs to this group
        if (typeof item.group === 'object' && item.group?.id === group.id) {
          return true;
        }
        return false;
      })
      .map((item: SidebarItem) => ({
        title: item.label,
        description: item.description || undefined,
        icon: item.icon || undefined,
        href: item.url,
        external: item.external || false,
      }));

    return {
      title: group.title,
      description: group.description || undefined,
      icon: group.icon || undefined,
      defaultOpen: group.defaultOpen || false,
      items: groupItems,
    };
  });

  return sidebar;
}

/**
 * Get combined navigation data for Fumadocs
 */
export async function getNavigationData() {
  const [navLinks, sidebar] = await Promise.all([
    getNavigationLinks(),
    getSidebarNavigation(),
  ]);

  return {
    links: navLinks,
    sidebar,
  };
}