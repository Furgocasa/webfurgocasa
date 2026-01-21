const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function countImages() {
  const { data, error } = await supabase.storage.from('blog').list('', { limit: 1000 });
  
  if (error) {
    console.error(error);
    return;
  }
  
  let total = 0;
  const yearFolders = data.filter(f => f.name.match(/^\d{4}$/));
  
  for (const yearFolder of yearFolders) {
    const { data: months } = await supabase.storage
      .from('blog')
      .list(yearFolder.name, { limit: 1000 });
    
    if (months) {
      const monthFolders = months.filter(f => f.name.match(/^\d{2}$/));
      
      for (const monthFolder of monthFolders) {
        const { data: images } = await supabase.storage
          .from('blog')
          .list(`${yearFolder.name}/${monthFolder.name}`, { limit: 1000 });
        
        if (images) {
          console.log(`${yearFolder.name}/${monthFolder.name}: ${images.length} imágenes`);
          total += images.length;
        }
      }
    }
  }
  
  console.log(`\n✅ TOTAL: ${total} imágenes en Supabase Storage`);
}

countImages();
