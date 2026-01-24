import { Metadata } from 'next'

// Vehicle selection page - DO NOT index (booking process)
export const metadata: Metadata = {
  title: "Select Vehicle",
  description: "Choose your campervan or motorhome to book",
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

export default function VehicleBookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
