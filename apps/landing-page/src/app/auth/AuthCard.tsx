import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

// Shared shell for the small auth status pages (error, verify-request, forgot-password)
export function AuthCard({
  icon: Icon,
  iconClass = 'bg-green-100 text-green-600',
  title,
  description,
  children,
}: {
  icon: LucideIcon
  iconClass?: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-3xl font-display font-bold text-green-600">
              SuberFood
            </Link>
          </div>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 ${iconClass}`}>
            <Icon className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    </div>
  )
}
