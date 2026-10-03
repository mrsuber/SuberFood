import { Navbar } from '@/components/navigation/Navbar'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {children}
      </main>
    </>
  )
}
