/**
 * 组件注册表 - 简化版
 */

import type { ItemType } from '../../types/core';

// 获取组件默认配置（保留为空函数）
export function getDefaultWidgetConfig(_type: ItemType): Record<string, unknown> {
  return {};
}

// 获取组件元数据（保留为空函数）
export function getWidgetMeta(_type: ItemType): unknown {
  return null;
}
