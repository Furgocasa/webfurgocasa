export function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="lg:col-span-9">
        {/* Search bar skeleton */}
        <div className="mb-12">
          <div className="h-14 bg-white rounded-xl border-2 border-gray-200 animate-pulse mb-6"></div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-white rounded-full border border-gray-200 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Featured posts skeleton */}
        <div className="mb-16">
          <div className="h-10 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regular posts skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
