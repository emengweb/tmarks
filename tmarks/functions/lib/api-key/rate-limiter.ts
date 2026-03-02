/**
 * Rate Limiter - API Key 速率限制（已移除 KV）
 * 使用 KV 存储请求计数
 */

// import type { KVNamespace } from '@cloudflare/workers-types'

interface RateLimitConfig {
  per_minute: number
  per_hour: number
  per_day: number
}

// 取消速率限制 - 设置为极大值
const DEFAULT_LIMITS: RateLimitConfig = {
  per_minute: 999999,
  per_hour: 999999,
  per_day: 999999,
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp
  retryAfter?: number // 秒
}

/**
 * 检查速率限制（已移除 KV，始终允许）
 * @param apiKeyId API Key ID
 * @param kv KV Namespace
 * @param limits 速率限制配置
 * @returns 是否允许请求
 */
export async function checkRateLimit(
  apiKeyId: string,
  kv: unknown,
  limits: RateLimitConfig = DEFAULT_LIMITS
): Promise<RateLimitResult> {
  // KV 已移除，始终允许请求
  void apiKeyId
  void kv
  const now = Date.now()
  
  return {
    allowed: true,
    limit: limits.per_minute,
    remaining: limits.per_minute,
    reset: now + 60 * 1000,
  }

  // const now = Date.now()
  // const minuteResult = await checkWindow(
  //   kv,
  //   apiKeyId,
  //   'minute',
  //   60 * 1000,
  //   limits.per_minute,
  //   now
  // )
  // if (!minuteResult.allowed) {
  //   return minuteResult
  // }
  // const hourResult = await checkWindow(
  //   kv,
  //   apiKeyId,
  //   'hour',
  //   60 * 60 * 1000,
  //   limits.per_hour,
  //   now
  // )
  // if (!hourResult.allowed) {
  //   return hourResult
  // }
  // const dayResult = await checkWindow(
  //   kv,
  //   apiKeyId,
  //   'day',
  //   24 * 60 * 60 * 1000,
  //   limits.per_day,
  //   now
  // )
  // return dayResult
}

/**
 * 记录请求（已移除 KV）
 * @param apiKeyId API Key ID
 * @param kv KV Namespace
 */
export async function recordRequest(apiKeyId: string, kv: unknown): Promise<void> {
  // KV 已移除，跳过记录
  void apiKeyId
  void kv
  // const now = Date.now()
  // await Promise.all([
  //   incrementWindow(kv, apiKeyId, 'minute', 60 * 1000, now),
  //   incrementWindow(kv, apiKeyId, 'hour', 60 * 60 * 1000, now),
  //   incrementWindow(kv, apiKeyId, 'day', 24 * 60 * 60 * 1000, now),
  // ])
}

/**
 * 检查单个时间窗口（已移除 KV）
 */
// async function checkWindow(
//   kv: unknown,
//   apiKeyId: string,
//   window: 'minute' | 'hour' | 'day',
//   windowMs: number,
//   limit: number,
//   now: number
// ): Promise<RateLimitResult> {
//   const windowStart = Math.floor(now / windowMs)
//   const key = `ratelimit:${apiKeyId}:${window}:${windowStart}`
//   const countStr = await kv.get(key)
//   const count = countStr ? parseInt(countStr, 10) : 0
//   const allowed = count < limit
//   const remaining = Math.max(0, limit - count)
//   const reset = (windowStart + 1) * windowMs
//   const retryAfter = allowed ? undefined : Math.ceil((reset - now) / 1000)
//   return {
//     allowed,
//     limit,
//     remaining,
//     reset,
//     retryAfter,
//   }
// }

/**
 * 增加时间窗口计数（已移除 KV）
 */
// async function incrementWindow(
//   kv: unknown,
//   apiKeyId: string,
//   window: 'minute' | 'hour' | 'day',
//   windowMs: number,
//   now: number
// ): Promise<void> {
//   const windowStart = Math.floor(now / windowMs)
//   const key = `ratelimit:${apiKeyId}:${window}:${windowStart}`
//   const countStr = await kv.get(key)
//   const count = countStr ? parseInt(countStr, 10) : 0
//   const ttl = Math.ceil(windowMs / 1000) + 3600
//   await kv.put(key, String(count + 1), { expirationTtl: ttl })
// }
