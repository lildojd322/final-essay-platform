import { redis } from './redis'

export const checkLimit = async (key) => {

    const rediskey = `rate_limit10:${key}`


    const currentAttempts = await redis.get(rediskey) || 0

    if (parseInt(currentAttempts) >= 5) {
        return { allowed: false }
    }

    const newAttempts = await redis.incr(rediskey)

    if (newAttempts === 1) {
        await redis.expire(rediskey, 60)
    }

    return { allowed: true, remaining: 5 - newAttempts}
}
