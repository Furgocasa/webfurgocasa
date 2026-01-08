"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function CookiesPage() {
  const openCookieSettings = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openCookieSettings"));
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-furgocasa-blue py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Política de Cookies</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto prose prose-gray max-w-none">
              <p className="text-gray-500">Última actualización: Enero 2024</p>

              <h2>1. ¿Qué son las cookies?</h2>
              <p>
                Las cookies son pequeños archivos de texto que los sitios web colocan en tu dispositivo 
                cuando los visitas. Se utilizan ampliamente para hacer que los sitios web funcionen de 
                manera más eficiente, así como para proporcionar información a los propietarios del sitio.
              </p>

              <h2>2. ¿Qué tipos de cookies utilizamos?</h2>
              
              <h3>2.1 Cookies estrictamente necesarias</h3>
              <p>
                Estas cookies son esenciales para que puedas navegar por el sitio web y utilizar sus 
                funciones. Sin estas cookies, no podríamos proporcionar ciertos servicios que has solicitado.
              </p>
              <table>
                <thead>
                  <tr><th>Cookie</th><th>Duración</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                  <tr><td>furgocasa_cookie_consent</td><td>1 año</td><td>Almacena si has dado consentimiento</td></tr>
                  <tr><td>furgocasa_cookie_preferences</td><td>1 año</td><td>Almacena tus preferencias de cookies</td></tr>
                </tbody>
              </table>

              <h3>2.2 Cookies de rendimiento/analíticas</h3>
              <p>
                Estas cookies nos permiten contar las visitas y fuentes de tráfico para poder medir y 
                mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas son las más y 
                menos populares y a ver cómo los visitantes se mueven por el sitio.
              </p>
              <table>
                <thead>
                  <tr><th>Cookie</th><th>Duración</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                  <tr><td>_ga</td><td>2 años</td><td>Google Analytics - Distingue usuarios únicos</td></tr>
                  <tr><td>_ga_*</td><td>2 años</td><td>Google Analytics - Mantiene el estado de sesión</td></tr>
                  <tr><td>_gid</td><td>24 horas</td><td>Google Analytics - Distingue usuarios</td></tr>
                </tbody>
              </table>

              <h3>2.3 Cookies de funcionalidad</h3>
              <p>
                Estas cookies permiten que el sitio web recuerde las elecciones que haces (como tu 
                nombre de usuario, idioma o la región en la que te encuentras) y proporcione funciones 
                mejoradas y más personales.
              </p>
              <table>
                <thead>
                  <tr><th>Cookie</th><th>Duración</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                  <tr><td>user_preferences</td><td>1 año</td><td>Almacena preferencias del usuario</td></tr>
                  <tr><td>recent_searches</td><td>30 días</td><td>Guarda búsquedas recientes de disponibilidad</td></tr>
                </tbody>
              </table>

              <h3>2.4 Cookies de marketing/publicidad</h3>
              <p>
                Estas cookies se utilizan para mostrar anuncios que sean relevantes para ti. También 
                se utilizan para limitar el número de veces que ves un anuncio y para ayudar a medir 
                la efectividad de las campañas publicitarias.
              </p>
              <table>
                <thead>
                  <tr><th>Cookie</th><th>Duración</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                  <tr><td>_fbp</td><td>3 meses</td><td>Facebook Pixel - Seguimiento de conversiones</td></tr>
                  <tr><td>_gcl_au</td><td>3 meses</td><td>Google Ads - Seguimiento de conversiones</td></tr>
                </tbody>
              </table>

              <h2>3. ¿Cómo gestionar las cookies?</h2>
              <p>
                Puedes gestionar tus preferencias de cookies en cualquier momento haciendo clic en el 
                botón "Configurar cookies" que encontrarás más abajo o en el pie de página de nuestro sitio web.
              </p>
              <p>
                También puedes configurar tu navegador para que rechace todas las cookies o para que 
                te avise cuando se envía una cookie. Sin embargo, si rechazas las cookies, es posible 
                que algunas partes de nuestro sitio web no funcionen correctamente.
              </p>
              
              <h3>Cómo gestionar cookies en los navegadores más comunes:</h3>
              <ul>
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              </ul>

              <h2>4. Cookies de terceros</h2>
              <p>
                Algunas cookies son colocadas por servicios de terceros que aparecen en nuestras páginas. 
                No controlamos la difusión de estas cookies. Debes consultar los sitios web de estos 
                terceros para obtener más información sobre sus cookies y cómo gestionarlas:
              </p>
              <ul>
                <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google (Analytics y Ads)</a></li>
                <li><a href="https://www.facebook.com/policy/cookies/" target="_blank" rel="noopener noreferrer">Facebook/Meta</a></li>
              </ul>

              <h2>5. Actualizaciones de esta política</h2>
              <p>
                Podemos actualizar esta política de cookies periódicamente. Te recomendamos que revises 
                esta página regularmente para estar informado sobre cómo utilizamos las cookies.
              </p>

              <h2>6. Contacto</h2>
              <p>
                Si tienes preguntas sobre nuestra política de cookies, puedes contactarnos en:
              </p>
              <ul>
                <li>Email: <a href="mailto:privacidad@furgocasa.com">privacidad@furgocasa.com</a></li>
                <li>Teléfono: +34 968 000 000</li>
                <li>Dirección: Calle Ejemplo, 123 - 30001 Murcia</li>
              </ul>

              {/* Botón para abrir configuración de cookies */}
              <div className="mt-8 p-6 bg-gray-100 rounded-xl not-prose">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Gestionar preferencias de cookies</h3>
                <p className="text-gray-600 mb-4">Puedes cambiar tus preferencias de cookies en cualquier momento.</p>
                <button 
                  onClick={openCookieSettings}
                  className="bg-furgocasa-orange text-white font-semibold py-2 px-6 rounded-lg hover:bg-furgocasa-orange-dark transition-colors"
                >
                  Configurar cookies
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
