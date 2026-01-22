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
  // Usamos una imagen hero del repositorio (hero-05 suele tener buenas campers)
  const imagePath = join(process.cwd(), 'public/images/slides/hero-05.webp')
  const imageBuffer = await readFile(imagePath)
  const imageBase64 = `data:image/webp;base64,${imageBuffer.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Imagen de fondo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageBase64}
          alt={alt}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
        />
        {/* Overlay oscuro para mejor legibilidad */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
          }}
        />
        {/* Texto */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 60,
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              margin: 0,
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            Campers en Venta
          </h1>
          <p
            style={{
              fontSize: 32,
              margin: 0,
              marginTop: 10,
              color: '#f97316',
              textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            Ocasión con Garantía · Historial Completo
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
