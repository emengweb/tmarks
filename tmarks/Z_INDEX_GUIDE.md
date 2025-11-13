# Z-Index 层级规范

## 问题说明

在开发过程中发现标签管理弹窗被导航栏遮挡的问题,原因是z-index层级设置不统一。

## 修复记录

**修复日期:** 2025-01-13

### 修复的文件

1. ✅ `tmarks/src/components/tags/TagManageModal.tsx`
   - 修复前: `z-[100]`
   - 修复后: `z-[9998]`

2. ✅ `tmarks/src/components/tags/TagFormModal.tsx`
   - 修复前: `z-[200]`
   - 修复后: `z-[9999]`

3. ✅ `tmarks/src/components/tab-groups/MoveItemDialog.tsx`
   - 修复前: `z-50`
   - 修复后: `z-[9998]`

4. ✅ `tmarks/src/components/bookmarks/BookmarkForm.tsx`
   - 修复前: `z-50`
   - 修复后: `z-[9998]`

## Z-Index 层级规范

为了避免类似问题,制定以下z-index使用规范:

### 层级定义

```
z-0      - 默认层级 (普通内容)
z-10     - 浮动元素 (卡片阴影等)
z-20     - 下拉菜单
z-30     - 固定侧边栏
z-40     - 悬浮按钮
z-50     - 导航栏 (sticky header)
z-[100]  - Toast 通知
z-[9998] - 一级弹窗 (Modal/Dialog)
z-[9999] - 二级弹窗 (嵌套在一级弹窗内的弹窗)
z-[10000] - 全局加载遮罩
```

### 使用规则

#### 1. 导航栏
```tsx
// AppShell.tsx, PublicAppShell.tsx
<header className="sticky top-0 z-50">
```

#### 2. 一级弹窗
用于主要的模态框、对话框:
```tsx
// TagManageModal, BookmarkForm, MoveItemDialog 等
<div className="fixed inset-0 z-[9998]">
```

#### 3. 二级弹窗
用于在一级弹窗之上的确认对话框、提示框:
```tsx
// ConfirmDialog, AlertDialog, TagFormModal 等
<div className="fixed inset-0 z-[9999]">
```

#### 4. Toast 通知
```tsx
<div className="fixed top-4 right-4 z-[100]">
```

### 检查清单

在添加新的弹窗组件时,请检查:

- [ ] 是否是一级弹窗? 使用 `z-[9998]`
- [ ] 是否是二级弹窗(嵌套)? 使用 `z-[9999]`
- [ ] 是否会被导航栏遮挡? 确保z-index > 50
- [ ] 是否需要背景遮罩? 使用 `bg-black/60 backdrop-blur-sm`
- [ ] 是否需要阻止背景滚动? 添加 `overflow: hidden` 到 body

### 已验证的组件

#### 一级弹窗 (z-[9998])
- ✅ `TagManageModal` - 标签管理弹窗
- ✅ `BookmarkForm` - 书签表单
- ✅ `MoveItemDialog` - 移动标签页对话框

#### 二级弹窗 (z-[9999])
- ✅ `TagFormModal` - 编辑标签弹窗
- ✅ `ConfirmDialog` - 确认对话框
- ✅ `AlertDialog` - 提示对话框

#### 导航栏 (z-50)
- ✅ `AppShell` - 主应用导航栏
- ✅ `PublicAppShell` - 公开页面导航栏

## 测试方法

### 手动测试

1. 打开标签管理弹窗
2. 点击编辑某个标签
3. 确认编辑弹窗在标签管理弹窗之上
4. 确认所有弹窗都在导航栏之上
5. 滚动页面,确认导航栏不会遮挡弹窗

### 视觉检查

使用浏览器开发者工具:
1. 打开 Elements 面板
2. 检查弹窗元素的 computed z-index
3. 确认层级关系正确

## 常见问题

### Q: 为什么不使用连续的数字?
A: 使用大的间隔(如9998, 9999)可以为将来的需求预留空间,避免频繁调整。

### Q: 为什么 ConfirmDialog 和 AlertDialog 都是 z-[9999]?
A: 它们都是二级弹窗,通常在一级弹窗之上显示,不会同时出现。

### Q: 如果需要三级弹窗怎么办?
A: 建议重新设计交互流程,避免三层嵌套。如果确实需要,可以使用 z-[10000]。

## 相关文件

- `tmarks/src/components/layout/AppShell.tsx` - 主导航栏
- `tmarks/src/components/layout/PublicAppShell.tsx` - 公开页导航栏
- `tmarks/src/components/tags/TagManageModal.tsx` - 标签管理
- `tmarks/src/components/tags/TagFormModal.tsx` - 标签编辑
- `tmarks/src/components/common/ConfirmDialog.tsx` - 确认对话框
- `tmarks/src/components/common/AlertDialog.tsx` - 提示对话框
- `tmarks/src/components/bookmarks/BookmarkForm.tsx` - 书签表单
- `tmarks/src/components/tab-groups/MoveItemDialog.tsx` - 移动对话框

## 更新日志

- 2025-01-13: 初始版本,修复标签弹窗被导航栏遮挡的问题

