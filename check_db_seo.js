const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  let longTitles = 0;
  let longDesc = 0;

  // 1. locations
  const { data: locations } = await supabase.from('location_targets').select('meta_title, meta_description');
  locations?.forEach(loc => {
     if (loc.meta_title && loc.meta_title.length > 60) longTitles++;
     if (loc.meta_description && loc.meta_description.length > 155) longDesc++;
  });

  // 2. posts
  const { data: posts } = await supabase.from('posts').select('meta_title, meta_description');
  posts?.forEach(p => {
     if (p.meta_title && p.meta_title.length > 60) longTitles++;
     if (p.meta_description && p.meta_description.length > 155) longDesc++;
  });

  // 3. vehicles
  const { data: vehicles } = await supabase.from('vehicles').select('meta_title, meta_description');
  vehicles?.forEach(v => {
     if (v.meta_title && v.meta_title.length > 60) longTitles++;
     if (v.meta_description && v.meta_description.length > 155) longDesc++;
  });

  // 4. translations
  const { data: translations } = await supabase.from('content_translations').select('source_field, translated_text');
  translations?.forEach(t => {
     if (t.source_field === 'meta_title' && t.translated_text && t.translated_text.length > 60) {
       longTitles++;
     }
     if (t.source_field === 'meta_description' && t.translated_text && t.translated_text.length > 155) {
       longDesc++;
     }
  });

  console.log("Total long titles (>60):", longTitles);
  console.log("Total long desc (>155):", longDesc);
}

check();