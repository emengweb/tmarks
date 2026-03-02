# NewTab Components

NewTab 页面的 UI 组件，按功能分为 7 个类别。

## 目录结构

### display/
展示类组件，用于显示信息：
- `Clock.tsx` - 时钟组件
- `Greeting.tsx` - 问候语
- `LunarDate.tsx` - 农历日期
- `Poetry.tsx` - 诗词展示
- `Weather.tsx` - 天气信息

### grid/
网格系统，管理快捷方式和小部件：
- `GridContainer.tsx` - 网格容器（主组件）
- `GridItem.tsx` - 网格项
- `ShortcutWidget.tsx` - 快捷方式小部件
- `FolderWidget.tsx` - 文件夹小部件
- `widgetRegistry.ts` - 小部件注册表
- `widget-types.ts` - 小部件类型定义
- `components/` - 网格子组件
- `hooks/` - 网格相关 Hooks

### layout/
布局组件，定义页面结构：
- `DockBar.tsx` - 底部 Dock 栏
- `GroupSidebar.tsx` - 分组侧边栏
- `Wallpaper.tsx` - 壁纸背景

### modals/
弹窗组件，处理用户交互：
- `AddShortcutModal.tsx` - 添加快捷方式
- `EditShortcutModal.tsx` - 编辑快捷方式
- `CreateFolderModal.tsx` - 创建文件夹
- `EditFolderModal.tsx` - 编辑文件夹
- `ConfirmDeleteModal.tsx` - 删除确认

### settings/
设置面板及其子组件：
- `SettingsPanel.tsx` - 设置面板主组件
- `components/` - 设置项组件

### shared/
共享组件，多处使用：
- `SearchBar.tsx` - 搜索栏
- `SearchEngineSelector.tsx` - 搜索引擎选择器
- `ShortcutContextMenu.tsx` - 快捷方式右键菜单

### ui/
基础 UI 组件：
- `Button.tsx` - 按钮
- `Input.tsx` - 输入框
- `Select.tsx` - 下拉选择
- 等基础组件

## 使用示例

```tsx
import { GridContainer } from './grid/GridContainer';
import { DockBar } from './layout/DockBar';
import { SearchBar } from './shared/SearchBar';

function NewTab() {
  return (
    <>
      <SearchBar />
      <GridContainer />
      <DockBar />
    </>
  );
}
```

## 组件规范

1. 所有组件使用 TypeScript + React
2. 使用函数组件 + Hooks
3. 导出组件时使用命名导出
4. 复杂组件拆分为子组件
5. 共享逻辑提取为 Hooks
