import { Metadata } from 'next'

// Booking form page - DO NOT index (private data)
export const metadata: Metadata = {
  title: "New Booking",
  description: "Complete your campervan or motorhome booking",
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

export default function NewBookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
