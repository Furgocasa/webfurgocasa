import { Metadata } from 'next'

// Fahrzeugauswahl-Seite - NICHT indexieren (Buchungsprozess)
export const metadata: Metadata = {
  title: "Fahrzeug Auswählen",
  description: "Wählen Sie Ihr Wohnmobil zur Buchung",
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

export default function FahrzeugBuchungLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
