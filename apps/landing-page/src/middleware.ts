import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    // If accessing admin routes and not an admin, redirect to signin
    if (isAdminRoute && !isAdmin && req.nextUrl.pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/admin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to /admin/login without authentication (it will redirect anyway)
        if (req.nextUrl.pathname === '/admin/login') {
          return true
        }

        // For admin routes, require authentication
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token
        }

        // All other routes are allowed
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}
