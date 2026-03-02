# Tab Extension Source Code

## 目录结构

```
src/
├── background/       # Service Worker (后台脚本)
├── components/       # 共享 UI 组件
├── content/          # Content Scripts (内容脚本)
├── lib/              # 核心库和工具
├── newtab/           # NewTab 页面
├── options/          # 设置页面
├── popup/            # 弹出窗口
├── themes/           # 主题样式
└── types/            # TypeScript 类型定义
```

## 模块说明

### background/
后台服务，处理扩展的核心逻辑：
- `handlers/` - 消息处理器（AI 推荐、页面信息提取等）
- `services/` - 后台服务（书签收集、NewTab 文件夹管理）
- `utils/` - 工具函数

### lib/
核心库，提供可复用的功能：
- `api/` - TMarks API 客户端
- `constants/` - 常量定义
- `db/` - IndexedDB 数据库
- `i18n/` - 国际化
- `import/` - 导入导出功能
- `providers/` - AI 提供商（OpenAI、Claude 等）
- `services/` - 核心服务（AI、书签、缓存、Favicon 等）
- `store/` - 状态管理
- `utils/` - 工具函数

### newtab/
NewTab 页面，提供个性化起始页：
- `components/` - UI 组件（7 个分类）
  - `display/` - 展示组件（时钟、天气、诗词等）
  - `grid/` - 网格系统（快捷方式、文件夹、小部件）
  - `layout/` - 布局组件（Dock、侧边栏、壁纸）
  - `modals/` - 弹窗组件
  - `settings/` - 设置面板
  - `shared/` - 共享组件（搜索栏等）
  - `ui/` - 基础 UI 组件
- `features/` - 功能模块（浏览器同步等）
- `hooks/` - React Hooks
- `services/` - NewTab 服务
- `utils/` - 工具函数

### types/
TypeScript 类型定义（模块化）：
- `ai.ts` - AI 相关类型
- `bookmark.ts` - 书签相关类型
- `common.ts` - 通用类型
- `config.ts` - 配置类型
- `newtab.ts` - NewTab/TabGroup 类型
- `sync.ts` - 同步和 API 类型

## 开发指南

### 构建
```bash
pnpm build
```

### 类型检查
```bash
pnpm tsc --noEmit
```

### 目录规范
- 组件使用 PascalCase：`BookmarkCard.tsx`
- 工具/服务使用 kebab-case：`ai-client.ts`
- 类型文件使用 kebab-case：`bookmark.ts`
- 目录使用 kebab-case：`grid-items/`
