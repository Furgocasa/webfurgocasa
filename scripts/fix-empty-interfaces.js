const fs = require('fs');
const path = require('path');

// Encuentra todos los archivos page.tsx en src/app
function findPageFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Recursivo en subdirectorios
      results = results.concat(findPageFiles(filePath));
    } else if (file === 'page.tsx') {
      results.push(filePath);
    }
  });
  
  return results;
}

// Arregla las interfaces vacías con ; suelto
function fixEmptyInterfaces(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Patrón 1: interface PageProps {\n  ;\n}
  const pattern1 = /interface PageProps \{\s*;\s*\}/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, 'interface PageProps {}');
    modified = true;
  }
  
  // Patrón 2: interface BlogPageProps {\n  ;\n  searchParams...
  const pattern2 = /interface BlogPageProps \{\s*;\s*\n/g;
  if (pattern2.test(content)) {
    content = content.replace(pattern2, 'interface BlogPageProps {\n');
    modified = true;
  }
  
  // Patrón 3: cualquier interface con ; suelto
  const pattern3 = /interface (\w+) \{\s*;\s*\n/g;
  if (pattern3.test(content)) {
    content = content.replace(pattern3, 'interface $1 {\n');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main
const appDir = path.join(__dirname, '..', 'src', 'app');
const pageFiles = findPageFiles(appDir);

console.log(`🔍 Encontrados ${pageFiles.length} archivos page.tsx`);

let fixed = 0;
pageFiles.forEach(file => {
  if (fixEmptyInterfaces(file)) {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`✅ Corregido: ${relativePath}`);
    fixed++;
  }
});

console.log(`\n✅ Total corregidos: ${fixed} archivos`);
