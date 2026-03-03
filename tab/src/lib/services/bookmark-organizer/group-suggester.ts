/**
 * 分组推荐器（NewTab 模式专用）
 */

import { callAI } from '../ai-client'
import type { OrganizeOptions, SuggestedGroup } from './types'

export class GroupSuggester {
  /**
   * 推荐分组
   */
  async suggestGroups(urls: string[], options: OrganizeOptions): Promise<SuggestedGroup[]> {
    const language = options.language || 'zh'
    const existingFolders = options.existingFolders || []
    
    // 动态计算推荐分组数量（方案 A）
    const recommendedGroups = this.calculateRecommendedGroups(urls.length, existingFolders.length)
    const maxTotalGroups = 10 // 总上限调整为 10（左侧导航）
    
    const prompt = this.buildPrompt(urls, recommendedGroups, maxTotalGroups, language, existingFolders)
    
    const result = await callAI({
      provider: options.provider,
      apiKey: options.apiKey,
      model: options.model,
      apiUrl: options.apiUrl,
      prompt,
      temperature: options.temperature || 0.7,
      maxTokens: 2000
    })

    return this.parseResponse(result.content)
  }

  /**
   * 动态计算推荐分组数量（方案 A：渐进式上限）
   */
  private calculateRecommendedGroups(urlCount: number, existingCount: number): number {
    // 根据 URL 数量动态计算建议分组数
    let recommended: number
    if (urlCount <= 20) {
      recommended = 3
    } else if (urlCount <= 50) {
      recommended = 5
    } else if (urlCount <= 100) {
      recommended = 7
    } else {
      recommended = 10
    }
    
    // 确保总数不超过 10
    return Math.min(recommended, 10 - existingCount + recommended)
  }

  /**
   * 构建提示词（优化版：方案 B + 提示词改进）
   */
  private buildPrompt(
    urls: string[],
    recommendedGroups: number,
    maxTotalGroups: number,
    language: 'zh' | 'en' | 'mixed',
    existingFolders: string[]
  ): string {
    const languageMap = {
      zh: '中文',
      en: '英文',
      mixed: '中英文'
    }
    const languagePreference = languageMap[language]
    const urlCount = urls.length
    
    let urlList = urls.map((url, i) => `${i + 1}. ${url}`).join('\n')
    
    // 如果 URL 列表过长，简化显示
    if (urlList.length > 8000) {
      urlList = urls.map((url, i) => `${i + 1}. ${this.simplifyUrl(url)}`).join('\n')
    }
    
    // 计算建议新建数量
    const suggestedNewCount = Math.max(0, recommendedGroups - existingFolders.length)
    const allowedNewCount = Math.max(0, maxTotalGroups - existingFolders.length)
    
    const existingFoldersHint = this.buildExistingFoldersHint(existingFolders, suggestedNewCount, allowedNewCount, maxTotalGroups)
    
    return `你是一个专业的书签管理助手。请分析以下 ${urlCount} 个网址，为用户推荐合适的分组方案。

📊 当前状态：
- 待导入网址：${urlCount} 个
- 已有分组：${existingFolders.length} 个
- 建议总分组数：${recommendedGroups} 个（${existingFolders.length > 0 ? `复用 ${existingFolders.length} 个已有 + 新建 ${suggestedNewCount} 个` : `新建 ${recommendedGroups} 个`}）
- 系统上限：最多 ${maxTotalGroups} 个分组

网址列表：
${urlList}
${existingFoldersHint}

🎯 任务目标：
这是**分组预览阶段**，你的推荐将展示给用户确认/编辑。请推荐 ${recommendedGroups} 个分组（包含已有和新建）。

每个分组包含：
- name: 分组名称（${languagePreference}，2-6 个字）
- description: 分组说明（${languagePreference}，10-20 字）
- count: 预计包含的网址数量（根据 ${urlCount} 个网址估算）
- isExisting: 是否为已有分组（true/false）

📋 分组策略（按优先级）：
1. **优先复用已有分组**${existingFolders.length > 0 ? `（${existingFolders.length} 个）` : ''}
   ${existingFolders.length > 0 ? '- 避免创建近义分组（如已有"开发工具"就不要创建"开发资源"或"编程工具"）\n   - 如果已有分组能覆盖某类网址，直接使用，不要创建新分组' : ''}

2. **按使用场景分类**（工作/学习/娱乐），而非网站类型
   - ✅ 好："前端开发"（场景明确）
   - ❌ 差："技术网站"（过于宽泛）

3. **确保分组通用性**，可容纳同类网站
   - ✅ 好："开发工具"（可包含 github/gitlab/stackoverflow/npm）
   - ❌ 差："React组件库"（过于细分）

4. **分组名称简洁明了**，易于理解和记忆
   - 中文：2-4 个汉字（如"开发工具"、"设计资源"）
   - 英文：1-3 个单词（如"Dev Tools"、"Design"）

5. **均衡分配网址**，避免某个分组过大或过小
   - 理想：每个分组 ${Math.floor(urlCount / recommendedGroups)}-${Math.ceil(urlCount / recommendedGroups * 1.5)} 个网址
   - 避免：某个分组 > ${Math.floor(urlCount / 2)} 个或 < 3 个

6. **新建分组数量控制**
   - 建议新建：${suggestedNewCount} 个
   - 最多允许：${allowedNewCount} 个（总数不超过 ${maxTotalGroups}）
   - 超过建议数量时，优先合并相似分类

✅ 优秀分组示例：
- "开发工具"：github、gitlab、stackoverflow、npm、docker、vscode 等
- "设计资源"：figma、dribbble、behance、canva、unsplash、iconfont 等
- "效率工具"：notion、trello、todoist、evernote、google docs 等
- "视频娱乐"：youtube、bilibili、netflix、twitch、抖音 等
- "学习资料"：coursera、udemy、leetcode、medium、知乎、掘金 等
- "新闻资讯"：36kr、techcrunch、hackernews、reddit、v2ex 等
- "电商购物"：淘宝、京东、amazon、拼多多、闲鱼 等

❌ 避免的分组：
- 过于宽泛："网站"、"工具"、"资源"
- 过于细分："React组件库"、"Vue插件"、"Python爬虫"
- 近义重复：已有"开发工具"时创建"编程工具"或"开发资源"

返回格式（严格遵循）：
[
  {"name": "开发工具", "description": "代码托管、开发文档和技术社区", "count": 45, "urls": ["https://github.com", "https://stackoverflow.com"], "isExisting": true},
  {"name": "设计资源", "description": "设计工具、素材和灵感来源", "count": 30, "urls": ["https://figma.com", "https://dribbble.com"], "isExisting": false}
]

JSON 输出要求：
* 必须返回一个 JSON 数组，包含 ${recommendedGroups} 个对象（可适当调整，但不超过 ${Math.min(recommendedGroups + 3, allowedNewCount + existingFolders.length)}）
* 每个对象必须包含 name、description、count、urls、isExisting 五个字段
* urls 字段必须包含该分组下所有网址的完整列表
* isExisting 为 true 表示使用已有分组，false 表示新建分组
* count 必须等于 urls 数组的长度
* 所有 urls 数组的总长度必须等于 ${urlCount}（每个网址只能出现在一个分组中）
* 新建分组（isExisting: false）数量建议不超过 ${suggestedNewCount} 个
* 不允许附加任何解释或额外内容
* 只返回 JSON 数组，不要任何其他内容`
  }

  /**
   * 简化 URL 显示
   */
  private simplifyUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0)
      const simplePath = pathParts.slice(0, 2).join('/')
      return urlObj.hostname + (simplePath ? '/' + simplePath : '')
    } catch {
      return url
    }
  }

  /**
   * 构建已有文件夹提示（优化版）
   */
  private buildExistingFoldersHint(
    existingFolders: string[], 
    suggestedNew: number, 
    allowedNew: number, 
    maxTotalGroups: number
  ): string {
    if (existingFolders.length > 0) {
      return `\n\n📁 已有分组（${existingFolders.length} 个）：\n${existingFolders.join('、')}\n\n⚠️ 重要约束：\n- **优先复用已有分组**，避免创建近义或重复的分组\n- 如果已有分组能覆盖某类网址，直接使用，不要创建新分组\n- 建议新建分组数：${suggestedNew} 个（最多允许 ${allowedNew} 个）\n- 总分组数上限：${maxTotalGroups} 个（当前 ${existingFolders.length} + 新建 ≤ ${allowedNew}）\n- 只在确实需要新类别时才创建新分组`
    }
    return `\n\n💡 提示：这是首次导入，建议创建 ${suggestedNew} 个通用分组（系统上限 ${maxTotalGroups} 个）`
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(content: string): SuggestedGroup[] {
    try {
      let cleanContent = content.trim()
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array')
      }

      return parsed.map(item => ({
        name: item.name || item.Name || '',
        description: item.description || item.Description || '',
        count: item.count || item.Count || (item.urls?.length || 0),
        urls: item.urls || item.Urls || []
      }))
    } catch (error) {
      throw new Error(`Failed to parse group suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
