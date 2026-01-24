import { Metadata } from 'next'

// Página de formulario de reserva - NO indexar (datos privados)
export const metadata: Metadata = {
  title: "Nueva Reserva",
  description: "Completa tu reserva de camper o autocaravana",
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

export default function NuevaReservaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
