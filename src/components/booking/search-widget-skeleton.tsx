/**
 * Skeleton SSR del SearchWidget.
 *
 * Server Component que reproduce el "shell" visual del SearchWidget real
 * (mismas alturas y bordes) para que se renderice instantáneamente en el
 * HTML inicial mientras el bundle pesado (date-fns, react-day-picker,
 * LocationSelector, etc.) se descarga e hidrata en cliente.
 *
 * Importante: NO debe contener interactividad ni traducciones dinámicas.
 * Su único objetivo es ocupar EL MISMO ESPACIO visual para evitar CLS y
 * permitir al hero pintar el LCP sin esperar al JS del widget.
 */
export function SearchWidgetSkeleton() {
  return (
    <div
      className="relative bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-2xl"
      aria-busy="true"
      aria-label="Cargando buscador"
    >
      <div className="space-y-4 lg:space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Ubicación - coincide con LocationSelector (py-3.5 border-2) */}
          <div className="space-y-2 lg:col-span-4">
            <div className="h-3 lg:h-3.5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-[52px] w-full bg-gray-50 rounded-lg border-2 border-gray-300" />
          </div>

          {/* Fecha - coincide con DateRangePicker */}
          <div className="space-y-2 lg:col-span-4">
            <div className="h-3 lg:h-3.5 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-[52px] w-full bg-gray-50 rounded-lg border-2 border-gray-300" />
          </div>

          {/* Horas - coincide con TimeSelector */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:col-span-4">
            <div className="space-y-2">
              <div className="h-3 lg:h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-[52px] w-full bg-gray-50 rounded-lg border-2 border-gray-300" />
            </div>
            <div className="space-y-2">
              <div className="h-3 lg:h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-[52px] w-full bg-gray-50 rounded-lg border-2 border-gray-300" />
            </div>
          </div>
        </div>

        {/* Botón Buscar - replica py-4 lg:py-5 text-base lg:text-lg del real */}
        <div className="w-full py-4 lg:py-5 px-8 bg-furgocasa-blue/80 rounded-lg lg:rounded-xl flex items-center justify-center text-base lg:text-lg">
          <span className="invisible">Buscar</span>
        </div>
      </div>
    </div>
  );
}
