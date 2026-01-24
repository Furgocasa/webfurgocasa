import { Metadata } from 'next'

// Página de oferta especial - NO indexar (proceso de reserva)
export const metadata: Metadata = {
  title: "Oferta Especial",
  description: "Reserva con tu oferta especial",
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

export default function OfertaReservaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
