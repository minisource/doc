import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { getNavigationLinks } from '@/lib/navigation';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: process.env.FUMADOCS_TITLE || "Documentation Platform",
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  // Navigation links are now loaded dynamically from Payload CMS
  links: [], // Will be populated dynamically
  githubUrl: process.env.FUMADOCS_GITHUB_URL || "https://github.com/MiniSource/doc",
};

/**
 * Get navigation options - either dynamic from Payload CMS or static fallback
 */
export async function getNavOptions(): Promise<BaseLayoutProps> {
  const useDynamicNav = (process.env.FUMADOCS_USE_DYNAMIC_NAV || 'true').toLowerCase() === 'true';

  if (useDynamicNav) {
    try {
      const navLinks = await getNavigationLinks();
      return {
        ...baseOptions,
        links: navLinks,
      };
    } catch (error) {
      console.warn('Failed to load dynamic navigation, using fallback:', error);
      // Fallback to static navigation
      return {
        ...baseOptions,
        links: [
          { text: 'Home', url: '/' },
          { text: 'Admin', url: '/admin' },
        ],
      };
    }
  } else {
    // Use static navigation
    return {
      ...baseOptions,
      links: [
        { text: 'Home', url: '/' },
        { text: 'Admin', url: '/admin' },
      ],
    };
  }
}
