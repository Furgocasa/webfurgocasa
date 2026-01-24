import { Metadata } from 'next'

// Booking detail page - DO NOT index (personal customer data)
export const metadata: Metadata = {
  title: "Booking Details",
  description: "Your campervan booking information",
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

export default function BookingDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
