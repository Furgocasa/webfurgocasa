import { Metadata } from 'next'

// Buchungsdetail - NICHT indexieren (persönliche Kundendaten)
export const metadata: Metadata = {
  title: "Buchungsdetails",
  description: "Informationen zu Ihrer Wohnmobil-Buchung",
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

export default function BuchungDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
