# NewTab 数据结构迁移计划

## 当前进度

### ✅ 已完成（第 1-2 批）

1. **类型定义**
   - `tab/src/newtab/types/core.ts` - 核心类型（Group, Item, ItemData）
   - `tab/src/newtab/types/storage.ts` - 存储类型（Settings, Storage）
   - `tab/src/newtab/types/sync.ts` - 同步类型
   - `tab/src/newtab/types/index.ts` - 统一导出
   - `tab/src/newtab/types.old.ts` - 旧类型（用于迁移）

2. **数据迁移工具**
   - `tab/src/newtab/utils/migration.ts` - 迁移函数
   - `tab/src/newtab/utils/helpers.ts` - 通用辅助函数
   - `tab/src/newtab/utils/shortcuts.ts` - 快捷方式辅助函数

3. **Store 重构**
   - `tab/src/newtab/store/types.ts` - Store 类型定义
   - `tab/src/newtab/store/actions/groups.ts` - 分组操作
   - `tab/src/newtab/store/actions/items.ts` - 项目操作
   - `tab/src/newtab/store/actions/folders.ts` - 文件夹操作
   - `tab/src/newtab/store/actions/settings.ts` - 设置操作
   - `tab/src/newtab/store/actions/index.ts` - Actions 导出
   - `tab/src/newtab/store/index.ts` - 主 Store

4. **组件更新**
   - `tab/src/newtab/NewTab.tsx` - 主组件
   - `tab/src/newtab/components/grid/GridContainer.tsx` - 网格容器
   - `tab/src/newtab/components/grid/hooks/useDragHandlers.ts` - 拖拽处理
   - `tab/src/newtab/components/grid/hooks/useGridPagination.ts` - 分页处理
   - `tab/src/newtab/components/layout/GroupSidebar.tsx` - 左侧导航
   - `tab/src/newtab/components/layout/RightSidebar.tsx` - 右侧导航

5. **常量和配置**
   - `tab/src/newtab/constants/index.ts` - 常量定义
   - `tab/src/newtab/hooks/index.ts` - Hooks 导出

---

## 下一步（第 3 批）
- 更新 `browser-sync` 模块适配新数据结构
- 实现 `ensureGroupBookmarkFolderId`
- 实现增量同步逻辑

### 第 4 批：后端 API 更新
- 创建新的后端表结构
- 实现数据迁移脚本
- 更新 API 端点

### 第 5 批：清理旧代码
- 删除旧的类型定义
- 删除旧的 Store 逻辑
- 删除旧的组件代码

---

## 测试检查清单

- [ ] 数据迁移正确（Shortcut → Item）
- [ ] 分组操作正常
- [ ] 项目 CRUD 正常
- [ ] 文件夹嵌套正常
- [ ] 快捷方式点击计数正常
- [ ] 设置保存/加载正常
- [ ] 浏览器书签同步正常
- [ ] 后端同步正常

---

## 回滚方案

如果迁移出现问题：

1. 旧数据已备份在 `shortcuts` 和 `gridItems` 字段
2. 可以通过设置 `migrationVersion = 0` 触发重新迁移
3. 最坏情况：恢复旧版 Store 代码
