/**
 * NewTab 批量 URL Prompt 构建
 */

import type { OrganizeOptions } from '../types'

export function buildNewTabBatchPrompt(urls: string[], options: OrganizeOptions): string {
  const existingFolders = options.existingFolders || []
  const maxTotalGroups = 10 // 总上限 10
  const tagStyle = options.tagStyle
  
  const titleLengthMap = {
    short: '5-15字',
    medium: '10-30字',
    long: '20-50字'
  }
  const titleLength = titleLengthMap[options.titleLength || 'medium']
  
  const descriptionDetailMap = {
    minimal: '10-20字的简要说明',
    short: '20-50字的概括性描述',
    detailed: '50-100字的详细说明，包含关键特点'
  }
  const descriptionLength = descriptionDetailMap[options.descriptionDetail || 'short']
  
  const language = options.language || 'zh'
  const languageMap = {
    zh: '使用中文',
    en: '使用英文',
    mixed: '中英文混合使用'
  }
  const languagePreference = languageMap[language]
  
  const folderLengthRule = language === 'en' 
    ? '文件夹名要简洁明了，一般为 1-3 个单词'
    : language === 'mixed'
    ? '文件夹名要简洁明了，中文 2-4 个汉字，英文 1-3 个单词'
    : '文件夹名要简洁明了，一般为 2-4 个汉字'
  
  const translationRule = language === 'zh'
    ? '如果网页内容为外文，请将标题、描述和文件夹名翻译成中文'
    : language === 'en'
    ? '如果网页内容为中文，请将标题、描述和文件夹名翻译成英文'
    : '标题、描述和文件夹名可以根据内容使用中文或英文，优先保持原语言'
  
  const urlList = urls.map((url, i) => `${i + 1}. ${url}`).join('\n')
  const folderGuide = existingFolders.length > 0
    ? `\n\n📁 可用分组（${existingFolders.length} 个）：\n${existingFolders.join('、')}`
    : `\n\n💡 建议创建通用分类，避免过于细分（系统上限 ${maxTotalGroups} 个）`
  
  const allowedNew = Math.max(0, maxTotalGroups - existingFolders.length)
  const folderLimit = existingFolders.length >= maxTotalGroups
    ? `\n\n🚫 严格约束：已达到 ${maxTotalGroups} 个文件夹上限，必须从已有文件夹中选择，严禁创建新文件夹！`
    : `\n\n⚠️ 约束：所有网址的文件夹总数不得超过 ${maxTotalGroups} 个（当前已有 ${existingFolders.length} 个，最多新建 ${allowedNew} 个）`
  
  const styleGuide = tagStyle 
    ? `\n\n用户分类风格偏好：\n${tagStyle}` 
    : ''

  return `你是一个专业的书签管理助手。请为以下 ${urls.length} 个网址批量生成书签信息并推荐文件夹。

网址列表：
${urlList}
${folderGuide}${folderLimit}${styleGuide}

任务要求：
1. 为每个网址生成标题（${titleLength}，${languagePreference}）
2. 为每个网址生成描述（${descriptionLength}，${languagePreference}）
3. 为每个网址推荐一个文件夹（${languagePreference}）

⚠️ 严格约束（批量处理特别注意）：
- **统筹考虑所有 ${urls.length} 个网址，合理规划文件夹分配**
- **相似网站必须归入同一文件夹**（如 github/gitlab → "开发工具"）
- ${existingFolders.length >= maxTotalGroups ? `**必须从已有 ${existingFolders.length} 个分组中选择，严禁创建新分组**` : `**新建文件夹总数不得超过 ${allowedNew} 个**`}
- ${existingFolders.length > 0 ? '优先使用已有文件夹，避免创建近义分类' : ''}

文件夹推荐规则：
1. **${existingFolders.length > 0 ? '优先使用已有文件夹' : '创建通用分类'}**，避免创建过多分类
2. ${folderLengthRule}
3. 按使用场景分类，确保同类网站归为一组
4. ${translationRule}

✅ 批量分类示例：
- github.com, gitlab.com, gitee.com → 都归入"开发工具"
- figma.com, sketch.com, canva.com → 都归入"设计工具"
- youtube.com, bilibili.com, netflix.com → 都归入"视频娱乐"

返回格式（严格遵循）：
[
  {"title": "标题1", "description": "描述1", "folder": "文件夹1"},
  {"title": "标题2", "description": "描述2", "folder": "文件夹2"}
]

JSON 输出要求：
* 必须返回一个 JSON 数组，包含 ${urls.length} 个对象
* 数组顺序必须与输入网址顺序一致
* 不允许附加任何解释或额外内容
* 只返回 JSON 数组，不要任何其他内容`
}
