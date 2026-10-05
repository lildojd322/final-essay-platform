import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { redis } from '@/lib/redis'


export const config = { matcher: ['/profile', '/protected/:path*', '/signin', '/register', '/api/:path*'] }


async function handleRateLimit(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1'

    const redisKey = `pr10:ratelimit:${ip}`
    try {
        const currentRequests = await redis.incr(redisKey)
        if (currentRequests === 1) {
            await redis.expire(redisKey, 60)
        }

        if (currentRequests > 60) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            )
        }
    } catch (error) {
        console.error('Upstash Redis Error:', error)
    }

    return null
}


export async function proxy(request: NextRequest) {
    let sessionToken = request.cookies.get('__Secure-next-auth.session-token') ||
        request.cookies.get('next-auth.session-token')

    const { pathname } = request.nextUrl

    if (pathname.startsWith('/api')) {
        const limitResponse = await handleRateLimit(request)
        if (limitResponse) {
            return limitResponse
        }
    }
    if (sessionToken) {
        if (pathname === '/signin' || pathname === '/register') {

            return NextResponse.redirect(new URL('/profile', request.url))
        }

        return NextResponse.next()
    }
    if (!sessionToken) {
        if (pathname === '/profile') {
            return NextResponse.redirect(new URL('/signin', request.url))
        }

    }

    return NextResponse.next()
}