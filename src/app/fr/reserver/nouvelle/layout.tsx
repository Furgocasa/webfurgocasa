import { Metadata } from 'next'

// Page de formulaire de réservation - NE PAS indexer (données privées)
export const metadata: Metadata = {
  title: "Nouvelle Réservation",
  description: "Complétez votre réservation de camping-car",
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

export default function NouvelleReservationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
