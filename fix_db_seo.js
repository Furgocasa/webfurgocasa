const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function truncateTitle(title, maxLength = 60) {
  if (!title) return null;
  if (title.length <= maxLength) return title;
  const truncated = title.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength - 15) {
    return truncated.substring(0, lastSpace).trim();
  }
  return truncated.trim();
}

function truncateDesc(desc, maxLength = 155) {
  if (!desc) return null;
  if (desc.length <= maxLength) return desc;
  const truncated = desc.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength - 20) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }
  return truncated.trim() + '...';
}

async function fix() {
  console.log("Fixing locations...");
  const { data: locations } = await supabase.from('location_targets').select('id, meta_title, meta_description');
  for (const loc of (locations || [])) {
    let update = {};
    if (loc.meta_title && loc.meta_title.length > 60) update.meta_title = truncateTitle(loc.meta_title, 60);
    if (loc.meta_description && loc.meta_description.length > 155) update.meta_description = truncateDesc(loc.meta_description, 155);
    
    if (Object.keys(update).length > 0) {
      await supabase.from('location_targets').update(update).eq('id', loc.id);
    }
  }

  console.log("Fixing posts...");
  const { data: posts } = await supabase.from('posts').select('id, meta_title, meta_description');
  for (const p of (posts || [])) {
    let update = {};
    if (p.meta_title && p.meta_title.length > 60) update.meta_title = truncateTitle(p.meta_title, 60);
    if (p.meta_description && p.meta_description.length > 155) update.meta_description = truncateDesc(p.meta_description, 155);
    
    if (Object.keys(update).length > 0) {
      await supabase.from('posts').update(update).eq('id', p.id);
    }
  }

  console.log("Fixing vehicles...");
  const { data: vehicles } = await supabase.from('vehicles').select('id, meta_title, meta_description');
  for (const v of (vehicles || [])) {
    let update = {};
    if (v.meta_title && v.meta_title.length > 60) update.meta_title = truncateTitle(v.meta_title, 60);
    if (v.meta_description && v.meta_description.length > 155) update.meta_description = truncateDesc(v.meta_description, 155);
    
    if (Object.keys(update).length > 0) {
      await supabase.from('vehicles').update(update).eq('id', v.id);
    }
  }

  console.log("Fixing translations...");
  const { data: translations } = await supabase.from('content_translations').select('id, source_field, translated_text');
  for (const t of (translations || [])) {
    let newText = null;
    if (t.source_field === 'meta_title' && t.translated_text && t.translated_text.length > 60) {
      newText = truncateTitle(t.translated_text, 60);
    }
    if (t.source_field === 'meta_description' && t.translated_text && t.translated_text.length > 155) {
      newText = truncateDesc(t.translated_text, 155);
    }
    
    if (newText) {
      await supabase.from('content_translations').update({ translated_text: newText }).eq('id', t.id);
    }
  }

  console.log("Fix done!");
}

fix();