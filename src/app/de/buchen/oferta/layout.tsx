import { Metadata } from 'next'

// Sonderangebot-Seite - NICHT indexieren (Buchungsprozess)
export const metadata: Metadata = {
  title: "Sonderangebot",
  description: "Buchen Sie mit Ihrem Sonderangebot",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function AngebotBuchungLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
