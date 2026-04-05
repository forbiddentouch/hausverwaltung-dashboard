import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Lisa AI – Hausverwaltung Dashboard',
  description: 'KI-gestützte Anrufverwaltung für Hausverwaltungen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="h-full">
      <body className="h-full flex">
        <Sidebar />
        <main className="ml-60 flex-1 min-h-full p-8 bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  )
}
