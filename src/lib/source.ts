import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import type { LoaderOutput, Page, Root, Item } from 'fumadocs-core/source';
import type { Doc } from '@/payload-types';

// Custom source that fetches from Payload CMS
class PayloadSource implements LoaderOutput<any> {
  private pages: Page<any>[] = [];
  private pageTree: Root | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    const payload = await getPayload({ config: configPromise });

    const docs = await payload.find({
      collection: 'docs',
      limit: 1000,
      sort: 'order',
    });

    this.pages = docs.docs.map((doc: Doc) => ({
      slugs: doc.slug.split('/'),
      url: `/docs/${doc.slug}`,
      data: {
        title: doc.title,
        description: doc.description || '',
        body: doc.content, // Lexical JSON
      },
      path: doc.slug,
      absolutePath: doc.slug,
    }));

    // Build simple page tree
    this.pageTree = {
      name: 'docs',
      children: this.pages.map(page => ({
        type: 'page',
        name: page.slugs[page.slugs.length - 1],
        url: page.url,
        icon: undefined,
      })),
    };
  }

  getPage(slugs: string[] | undefined) {
    if (!slugs) return undefined;
    return this.pages.find(page => page.slugs.join('/') === slugs.join('/'));
  }

  getPages() {
    return this.pages;
  }

  getPageTree() {
    return this.pageTree!;
  }

  getLanguages() {
    return [{ language: 'en', pages: this.pages }];
  }

  generateParams() {
    return this.pages.map(page => ({ slug: page.slugs }));
  }

  // Implement other methods as needed
  getPageByHref(href: string) {
    const url = new URL(href, 'http://localhost:3000');
    const slugs = url.pathname.replace('/docs/', '').split('/');
    return { page: this.getPage(slugs)!, hash: url.hash };
  }

  getNodePage(node: Item) {
    if (node.type === 'page') {
      return this.pages.find(p => p.url === node.url);
    }
    return undefined;
  }

  getNodeMeta() {
    return undefined;
  }
}

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = new PayloadSource();
