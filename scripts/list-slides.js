require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listSlides() {
  const { data, error } = await supabase.storage.from('media').list('slides', { limit: 100 });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Imágenes en media/slides:');
  data.forEach(file => console.log(`  - ${file.name}`));
  console.log(`\nTotal: ${data.length} archivos`);
}

listSlides();
