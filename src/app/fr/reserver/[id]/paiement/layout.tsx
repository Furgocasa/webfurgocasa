import { Metadata } from 'next'

// Page de paiement de réservation - ne pas indexer
export const metadata: Metadata = {
  title: "Paiement de réservation",
  description: "Compléter le paiement de votre réservation de camping-car",
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
