import { createOpenAPI } from 'fumadocs-openapi/server';

export const openapi = createOpenAPI({
  async input() {
    // Fetch from CMS API
    const cmsUrl = process.env.CMS_URL || 'http://localhost:3001';
    const response = await fetch(`${cmsUrl}/api/api-specs`);
    if (!response.ok) {
      console.warn('Failed to fetch API specs from CMS, using empty spec');
      return {};
    }
    const specs = await response.json();
    // Use the first spec or merge them
    if (specs.length > 0) {
      const specResponse = await fetch(specs[0].specUrl);
      if (specResponse.ok) {
        return await specResponse.json();
      }
    }
    return {};
  },
});