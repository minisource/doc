import React from 'react';
import { notFound } from 'next/navigation';
import { getOpenAPISpecBySlug } from '@/lib/openapi';

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const slug = params.slug.join('/');

  try {
    // Get the OpenAPI spec from Payload CMS
    const spec = await getOpenAPISpecBySlug(slug);

    if (!spec) {
      notFound();
    }

    // TODO: Install fumadocs-openapi package and implement full OpenAPI documentation
    // For now, show a placeholder page
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{spec.title}</h1>
          <p className="text-gray-600 mb-8">{spec.description}</p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">OpenAPI Documentation</h2>
            <p className="text-yellow-700 mb-4">
              Interactive API documentation will be available here once the <code>fumadocs-openapi</code> package is installed.
            </p>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm">
              npm install fumadocs-openapi
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">API Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-gray-600">Version</dt>
                  <dd>{spec.version}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">Base URL</dt>
                  <dd className="font-mono text-sm">{spec.baseUrl || 'Not specified'}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Servers</h3>
              <div className="space-y-2">
                {spec.servers?.map((server: any, index: number) => (
                  <div key={index} className="font-mono text-sm bg-gray-50 p-2 rounded">
                    {server.url}
                    {server.description && (
                      <div className="text-gray-600 text-xs mt-1">{server.description}</div>
                    )}
                  </div>
                )) || (
                  <p className="text-gray-500">No servers configured</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/admin/collections/open-api-specs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage API Specifications
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading API documentation:', error);
    notFound();
  }
}

export async function generateStaticParams() {
  // Since Payload is not available at build time, return empty for now
  // In production, this would be handled by ISR or dynamic rendering
  return [];
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const slug = params.slug.join('/');

  try {
    const spec = await getOpenAPISpecBySlug(slug);

    if (!spec) {
      return {
        title: 'API Documentation',
      };
    }

    return {
      title: `${spec.title} API Documentation`,
      description: spec.description || `API documentation for ${spec.title}`,
    };
  } catch {
    return {
      title: 'API Documentation',
    };
  }
}