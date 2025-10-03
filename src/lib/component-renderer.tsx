import React from 'react';
import { Callout } from 'fumadocs-ui/components/callout';
import type { Component } from '@/payload-types';

// Simple component registry for basic components
const componentRegistry: Record<string, React.ComponentType<any>> = {
  callout: Callout,
  // Add more components as they become available
};

/**
 * Process rich text content and replace component placeholders with actual components
 */
export function processContentWithComponents(
  content: any,
  availableComponents: Component[]
): React.ReactNode {
  if (!content || typeof content !== 'object') {
    return content;
  }

  // Create a map of placeholders to components for quick lookup
  const componentMap = new Map<string, Component>();
  availableComponents.forEach(comp => {
    if (comp.placeholder) {
      componentMap.set(comp.placeholder, comp);
    }
  });

  // Recursively process the content tree
  const processNode = (node: any): React.ReactNode => {
    if (typeof node === 'string') {
      // Check for component placeholders in text
      const placeholderRegex = /\{\{([^}]+)\}\}/g;
      const parts = node.split(placeholderRegex);

      if (parts.length > 1) {
        return parts.map((part: string, index: number) => {
          if (index % 2 === 1) { // Odd indices are placeholders
            const component = componentMap.get(`{{${part}}}`);
            if (component) {
              return renderComponent(component, `comp-${index}`);
            }
          }
          return part;
        });
      }

      return node;
    }

    if (Array.isArray(node)) {
      return node.map(processNode);
    }

    if (node && typeof node === 'object') {
      if (node.type === 'text') {
        return processNode(node.text);
      }

      // Handle different node types
      const children = node.children ? node.children.map(processNode) : undefined;

      switch (node.type) {
        case 'paragraph':
          return React.createElement('p', { key: Math.random() }, children);
        case 'heading':
          const level = node.tag || 'h1';
          return React.createElement(level, { key: Math.random() }, children);
        case 'list':
          const listType = node.listType === 'bullet' ? 'ul' : 'ol';
          return React.createElement(listType, { key: Math.random() }, children);
        case 'listitem':
          return React.createElement('li', { key: Math.random() }, children);
        case 'quote':
          return React.createElement('blockquote', { key: Math.random() }, children);
        case 'code':
          return React.createElement('code', { key: Math.random() }, children);
        default:
          return React.createElement('div', { key: Math.random() }, children);
      }
    }

    return node;
  };

  return processNode(content);
}

/**
 * Render a specific component based on its configuration
 */
function renderComponent(component: Component, key: string): React.ReactNode {
  // Parse configuration
  let config: any = {};
  try {
    config = component.configuration ? JSON.parse(component.configuration as string) : {};
  } catch (e) {
    console.warn(`Invalid configuration for component ${component.name}:`, e);
  }

  // Render based on component type with appropriate props
  switch (component.type) {
    case 'callout':
      return (
        <Callout key={key} type={config.type || 'info'}>
          {config.content || component.description || 'Callout content'}
        </Callout>
      );

    case 'accordion':
      return (
        <div key={key} className="border rounded-lg p-4 my-4">
          <details className="cursor-pointer">
            <summary className="font-semibold">
              {config.title || component.name}
            </summary>
            <div className="mt-2">
              {config.content || component.description || 'Accordion content'}
            </div>
          </details>
        </div>
      );

    case 'banner':
      return (
        <div key={key} className={`p-4 my-4 rounded-lg border ${
          config.variant === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          config.variant === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          {config.content || component.description || 'Banner content'}
        </div>
      );

    case 'code-block':
      return (
        <pre key={key} className="bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto">
          <code className={`language-${config.lang || 'javascript'}`}>
            {config.code || '// Code content'}
          </code>
        </pre>
      );

    case 'steps':
      return (
        <div key={key} className="my-4">
          <ol className="list-decimal list-inside space-y-2">
            {(config.steps || ['Step 1', 'Step 2', 'Step 3']).map((step: string, index: number) => (
              <li key={index} className="text-gray-700">
                {step}
              </li>
            ))}
          </ol>
        </div>
      );

    case 'tabs':
      return (
        <div key={key} className="my-4">
          <div className="border-b border-gray-200">
            {(config.tabs || [{ title: 'Tab 1', content: 'Content 1' }]).map((tab: any, index: number) => (
              <button key={index} className="px-4 py-2 border-b-2 border-transparent hover:border-gray-300">
                {tab.title}
              </button>
            ))}
          </div>
          <div className="p-4">
            {(config.tabs || [{ title: 'Tab 1', content: 'Content 1' }])[0]?.content || 'Tab content'}
          </div>
        </div>
      );

    case 'inline-toc':
      return (
        <div key={key} className="bg-gray-50 p-4 rounded-lg my-4">
          <h4 className="font-semibold mb-2">Table of Contents</h4>
          <p className="text-sm text-gray-600">Inline TOC component placeholder</p>
        </div>
      );

    case 'type-table':
      return (
        <div key={key} className="overflow-x-auto my-4">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2">Type</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {(config.types || []).map((type: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2 font-mono">{type.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{type.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return (
        <div key={key} className="bg-gray-100 p-4 rounded-lg my-4 border-l-4 border-blue-500">
          <h4 className="font-semibold">{component.name}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {component.description || `Component: ${component.type}`}
          </p>
          {component.preview && (
            <div className="mt-2 text-xs text-gray-500">
              Preview: {component.preview}
            </div>
          )}
        </div>
      );
  }
}

/**
 * Get all available components for the admin interface
 */
export async function getAvailableComponents() {
  const { getPayload } = await import('payload');
  const configPromise = await import('@/payload.config');

  const payload = await getPayload({ config: configPromise.default });

  const components = await payload.find({
    collection: 'components',
    where: {
      enabled: {
        equals: true,
      },
    },
  });

  return components.docs;
}