import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import type { OpenApiSpec } from '@/payload-types';

// Conditionally import fumadocs-openapi
let generateOpenAPI: any = null;
try {
  const openapiModule = require('fumadocs-openapi');
  generateOpenAPI = openapiModule.generateOpenAPI;
} catch (error) {
  console.warn('fumadocs-openapi not installed. OpenAPI documentation features will be limited.');
}

/**
 * Get all enabled OpenAPI specifications
 */
export async function getOpenAPISpecs(): Promise<OpenApiSpec[]> {
  const payload = await getPayload({ config: configPromise });

  const specs = await payload.find({
    collection: 'open-api-specs',
    where: {
      enabled: {
        equals: true,
      },
    },
    sort: 'order',
  });

  return specs.docs;
}

/**
 * Get a specific OpenAPI specification by slug
 */
export async function getOpenAPISpecBySlug(slug: string): Promise<OpenApiSpec | null> {
  const payload = await getPayload({ config: configPromise });

  const specs = await payload.find({
    collection: 'open-api-specs',
    where: {
      slug: {
        equals: slug,
      },
      enabled: {
        equals: true,
      },
    },
    limit: 1,
  });

  return specs.docs[0] || null;
}

/**
 * Generate Fumadocs OpenAPI documentation from a spec
 */
export async function generateAPIDocs(spec: OpenApiSpec) {
  try {
    // Get the spec file content
    const payload = await getPayload({ config: configPromise });

    if (!spec.specFile || typeof spec.specFile !== 'object') {
      throw new Error('No spec file found');
    }

    // Get the uploaded file
    const file = await payload.findByID({
      collection: 'media',
      id: spec.specFile.id,
    });

    if (!file.url) {
      throw new Error('Spec file URL not found');
    }

    // Fetch the spec content
    const response = await fetch(file.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch spec file: ${response.statusText}`);
    }

    const specContent = await response.text();

    // Parse the spec (JSON or YAML)
    let specData;
    try {
      specData = JSON.parse(specContent);
    } catch {
      // If JSON parsing fails, assume it's YAML and convert
      // For now, we'll assume JSON - YAML support can be added later
      throw new Error('YAML specs not yet supported. Please use JSON format.');
    }

    // Generate the API documentation
    const docs = generateOpenAPI ? generateOpenAPI(specData, {
      title: spec.title,
      description: spec.description,
      baseUrl: spec.baseUrl,
      servers: spec.servers?.map((server: any) => ({
        url: server.url,
        description: server.description,
      })) || [],
      // Authentication configuration
      ...(spec.authentication?.type && spec.authentication.type !== 'none' && {
        auth: {
          type: spec.authentication.type as any,
          name: spec.authentication.apiKeyName,
          in: spec.authentication.apiKeyLocation as any,
        },
      }),
    }) : null;

    if (!docs) {
      throw new Error('fumadocs-openapi package not installed. Please install it to enable OpenAPI documentation.');
    }

    return docs;
  } catch (error) {
    console.error('Error generating API docs:', error);
    throw error;
  }
}

/**
 * Get all API documentation routes for static generation
 */
export async function getAPIRoutes(): Promise<string[]> {
  const specs = await getOpenAPISpecs();
  return specs.map(spec => `/api/${spec.slug}`);
}