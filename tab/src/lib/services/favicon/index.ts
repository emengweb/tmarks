/**
 * Favicon 服务统一导出
 */

export * from './types';
export * from './sources';
export * from './utils';
export * from './core';
export * from './batch';

// Legacy support
export { getFaviconUrl as getFaviconUrlLegacy } from './core';
