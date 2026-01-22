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
  // Usamos una imagen hero del repositorio
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
          background: `url(${imageBase64})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          alignItems: 'flex-end',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '30px 40px',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '10px',
            }}
          >
            Campers en Venta
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#f97316',
            }}
          >
            Ocasión con Garantía · Historial Completo
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
