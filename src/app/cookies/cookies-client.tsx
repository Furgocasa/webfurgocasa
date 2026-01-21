"use client";

export function CookiesClient() {
  const openCookieSettings = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openCookieSettings"));
    }
  };

  return (
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
              menos populares y ver cómo se mueven los visitantes por el sitio.
            </p>
            <table>
              <thead>
                <tr><th>Cookie</th><th>Proveedor</th><th>Duración</th><th>Descripción</th></tr>
              </thead>
              <tbody>
                <tr><td>_ga</td><td>Google Analytics</td><td>2 años</td><td>Distingue usuarios</td></tr>
                <tr><td>_ga_*</td><td>Google Analytics</td><td>2 años</td><td>Mantiene el estado de sesión</td></tr>
              </tbody>
            </table>

            <h3>2.3 Cookies de marketing</h3>
            <p>
              Estas cookies se utilizan para rastrear a los visitantes en los sitios web. La intención 
              es mostrar anuncios relevantes y atractivos para el usuario individual.
            </p>
            <table>
              <thead>
                <tr><th>Cookie</th><th>Proveedor</th><th>Duración</th><th>Descripción</th></tr>
              </thead>
              <tbody>
                <tr><td>_fbp</td><td>Meta (Facebook)</td><td>3 meses</td><td>Seguimiento de conversiones</td></tr>
              </tbody>
            </table>

            <h2>3. Gestión de cookies</h2>
            <p>
              Puedes gestionar tus preferencias de cookies en cualquier momento haciendo clic en el 
              botón de abajo o en el enlace "Configuración de cookies" en el pie de página.
            </p>
            
            <button
              onClick={openCookieSettings}
              className="bg-furgocasa-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-furgocasa-blue-dark transition-colors"
            >
              Configurar cookies
            </button>

            <h2>4. Contacto</h2>
            <p>
              Si tienes preguntas sobre nuestra política de cookies, puedes contactarnos en:
            </p>
            <ul>
              <li><strong>Email:</strong> privacidad@furgocasa.com</li>
              <li><strong>Teléfono:</strong> +34 868 36 41 61</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
