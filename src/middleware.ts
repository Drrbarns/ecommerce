import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Only run session update on admin routes to avoid 404s on other pages due to potential Edge runtime issues
    if (request.nextUrl.pathname.startsWith('/admin')) {
        return await updateSession(request)
    }
    return undefined
}

export const config = {
    matcher: [
        '/admin/:path*',
    ],
}
