import { Metadata } from 'next'

// Buchungszahlungsseite - nicht indexieren
export const metadata: Metadata = {
  title: "Buchungszahlung",
  description: "Schließen Sie die Zahlung Ihrer Wohnmobil-Buchung ab",
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

export default function PagoReservaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
