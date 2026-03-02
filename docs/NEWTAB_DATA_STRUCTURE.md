# NewTab 数据结构设计方案（长期使用版）

## 设计原则

### 1. 单一数据源（Single Source of Truth）
- 只有一种数据结构表示内容项
- 避免多套并行的数据模型
- 减少同步和转换的复杂度

### 2. 可扩展性（Extensibility）
- 支持未来添加新类型（Widget、Note、Todo 等）
- 不需要修改核心数据结构
- 通过类型字段和配置字段扩展

### 3. 层级清晰（Clear Hierarchy）
- 明确的父子关系
- 支持无限层级嵌套
- 便于实现文件夹、分组等功能

### 4. 同步友好（Sync-Friendly）
- 支持多设备同步
- 支持增量更新
- 冲突解决机制

### 5. 性能优先（Performance First）
- 扁平化存储，避免深层嵌套
- 索引友好的数据结构
- 支持懒加载和分页

---

## 核心数据模型

### 方案 A：统一网格项模型（推荐 ⭐⭐⭐⭐⭐）

#### 概念层级
```
Workspace（工作区）
  └── Group（分组/空间）
       └── Item（项目）
            └── Item（子项目）
                 └── Item（孙项目）
```

#### 数据结构

**Group（分组）**
- 代表一个独立的工作空间
- 左侧导航栏显示
- 可以关联浏览器书签文件夹

**Item（项目）**
- 统一的内容单元
- 通过 `type` 字段区分类型
- 通过 `parentId` 建立层级关系
- 所有类型共享相同的基础字段

#### 优点
1. **极简设计**：只有两个核心概念（Group + Item）
2. **无限扩展**：添加新类型只需增加 type 值
3. **统一操作**：所有项目使用相同的 CRUD 接口
4. **层级灵活**：支持任意深度的嵌套
5. **同步简单**：只需同步两张表
6. **查询高效**：扁平化存储，索引友好

#### 缺点
1. 类型特定字段需要可选（通过 TypeScript 类型守卫解决）
2. 需要运行时类型检查（性能影响可忽略）

---

### 方案 B：多表模型

#### 概念层级
```
Workspace
  └── Group
       ├── Shortcut
       ├── Folder
       │    └── Shortcut
       └── Widget
```

#### 数据结构

**独立的表/类型**
- `Shortcut`：快捷方式
- `Folder`：文件夹
- `Widget`：组件
- `Note`：笔记
- ...

#### 优点
1. 类型明确，字段专用
2. 符合传统数据库设计
3. 类型安全性更强

#### 缺点
1. **扩展困难**：每增加一种类型需要新建表/接口
2. **操作复杂**：不同类型需要不同的 API
3. **同步复杂**：需要同步多张表
4. **代码冗余**：大量重复的 CRUD 代码
5. **层级受限**：难以实现统一的层级关系

---

## 推荐方案：统一网格项模型

### 为什么选择方案 A？

#### 1. 长期维护成本低
- 新增功能不需要修改核心结构
- 代码量少，易于理解和维护
- 减少 Bug 的可能性

#### 2. 适应未来需求
- 可以轻松添加：Todo、Note、Calendar、RSS、Weather 等
- 支持用户自定义类型
- 支持插件系统

#### 3. 同步机制简单
- 只需要同步 `groups` 和 `items` 两张表
- 增量同步只需要记录操作日志
- 冲突解决策略统一

#### 4. 性能优秀
- 扁平化存储，查询快速
- 索引简单（user_id, group_id, parent_id, position）
- 支持高效的分页和懒加载

#### 5. 开发效率高
- 统一的 CRUD 接口
- 可复用的组件和逻辑
- 减少重复代码

---

## 详细设计

### 1. 核心实体

#### Group（分组）
**用途**：组织和隔离不同的内容空间

**字段**：
- `id`：唯一标识
- `name`：分组名称
- `icon`：图标（Lucide 图标名）
- `position`：排序位置
- `color`：主题色（可选）
- `bookmarkFolderId`：浏览器书签文件夹 ID（用于同步）
- `createdAt`：创建时间
- `updatedAt`：更新时间

**特殊分组**：
- `home`：默认分组，不可删除
- 用户可创建任意数量的自定义分组

---

#### Item（项目）
**用途**：表示所有类型的内容单元

**基础字段**（所有类型共享）：
- `id`：唯一标识
- `type`：类型标识
- `groupId`：所属分组
- `parentId`：父项目 ID（null = 根级）
- `position`：排序位置
- `browserBookmarkId`：浏览器书签 ID
- `serverItemId`：服务器端 ID
- `createdAt`：创建时间
- `updatedAt`：更新时间
- `deletedAt`：软删除时间（用于同步）

**类型特定字段**（根据 type 使用）：
- `data`：JSON 对象，存储类型特定数据

---

### 2. 支持的类型

#### 当前类型
1. **shortcut**（快捷方式）
   - url：网址
   - title：标题
   - favicon：图标
   - clickCount：点击次数
   - lastClickedAt：最后点击时间

2. **folder**（文件夹）
   - title：标题
   - icon：图标（可选）
   - isExpanded：是否展开（UI 状态）

#### 未来类型（预留）
3. **widget**（组件）
   - widgetType：组件类型（clock, weather, todo, calendar 等）
   - config：组件配置

4. **note**（笔记）
   - title：标题
   - content：内容（Markdown）
   - tags：标签

5. **rss**（RSS 订阅）
   - feedUrl：订阅地址
   - title：标题
   - updateInterval：更新间隔

6. **custom**（自定义）
   - 用户自定义类型
   - 支持插件扩展

---

### 3. 层级关系

#### 规则
- 每个 Item 只能有一个 `parentId`
- `parentId = null` 表示根级项目
- 支持无限层级嵌套
- 只有 `folder` 类型可以作为父项目

#### 示例层级
```
Group: 工作
  ├── Item (folder): 前端开发
  │    ├── Item (shortcut): GitHub
  │    ├── Item (shortcut): Stack Overflow
  │    └── Item (folder): React 资源
  │         ├── Item (shortcut): React 官网
  │         └── Item (shortcut): React Router
  │
  ├── Item (shortcut): Gmail
  └── Item (widget): Todo List
```

---

### 4. 同步机制

#### 三层同步架构
```
localStorage（本地存储）
    ↕
Browser Bookmarks（浏览器书签）
    ↕
Server（TMarks 服务器）
```

#### 同步策略

**本地 ↔ 浏览器书签**
- 实时双向同步
- 使用 `browserBookmarkId` 关联
- 写锁机制防止循环同步
- 只同步 `shortcut` 和 `folder` 类型

**本地 ↔ 服务器**
- 增量同步（基于操作日志）
- 使用 `serverItemId` 关联
- 冲突解决：最后写入优先（LWW）
- 同步所有类型

#### 操作日志
- 记录所有 CUD 操作（Create, Update, Delete）
- 包含时间戳、设备 ID、操作类型
- 用于增量同步和冲突解决

---

### 5. 数据存储

#### 前端（localStorage）
```
newtab: {
  groups: Group[],
  items: Item[],
  activeGroupId: string,
  settings: Settings,
  syncState: {
    lastSyncAt: number,
    deviceId: string
  }
}
```

#### 后端（数据库）

**表结构**：
1. `newtab_groups`
   - 存储分组信息
   - 索引：user_id, position

2. `newtab_items`
   - 存储所有项目
   - 索引：user_id, group_id, parent_id, position, type

3. `newtab_operations`
   - 存储操作日志
   - 索引：user_id, timestamp, device_id

4. `newtab_sync_state`
   - 存储同步状态
   - 索引：user_id, device_id

---

### 6. API 设计

#### RESTful API
```
GET    /api/newtab/groups              # 获取分组列表
POST   /api/newtab/groups              # 创建分组
PATCH  /api/newtab/groups/:id          # 更新分组
DELETE /api/newtab/groups/:id          # 删除分组

GET    /api/newtab/items               # 获取项目列表（支持过滤）
POST   /api/newtab/items               # 创建项目
PATCH  /api/newtab/items/:id           # 更新项目
DELETE /api/newtab/items/:id           # 删除项目

GET    /api/newtab/sync/pull           # 拉取增量更新
POST   /api/newtab/sync/push           # 推送本地更改
GET    /api/newtab/sync/full           # 全量同步
```

---

### 7. 类型系统

#### TypeScript 类型定义

**核心类型**：
- `Group`：分组
- `Item`：项目（基础）
- `ItemType`：类型枚举
- `ItemData`：类型特定数据的联合类型

**类型守卫**：
- `isShortcut(item)`：判断是否为快捷方式
- `isFolder(item)`：判断是否为文件夹
- `isWidget(item)`：判断是否为组件

**辅助类型**：
- `ShortcutItem`：快捷方式项目（Item + shortcut data）
- `FolderItem`：文件夹项目（Item + folder data）
- `WidgetItem`：组件项目（Item + widget data）

---

### 8. 迁移策略

#### 阶段 1：前端迁移（1-2 周）
1. 创建新的类型定义
2. 实现数据迁移函数（Shortcut → Item）
3. 更新 Store 使用新数据结构
4. 更新所有组件使用新 API
5. 保留旧数据作为备份

#### 阶段 2：后端迁移（1 周）
1. 创建新表结构
2. 数据迁移脚本（旧表 → 新表）
3. 实现新 API
4. 前端切换到新 API
5. 验证数据完整性

#### 阶段 3：清理（1 周）
1. 删除旧代码
2. 删除旧表
3. 删除旧 API
4. 更新文档

---

### 9. 性能优化

#### 查询优化
- 按 group_id 分页加载
- 只加载当前分组的项目
- 懒加载子项目（展开文件夹时加载）

#### 缓存策略
- localStorage 作为一级缓存
- 内存缓存活跃分组的数据
- 图标缓存（favicon）

#### 同步优化
- 批量操作合并为一次同步
- 防抖延迟同步（500ms）
- 后台定时同步（5 分钟）

---

### 10. 安全性

#### 数据验证
- 前端：TypeScript 类型检查
- 后端：Schema 验证（Zod）
- URL 白名单（可选）

#### 权限控制
- 用户只能访问自己的数据
- API Key 认证
- 设备 ID 验证

#### 数据备份
- 定期导出到本地文件
- 支持导入恢复
- 版本历史（可选）

---

## 对比总结

| 维度 | 方案 A（统一模型） | 方案 B（多表模型） |
|------|-------------------|-------------------|
| 扩展性 | ⭐⭐⭐⭐⭐ 极易扩展 | ⭐⭐ 需要修改核心结构 |
| 维护成本 | ⭐⭐⭐⭐⭐ 极低 | ⭐⭐ 较高 |
| 代码量 | ⭐⭐⭐⭐⭐ 少 | ⭐⭐ 多 |
| 同步复杂度 | ⭐⭐⭐⭐⭐ 简单 | ⭐⭐ 复杂 |
| 性能 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 良好 |
| 类型安全 | ⭐⭐⭐⭐ 需要类型守卫 | ⭐⭐⭐⭐⭐ 原生支持 |
| 学习曲线 | ⭐⭐⭐⭐⭐ 平缓 | ⭐⭐⭐ 陡峭 |
| 灵活性 | ⭐⭐⭐⭐⭐ 极高 | ⭐⭐⭐ 中等 |

---

## 最终建议

### 选择方案 A（统一网格项模型）

**理由**：
1. **长期维护成本最低**：代码量少，逻辑清晰
2. **扩展性最强**：未来需求变化时改动最小
3. **同步机制最简单**：只需要维护两张表的同步
4. **性能最优**：扁平化存储，查询高效
5. **开发效率最高**：统一的接口和逻辑

**适用场景**：
- 长期维护的项目
- 需求可能频繁变化
- 团队规模较小
- 追求代码简洁

**不适用场景**：
- 类型差异极大（但 NewTab 不存在这个问题）
- 需要极致的类型安全（但可以通过类型守卫解决）

---

## 实施建议

### 立即执行
1. 创建 `NEWTAB_DATA_STRUCTURE.md`（本文档）
2. 团队评审和确认方案
3. 创建详细的迁移计划

### 第一周
1. 实现新的类型定义
2. 实现数据迁移函数
3. 单元测试

### 第二周
1. 更新 Store 和 Actions
2. 更新核心组件
3. 集成测试

### 第三周
1. 后端迁移
2. API 更新
3. 端到端测试

### 第四周
1. 灰度发布
2. 监控和修复 Bug
3. 清理旧代码

---

## 附录

### A. 术语表
- **Group**：分组，组织内容的顶层容器
- **Item**：项目，所有内容的统一表示
- **Type**：类型，区分不同种类的项目
- **Parent**：父项目，建立层级关系
- **Sync**：同步，在多个存储之间保持数据一致

### B. 参考资料
- Notion 的 Block 模型
- Obsidian 的文件系统
- VS Code 的 TreeView 设计
- Chrome Bookmarks API

### C. 版本历史
- v1.0 (2025-02-15)：初始版本
