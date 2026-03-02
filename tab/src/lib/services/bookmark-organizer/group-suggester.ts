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
    const maxGroups = options.maxImportGroups || 7
    const language = options.language || 'zh'
    const existingFolders = options.existingFolders || []
    
    const prompt = this.buildPrompt(urls, maxGroups, language, existingFolders)
    
    const result = await callAI({
      provider: options.provider,
      apiKey: options.apiKey,
      model: options.model,
      apiUrl: options.apiUrl,
      prompt,
      temperature: options.temperature || 0.7,
      maxTokens: 1500
    })

    return this.parseResponse(result.content)
  }

  /**
   * 构建提示词
   */
  private buildPrompt(
    urls: string[],
    maxGroups: number,
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
    
    const existingFoldersHint = this.buildExistingFoldersHint(existingFolders, maxGroups)
    
    return `你是一个专业的书签管理助手。请分析以下 ${urlCount} 个网址，推荐 ${maxGroups} 个合适的分组。

网址列表（共 ${urlCount} 个）：
${urlList}
${existingFoldersHint}

任务要求：
1. 仔细分析所有 ${urlCount} 个网址的类型、用途和使用场景
2. ${existingFolders.length > 0 ? `优先考虑使用已有的 ${existingFolders.length} 个分组` : `推荐 ${maxGroups} 个一级分组`}
3. 每个分组包含：
   - name: 分组名称（${languagePreference}，2-6 个字）
   - description: 分组说明（${languagePreference}，10-20 字）
   - count: 预计包含的网址数量（根据 ${urlCount} 个网址估算）
   - isExisting: 是否为已有分组（true/false）

分组原则：
1. **优先使用已有分组**${existingFolders.length > 0 ? '，避免创建近义分组（如已有"开发工具"就不要创建"开发资源"）' : ''}
2. **按使用场景分类**（工作/学习/娱乐），而非网站类型
3. **确保分组具有通用性**，可容纳同类网站
4. **避免过于宽泛**（如"网站"）或**过于细分**（如"React组件库"）
5. **分组名称简洁明了**，易于理解和记忆
6. **尽量让每个分组的网址数量相对均衡**（总计 ${urlCount} 个）
7. **总分组数不超过 ${maxGroups} 个**（${existingFolders.length > 0 ? `已有 ${existingFolders.length} 个，最多新建 ${maxGroups - existingFolders.length} 个` : `建议创建 ${maxGroups} 个`}）

✅ 好的分组示例：
- "开发工具"：github、gitlab、stackoverflow、npm、docker 等
- "设计资源"：figma、dribbble、behance、canva、unsplash 等
- "效率工具"：notion、trello、todoist、evernote、google docs 等
- "视频娱乐"：youtube、bilibili、netflix、twitch、抖音 等
- "学习资料"：coursera、udemy、leetcode、medium、知乎 等
- "新闻资讯"：36kr、techcrunch、hackernews、reddit 等
- "电商购物"：淘宝、京东、amazon、拼多多 等

返回格式（严格遵循）：
[
  {"name": "开发工具", "description": "代码托管、开发文档和技术社区", "count": 150, "isExisting": true},
  {"name": "设计资源", "description": "设计工具、素材和灵感来源", "count": 80, "isExisting": false}
]

JSON 输出要求：
* 必须返回一个 JSON 数组，包含最多 ${maxGroups} 个对象
* 每个对象必须包含 name、description、count、isExisting 四个字段
* isExisting 为 true 表示使用已有分组，false 表示新建分组
* count 的总和应接近 ${urlCount}（允许有少量误差）
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
   * 构建已有文件夹提示
   */
  private buildExistingFoldersHint(existingFolders: string[], maxGroups: number): string {
    if (existingFolders.length > 0) {
      return `\n\n📁 已有分组（${existingFolders.length} 个）：\n${existingFolders.join('、')}\n\n⚠️ 重要约束：\n- 优先使用已有分组，避免创建近义或重复的分组\n- 如果已有分组能覆盖某类网址，直接使用，不要创建新分组\n- 只在确实需要新类别时才创建新分组\n- 新分组 + 已有分组总数不得超过 ${maxGroups} 个`
    }
    return `\n\n💡 提示：这是首次导入，建议创建 ${maxGroups} 个通用分组`
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
        count: item.count || item.Count || 0
      }))
    } catch (error) {
      throw new Error(`Failed to parse group suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
