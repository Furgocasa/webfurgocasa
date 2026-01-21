// =====================================================
// EDGE FUNCTION: Procesar cola de traducciones con OpenAI
// =====================================================
// Supabase Edge Function (Deno runtime)
// 
// Uso:
// - Llamar via HTTP POST para procesar traducciones pendientes
// - Se puede configurar como cron job en Supabase
// - También se puede llamar manualmente desde el admin
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuración de OpenAI
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = "gpt-4o-mini"; // Económico y rápido para traducciones

// Configuración de Supabase
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Límites
const BATCH_SIZE = 10; // Procesar 10 traducciones por llamada
const MAX_RETRIES = 3;

// Mapeo de idiomas
const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
};

// Tipos de contenido para ajustar el prompt
const CONTENT_TYPES: Record<string, string> = {
  title: "a title/headline",
  excerpt: "a brief excerpt/summary",
  content: "article content (HTML)",
  description: "a description",
  short_description: "a short description",
  meta_title: "an SEO meta title (max 60 chars)",
  meta_description: "an SEO meta description (max 160 chars)",
  name: "a name/title",
  h1_title: "a main page heading (H1)",
  intro_text: "introductory text",
};

interface TranslationQueueItem {
  id: string;
  source_table: string;
  source_id: string;
  source_field: string;
  source_text: string;
  locale: string;
  attempts: number;
}

interface TranslationResult {
  success: boolean;
  translated_text?: string;
  error?: string;
}

// Función principal para traducir con OpenAI
async function translateWithOpenAI(
  text: string,
  targetLocale: string,
  contentType: string
): Promise<TranslationResult> {
  if (!OPENAI_API_KEY) {
    return { success: false, error: "OPENAI_API_KEY not configured" };
  }

  const targetLanguage = LOCALE_NAMES[targetLocale] || "English";
  const contentDescription = CONTENT_TYPES[contentType] || "text content";

  // Determinar si es HTML
  const isHtml = text.includes("<") && text.includes(">");
  
  const systemPrompt = `You are a professional translator specializing in travel and campervan rental content. 
Translate the following Spanish text to ${targetLanguage}.
${isHtml ? "Preserve all HTML tags and structure exactly as they are." : ""}
The text is ${contentDescription}.
Only return the translated text, nothing else.
Maintain the same tone and style as the original.
Do not add any explanations or notes.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.3, // Bajo para traducciones consistentes
        max_tokens: Math.min(text.length * 2, 4000), // Estimación generosa
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `OpenAI API error: ${response.status} - ${errorData}` };
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      return { success: false, error: "No translation returned from OpenAI" };
    }

    return { success: true, translated_text: translatedText };
  } catch (error) {
    return { success: false, error: `Translation error: ${error.message}` };
  }
}

// Procesar un item de la cola
async function processQueueItem(
  supabase: ReturnType<typeof createClient>,
  item: TranslationQueueItem
): Promise<boolean> {
  console.log(`Processing: ${item.source_table}.${item.source_field} -> ${item.locale}`);

  // Marcar como procesando
  await supabase
    .from("translation_queue")
    .update({ status: "processing", attempts: item.attempts + 1 })
    .eq("id", item.id);

  // Traducir
  const result = await translateWithOpenAI(
    item.source_text,
    item.locale,
    item.source_field
  );

  if (result.success && result.translated_text) {
    // Guardar traducción
    const { error: insertError } = await supabase
      .from("content_translations")
      .upsert({
        source_table: item.source_table,
        source_id: item.source_id,
        source_field: item.source_field,
        locale: item.locale,
        translated_text: result.translated_text,
        is_auto_translated: true,
        translation_model: OPENAI_MODEL,
      }, {
        onConflict: "source_table,source_id,source_field,locale",
      });

    if (insertError) {
      console.error("Error saving translation:", insertError);
      await supabase
        .from("translation_queue")
        .update({ 
          status: "failed", 
          error_message: `DB error: ${insertError.message}` 
        })
        .eq("id", item.id);
      return false;
    }

    // Marcar como completado
    await supabase
      .from("translation_queue")
      .update({ 
        status: "completed", 
        processed_at: new Date().toISOString() 
      })
      .eq("id", item.id);

    console.log(`✅ Translated: ${item.source_table}.${item.source_field} -> ${item.locale}`);
    return true;
  } else {
    // Marcar como fallido
    const newStatus = item.attempts + 1 >= MAX_RETRIES ? "failed" : "pending";
    await supabase
      .from("translation_queue")
      .update({ 
        status: newStatus, 
        error_message: result.error 
      })
      .eq("id", item.id);

    console.error(`❌ Failed: ${result.error}`);
    return false;
  }
}

// Handler principal
serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Crear cliente Supabase con service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Obtener items pendientes de la cola
    const { data: queueItems, error: fetchError } = await supabase
      .from("translation_queue")
      .select("*")
      .eq("status", "pending")
      .lt("attempts", MAX_RETRIES)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw new Error(`Error fetching queue: ${fetchError.message}`);
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No pending translations", 
          processed: 0 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    console.log(`Found ${queueItems.length} pending translations`);

    // Procesar cada item
    let successCount = 0;
    let failCount = 0;

    for (const item of queueItems) {
      const success = await processQueueItem(supabase, item as TranslationQueueItem);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Pequeña pausa para no saturar OpenAI
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Obtener stats actualizados
    const { data: stats } = await supabase
      .from("translation_queue")
      .select("status")
      .then(({ data }) => ({
        data: {
          pending: data?.filter((d) => d.status === "pending").length || 0,
          completed: data?.filter((d) => d.status === "completed").length || 0,
          failed: data?.filter((d) => d.status === "failed").length || 0,
        },
      }));

    return new Response(
      JSON.stringify({
        message: "Processing complete",
        processed: queueItems.length,
        success: successCount,
        failed: failCount,
        queue_stats: stats,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
