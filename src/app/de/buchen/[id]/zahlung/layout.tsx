import { Metadata } from 'next'

// Página de pago de reserva - no indexar
export const metadata: Metadata = {
  title: "Pago de reserva",
  description: "Completar el pago de tu reserva de autocaravana",
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
