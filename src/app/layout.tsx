import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'ImmoGreta – Hausverwaltung Dashboard',
  description: 'KI-gestützte Anrufverwaltung für Hausverwaltungen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <body className="h-full">
        <ErrorBoundary>
          <ConditionalLayout>{children}</ConditionalLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}
