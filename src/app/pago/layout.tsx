import { Metadata } from 'next'

// Todas las páginas de pago no deben indexarse
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

export default function PagoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
