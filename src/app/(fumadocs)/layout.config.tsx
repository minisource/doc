import Image from 'next/image'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "Documentation Platform",
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [
  {
      text:'Home',
      url:'/'
  },
  {
      text:'Admin',
      url:'/admin'
  },
  ],
  githubUrl: "https://github.com/MFarabi619/fumadocs-payloadcms",
};
