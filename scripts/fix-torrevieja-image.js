/**
 * Script para arreglar la URL rota de la imagen de Torrevieja
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Buscar el post con la imagen rota
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, content')
    .ilike('content', '%torrevieja_area_autocaravanas_licencia%');
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  if (!posts || posts.length === 0) {
    console.log('No se encontró ningún post con esa imagen');
    return;
  }
  
  for (const post of posts) {
    console.log(`\n📝 Post: "${post.title}"`);
    console.log(`   Slug: ${post.slug}`);
    
    // Buscar todas las variantes de la URL
    const urlPatterns = [
      /https:\/\/[^"'\s]+torrevieja_area_autocaravanas_licencia[^"'\s]*/gi
    ];
    
    let newContent = post.content;
    let changes = 0;
    
    for (const pattern of urlPatterns) {
      const matches = post.content.match(pattern);
      if (matches) {
        console.log('\n   URLs encontradas:');
        for (const match of matches) {
          console.log(`   - ${match}`);
          
          // Si la URL está truncada (no termina en .webp)
          if (!match.endsWith('.webp')) {
            // Intentar arreglarla
            let fixedUrl = match;
            
            // Si tiene "(2" sin cerrar, arreglarlo
            if (match.includes('(2') && !match.includes('(2)')) {
              fixedUrl = match.replace(/\(2[^)]*$/, '(2).webp');
              console.log(`   ✅ Arreglada a: ${fixedUrl}`);
              newContent = newContent.replace(match, fixedUrl);
              changes++;
            }
          }
        }
      }
    }
    
    if (changes > 0) {
      console.log(`\n   💾 Guardando ${changes} cambios...`);
      
      const { error: updateError } = await supabase
        .from('posts')
        .update({ content: newContent })
        .eq('id', post.id);
      
      if (updateError) {
        console.log(`   ❌ Error: ${updateError.message}`);
      } else {
        console.log(`   ✅ Post actualizado!`);
      }
    } else {
      console.log('\n   ℹ️  No hay cambios necesarios');
    }
  }
}

main().catch(console.error);
