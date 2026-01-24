import { Metadata } from 'next'

// Special offer page - DO NOT index (booking process)
export const metadata: Metadata = {
  title: "Special Offer",
  description: "Book with your special offer",
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

export default function OfferBookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
