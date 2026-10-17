import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']
// Roles that never get access to internal /api/admin endpoints.
const CUSTOMER_ROLES = ['CUSTOMER', 'B2B_PARTNER']
// Delivery endpoints are used by drivers; those routes check access themselves.
const DRIVER_API_PREFIX = '/api/admin/farm-deliveries'

// Internal APIs that live outside /api/admin but must only be used by staff.
// `readPublic` keeps GET open for the public site.
const STAFF_APIS: { prefix: string; readPublic?: boolean }[] = [
  { prefix: '/api/admin' },
  { prefix: '/api/inventory' },
  { prefix: '/api/upload/image' },
  { prefix: '/api/menu', readPublic: true },
]

function staffApiFor(pathname: string, method: string) {
  const rule = STAFF_APIS.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/'))
  if (!rule) return null
  if (rule.readPublic && (method === 'GET' || method === 'HEAD')) return null
  return rule
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const role = token?.role as string | undefined
    const { pathname } = req.nextUrl

    if (pathname.startsWith('/api/')) {
      if (!staffApiFor(pathname, req.method)) {
        return NextResponse.next()
      }
      if (!token) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
      if (!pathname.startsWith(DRIVER_API_PREFIX) && (!role || CUSTOMER_ROLES.includes(role))) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.next()
    }

    // If accessing admin pages and not an admin, redirect to signin
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !ADMIN_ROLES.includes(role || '')) {
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/admin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to /admin/login without authentication (it will redirect anyway)
        if (pathname === '/admin/login') {
          return true
        }

        // API routes answer with JSON in the middleware above instead of a sign-in redirect
        if (pathname.startsWith('/api/')) {
          return true
        }

        // For admin routes, require authentication
        if (pathname.startsWith('/admin')) {
          return !!token
        }

        // All other routes are allowed
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/inventory/:path*', '/api/upload/image', '/api/menu/:path*'],
}
