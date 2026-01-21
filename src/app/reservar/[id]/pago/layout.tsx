import { Metadata } from 'next'

// Página de pago de reserva - no indexar
export const metadata: Metadata = {
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
