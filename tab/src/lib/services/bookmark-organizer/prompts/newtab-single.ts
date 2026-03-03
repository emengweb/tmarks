/**
 * NewTab 单个 URL Prompt 构建
 */

import type { OrganizeOptions } from '../types'

export function buildNewTabPrompt(url: string, options: OrganizeOptions): string {
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
  
  const folderGuide = existingFolders.length > 0
    ? `\n\n📁 可用分组（${existingFolders.length} 个）：\n${existingFolders.join('、')}`
    : `\n\n📚 分类参考（按使用场景）：
**开发技术**：开发工具、前端框架、后端服务、数据库、DevOps、API文档
**设计创意**：设计工具、素材资源、配色方案、图标库、UI组件
**办公协作**：文档工具、项目管理、团队协作、云存储、笔记应用
**学习成长**：在线课程、技术博客、编程练习、文档教程、技术社区
**资讯媒体**：科技新闻、行业资讯、技术周刊、播客视频
**生活娱乐**：视频平台、音乐应用、游戏娱乐、社交网络
**电商购物**：购物平台、比价工具、优惠信息、海淘代购
**金融理财**：银行服务、投资理财、记账工具、加密货币
**健康运动**：健身应用、饮食管理、医疗健康、运动追踪
**旅行出行**：旅游攻略、酒店预订、交通出行、地图导航

💡 分组策略：
- 优先按"使用目的"分类（工作/学习/娱乐），而非按"网站类型"
- 同一场景下的网站归为一组（如"前端开发"包含 github/stackoverflow/npm）
- 避免过于宽泛（如"网站"）或过于细分（如"React组件库"）
- 通用工具类网站可独立成组（如"工具箱"）`

  const allowedNew = Math.max(0, maxTotalGroups - existingFolders.length)
  const folderLimit = existingFolders.length >= maxTotalGroups
    ? `\n\n🚫 严格约束：已达到 ${maxTotalGroups} 个文件夹上限，必须从已有文件夹中选择一个，严禁创建新文件夹！`
    : existingFolders.length > 0
    ? `\n\n⚠️ 约束：优先使用已有文件夹，总文件夹数量不得超过 ${maxTotalGroups} 个（当前已有 ${existingFolders.length} 个，最多新建 ${allowedNew} 个）`
    : `\n\n⚠️ 约束：总文件夹数量不得超过 ${maxTotalGroups} 个，建议创建通用分类，避免过于细分`
  
  const styleGuide = tagStyle 
    ? `\n\n用户分类偏好：\n${tagStyle}` 
    : ''

  return `你是一个专业的书签管理助手。请根据网址为用户生成书签信息并推荐最合适的文件夹分类。

网址：${url}
${folderGuide}${folderLimit}${styleGuide}

任务要求：
1. 生成一个简洁的标题（${titleLength}，${languagePreference}）
2. 生成一个描述（${descriptionLength}，${languagePreference}）
3. 推荐一个合适的文件夹名称（${languagePreference}）

文件夹推荐规则：
1. **优先使用已有分组**${existingFolders.length > 0 ? '，避免创建近义分组' : ''}
2. ${folderLengthRule}
3. 按使用场景分类，而非网站类型（如"前端开发"优于"技术网站"）
4. 确保分类具有通用性，可容纳同类网站（如"开发工具"可包含 github/gitlab/gitee）
5. ${translationRule}

✅ 好的分类示例：
- github.com → "开发工具"（而非"代码托管"）
- figma.com → "设计工具"（而非"UI设计"）
- notion.so → "效率工具"（而非"笔记应用"）
- youtube.com → "视频娱乐"（而非"视频网站"）

返回格式（严格遵循）：
{
  "title": "标题",
  "description": "描述",
  "folder": "文件夹名"
}

JSON 输出要求：
* 必须输出且仅输出一个合法 JSON 对象
* 不允许附加任何解释、reasoning 内容或额外键
* 禁止输出 Markdown、换行提示、警告或其他文本
* 如无法生成有效结果，请返回 {"title": "", "description": "", "folder": ""}
* 只返回 JSON，不要任何其他内容`
}
