import { Metadata } from 'next'

// Détail de réservation - NE PAS indexer (données personnelles du client)
export const metadata: Metadata = {
  title: "Détail de Réservation",
  description: "Information de votre réservation de camping-car",
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

export default function ReservationDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
