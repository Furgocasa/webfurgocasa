import { Metadata } from 'next'

// Page de sélection de véhicule - NE PAS indexer (processus de réservation)
export const metadata: Metadata = {
  title: "Sélectionner Véhicule",
  description: "Choisissez votre camping-car à réserver",
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

export default function VehiculeReservationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
