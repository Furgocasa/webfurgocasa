import { Metadata } from 'next'

// Página de selección de vehículo - NO indexar (proceso de reserva)
export const metadata: Metadata = {
  title: "Seleccionar Vehículo",
  description: "Elige tu camper o autocaravana para reservar",
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

export default function VehiculoReservaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
