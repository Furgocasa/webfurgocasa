require('dotenv').config({path:'.env.local'});
const{createClient}=require('@supabase/supabase-js');
const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const {data} = await s.from('posts').select('id, title, content, featured_image').ilike('content','%torrevieja%');
  
  console.log(`Encontrados ${data.length} posts\n`);
  
  for (const post of data) {
    console.log(`Post: ${post.title}`);
    console.log(`Featured: ${post.featured_image}`);
    
    // Buscar cualquier URL que contenga torrevieja
    const idx = post.content.indexOf('torrevieja');
    if (idx > -1) {
      // Mostrar contexto
      const start = Math.max(0, idx - 100);
      const end = Math.min(post.content.length, idx + 200);
      console.log(`Contexto: ...${post.content.substring(start, end)}...`);
    }
    console.log('---');
  }
}

main();
