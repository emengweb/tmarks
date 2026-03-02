// ============ Tab Groups (OneTab-like feature) ============

export interface TabGroup {
  id?: number;
  title: string;
  createdAt: number;
  remoteId?: string;
  itemCount?: number;
}

export interface TabGroupItem {
  id?: number;
  groupId: number;
  title: string;
  url: string;
  favicon?: string;
  position: number;
  createdAt: number;
}

export interface TabGroupInput {
  title?: string;
  parent_id?: string | null;
  items: Array<{
    title: string;
    url: string;
    favicon?: string;
  }>;
  [key: string]: unknown; // 允许额外的字段
}

export interface TabGroupResult {
  success: boolean;
  groupId?: string;
  offline?: boolean;
  message?: string;
  error?: string;
}
