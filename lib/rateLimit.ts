const rateLimitMap = new Map<string, { count: number; expiresAt: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 15,
  windowMs: number = 60000
): { success: boolean; limit: number; remaining: number } {
  const now = Date.now()

  // Clean up expired entries periodically (optional optimization)
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.expiresAt) {
        rateLimitMap.delete(key)
      }
    }
  }

  const record = rateLimitMap.get(identifier)

  if (!record) {
    rateLimitMap.set(identifier, { count: 1, expiresAt: now + windowMs })
    return { success: true, limit, remaining: limit - 1 }
  }

  if (now > record.expiresAt) {
    record.count = 1
    record.expiresAt = now + windowMs
    return { success: true, limit, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0 }
  }

  record.count += 1
  return { success: true, limit, remaining: limit - record.count }
}
