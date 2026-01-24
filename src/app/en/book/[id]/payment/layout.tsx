import { Metadata } from 'next'

// Booking payment page - do not index
export const metadata: Metadata = {
  title: "Booking Payment",
  description: "Complete the payment for your motorhome booking",
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
