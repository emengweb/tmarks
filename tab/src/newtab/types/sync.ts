/**
 * NewTab 同步类型定义
 */

import type { Group, Item } from './core'

// ============================================
// 操作类型
// ============================================

export type OperationType = 'create' | 'update' | 'delete'
export type TargetType = 'group' | 'item'

// ============================================
// 操作日志
// ============================================

export interface Operation {
  id: string
  operationType: OperationType
  targetType: TargetType
  targetId: string
  data?: Partial<Group> | Partial<Item>
  timestamp: number
  deviceId: string
}

// ============================================
// 同步请求/响应
// ============================================

export interface SyncPushRequest {
  deviceId: string
  operations: Operation[]
  lastSyncAt?: number
}

export interface SyncPushResponse {
  success: boolean
  syncedCount: number
  conflicts?: Array<{
    operationId: string
    reason: string
  }>
}

export interface SyncPullParams {
  since: number
  deviceId: string
  limit?: number
}

export interface SyncPullResponse {
  operations: Operation[]
  deletedIds: string[]
  hasMore: boolean
  latestTimestamp: number
}

export interface SyncFullResponse {
  groups: Group[]
  items: Item[]
  lastSyncAt: number
}
