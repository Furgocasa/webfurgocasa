import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const runtime = 'nodejs'
export const alt = 'Autocaravanas y Campers en Venta | Furgocasa'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  // Leemos el logo de Furgocasa del disco (está en el repo)
  const imagePath = join(process.cwd(), 'public/icon-512x512.png')
  const imageBuffer = await readFile(imagePath)
  const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageBase64}
          alt="Furgocasa Logo"
          width={300}
          height={300}
          style={{
            marginBottom: 40,
          }}
        />
        <h1
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Campers en Venta
        </h1>
        <p
          style={{
            fontSize: 32,
            color: '#f97316',
            textAlign: 'center',
            margin: 0,
            marginTop: 20,
          }}
        >
          Ocasión con Garantía
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
