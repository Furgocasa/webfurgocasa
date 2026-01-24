import { Metadata } from 'next'

// Detalle de reserva - NO indexar (datos personales del cliente)
export const metadata: Metadata = {
  title: "Detalle de Reserva",
  description: "Información de tu reserva de camper",
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

export default function ReservaDetalleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
