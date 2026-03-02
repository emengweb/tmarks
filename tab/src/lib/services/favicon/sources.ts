/**
 * Favicon 源管理
 */

import type { FaviconSource } from './types';

export const FAVICON_SOURCES: FaviconSource[] = [
  {
    id: 'google',
    name: 'Google Favicon Service',
    urlTemplate: 'https://www.google.com/s2/favicons?domain={domain}&sz={size}',
    priority: 1,
    requiresNetwork: true,
    available: true,
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo Icon Service',
    urlTemplate: 'https://icons.duckduckgo.com/ip3/{domain}.ico',
    priority: 2,
    requiresNetwork: true,
    available: true,
  },
  {
    id: 'yandex',
    name: 'Yandex Favicon Service',
    urlTemplate: 'https://favicon.yandex.net/favicon/{domain}',
    priority: 3,
    requiresNetwork: true,
    available: true,
  },
  {
    id: 'direct',
    name: 'Direct Favicon',
    urlTemplate: '{url}/favicon.ico',
    priority: 4,
    requiresNetwork: true,
    available: true,
  },
];

let isOnline = navigator.onLine;
let isExtensionContext = false;

try {
  isExtensionContext = Boolean(chrome?.runtime?.id);
} catch {
  isExtensionContext = false;
}

window.addEventListener('online', () => { isOnline = true; updateSourceAvailability(); });
window.addEventListener('offline', () => { isOnline = false; updateSourceAvailability(); });

export function detectEnvironment() {
  return { isOnline, isExtensionContext };
}

export function updateSourceAvailability() {
  const { isOnline: online } = detectEnvironment();
  FAVICON_SOURCES.forEach(source => {
    source.available = !source.requiresNetwork || online;
  });
}

export function getAvailableSources(specifiedSources?: string[]): FaviconSource[] {
  updateSourceAvailability();
  
  let sources = FAVICON_SOURCES.filter(s => s.available);
  
  if (specifiedSources && specifiedSources.length > 0) {
    sources = sources.filter(s => specifiedSources.includes(s.id));
  }
  
  return sources.sort((a, b) => a.priority - b.priority);
}

export async function testSourceAvailability(
  sourceId: string,
  testDomain: string = 'google.com'
): Promise<boolean> {
  const source = FAVICON_SOURCES.find(s => s.id === sourceId);
  if (!source) return false;

  try {
    const testUrl = source.urlTemplate
      .replace('{domain}', testDomain)
      .replace('{size}', '32')
      .replace('{url}', `https://${testDomain}`);

    const response = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
    return response.ok || response.type === 'opaque';
  } catch {
    return false;
  }
}

export async function getAllSourcesStatus(): Promise<
  Array<{ id: string; name: string; available: boolean; tested: boolean }>
> {
  const results = await Promise.all(
    FAVICON_SOURCES.map(async (source) => ({
      id: source.id,
      name: source.name,
      available: source.available,
      tested: await testSourceAvailability(source.id),
    }))
  );
  return results;
}
