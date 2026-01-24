import { Metadata } from 'next'

// Buchungsformular-Seite - NICHT indexieren (private Daten)
export const metadata: Metadata = {
  title: "Neue Buchung",
  description: "Vervollständigen Sie Ihre Wohnmobil-Buchung",
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

export default function NeueBuchungLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
