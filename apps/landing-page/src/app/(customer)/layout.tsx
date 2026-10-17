import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
