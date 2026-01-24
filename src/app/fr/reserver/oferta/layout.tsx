import { Metadata } from 'next'

// Page d'offre spéciale - NE PAS indexer (processus de réservation)
export const metadata: Metadata = {
  title: "Offre Spéciale",
  description: "Réservez avec votre offre spéciale",
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

export default function OffreReservationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
