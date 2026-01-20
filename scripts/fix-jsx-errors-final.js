const fs = require('fs');
const path = require('path');

const fixes = [
  // 1. [location]/page.tsx
  {
    file: 'src/app/[location]/page.tsx',
    search: `    return ({/* ✅ SCHEMA.ORG JSON-LD (SEO estructurado) */}
        <SaleLocationJsonLd location={saleLocationData as any} />

        <main className="min-h-screen bg-gray-50">`,
    replace: `    return (
      <>
        {/* ✅ SCHEMA.ORG JSON-LD (SEO estructurado) */}
        <SaleLocationJsonLd location={saleLocationData as any} />

        <main className="min-h-screen bg-gray-50">`
  },
  // 2. alquiler-autocaravanas-campervans-[location]/page.tsx
  {
    file: 'src/app/alquiler-autocaravanas-campervans-[location]/page.tsx',
    search: `  return (<LocalBusinessJsonLd location={location} />
      <main className="min-h-screen bg-gray-50">`,
    replace: `  return (
    <>
      <LocalBusinessJsonLd location={location} />
      <main className="min-h-screen bg-gray-50">`
  },
  // 3. blog/[category]/[slug]/page.tsx
  {
    file: 'src/app/blog/[category]/[slug]/page.tsx',
    search: `  return (<BlogPostJsonLd post={post} url={url} />
      <main className="min-h-screen bg-gray-50 font-amiko">`,
    replace: `  return (
    <>
      <BlogPostJsonLd post={post} url={url} />
      <main className="min-h-screen bg-gray-50 font-amiko">`
  },
  // 4. blog/[category]/page.tsx - Arreglar fragment roto
  {
    file: 'src/app/blog/[category]/page.tsx',
    search: `                              </span>
                              <span>•</span>)}
                          <span className="flex items-center gap-1">`,
    replace: `                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span className="flex items-center gap-1">`
  },
  // 5. buscar/page.tsx - Arreglar fragment roto
  {
    file: 'src/app/buscar/page.tsx',
    search: `                      </p>)}
                </div>
              )}`,
    replace: `                      </p>
                    </>
                  )}
                </div>
              )}`
  },
  // 6. page.tsx
  {
    file: 'src/app/page.tsx',
    search: `  return (<OrganizationJsonLd />
      <ProductJsonLd vehicles={featuredVehicles} />
      <WebsiteJsonLd />
      
      <PublicLayout>`,
    replace: `  return (
    <>
      <OrganizationJsonLd />
      <ProductJsonLd vehicles={featuredVehicles} />
      <WebsiteJsonLd />
      
      <PublicLayout>`
  },
];

console.log('🔧 Arreglando errores de sintaxis JSX...\n');

let fixed = 0;
let notFound = 0;

fixes.forEach((fix, index) => {
  const fullPath = path.join(process.cwd(), fix.file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  No existe: ${fix.file}`);
    notFound++;
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes(fix.search)) {
    content = content.replace(fix.search, fix.replace);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${index + 1}. Arreglado: ${fix.file}`);
    fixed++;
  } else {
    console.log(`ℹ️  ${index + 1}. No encontrado pattern en: ${fix.file}`);
    notFound++;
  }
});

console.log(`\n📊 Resumen:`);
console.log(`✅ Arreglados: ${fixed}`);
console.log(`ℹ️  No encontrados: ${notFound}`);
console.log(`📁 Total: ${fixes.length}`);
