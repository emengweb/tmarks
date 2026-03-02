/**
 * 书签整理器统一导出
 */

export { BookmarkOrganizer } from './organizer'
export type { OrganizeOptions, SuggestedGroup, OrganizeProgress, OrganizeResult, ParsedBookmarkData } from './types'

// 单例
import { BookmarkOrganizer } from './organizer'
export const bookmarkOrganizer = new BookmarkOrganizer()
