import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

type Params = { params: Promise<{ slug: string }> };

/**
 * SYSTEM PROMPT de la IA editora de mailings de Furgocasa.
 * Ajustar con mimo: cualquier cambio impacta TODOS los HTMLs generados.
 */
const SYSTEM_PROMPT = `Eres la Inteligencia Artificial editora de mailings de Furgocasa (alquiler de autocaravanas y campers en España).
Tu tarea: generar el HTML COMPLETO de un email de marketing para los contactos de la base de datos (clientes pasados, suscriptores de la web, leads), basándote en los ejemplos de estilo que se te proporcionen y en el briefing que describe la campaña.

REGLA DE ORO: NO resumas, NO entregues una versión "mini". El email debe estar desarrollado, con varias secciones, copywriting trabajado y pensado para que quien lo reciba lo lea con ganas. Si tienes ejemplos de referencia, tu output debe tener extensión y riqueza equivalentes a esos ejemplos (± 20%). Prefiere pasarte que quedarte corto.

ESTRUCTURA MÍNIMA OBLIGATORIA (en este orden):
1. Preheader oculto (hidden preview text, 80-120 caracteres).
2. Cabecera con el logo principal.
3. Hero: titular corto + subtítulo empático de 1-2 frases.
4. Saludo personalizado con {{NOMBRE}} (y opcionalmente {{CIUDAD}} si aplica a la campaña).
5. Cuerpo principal: 3-5 párrafos de texto desarrollado (mínimo 3-4 frases cada uno). Empática, cercana, en segunda persona del singular (tuteo).
6. Al menos UN bloque destacado (caja de color, tipo "lo que incluye", "por qué elegirnos"): sub-sección con 3-5 ítems en lista/checklist, cada ítem con icono/emoji y 1 frase de desarrollo.
7. CTA principal: botón grande con href absoluto a https://www.furgocasa.com/... (según briefing). 1-2 frases de contexto debajo.
8. Sección secundaria (p. ej. "Cómo funciona", "Testimonio", "Destinos favoritos"): otro bloque con 2-3 puntos más.
9. Cierre cálido firmado por "El equipo de Furgocasa".
10. Footer: logo, redes sociales como imágenes, enlace de baja con {{UNSUBSCRIBE_URL}}, dirección postal y copyright.

REQUISITOS TÉCNICOS OBLIGATORIOS DEL HTML:
1. <!doctype html>, estructura con tablas (no flex/grid), CSS inline en cada etiqueta crítica.
2. Ancho máximo 600px. Responsive: móvil apilado (@media (max-width:600px)).
3. UTF-8. <meta charset="utf-8">, <meta name="viewport">, <meta name="color-scheme" content="light dark">.
4. Paleta coherente con la marca: azul corporativo #063971, blancos, grises suaves, terracota/acento cálido si hace falta. Titulares en Arial/Georgia (no web fonts externas).
5. Cabecera con logo: <img src="https://www.furgocasa.com/images/brand/LOGO%20AZUL.png" alt="Furgocasa" width="160" style="display:block;max-width:160px;height:auto;">.
6. Footer con el mismo logo (o alguna variante si el briefing lo pide).
7. Enlace de baja con EXACTAMENTE el placeholder {{UNSUBSCRIBE_URL}}: <a href="{{UNSUBSCRIBE_URL}}" style="color:#6b7280;text-decoration:underline;">Darme de baja</a>.
8. Iconos redes sociales como <img> (no texto, no SVG inline), EXACTAMENTE estas URLs:
   Instagram → https://www.furgocasa.com/images/mailing/instagram.png  (28x28)
   Facebook  → https://www.furgocasa.com/images/mailing/facebook.png   (28x28)
   style="display:block;border:0;width:28px;height:28px;" envueltos en celdas de tabla con padding.
9. Placeholders dinámicos — EXACTAMENTE estos literales y solo estos:
   {{NOMBRE}}         · nombre de pila del contacto (si no hay, se sustituye por "hola")
   {{CIUDAD}}         · ciudad del contacto (puede venir vacío)
   {{UNSUBSCRIBE_URL}}· URL de baja única del contacto
10. Todos los href de www.furgocasa.com en https absoluto.
11. NO incluyas explicaciones, comentarios de JSON ni markdown. Devuelve SOLO el HTML.
12. Longitud mínima 400 líneas si no hay referencias. Con referencias, iguala su extensión (±20%).

TONO: cercano, empático, profesional. Español de España. Evita anglicismos. Tuteo al destinatario. Debe sonar a persona escribiendo, no a plantilla. Estilo aventurero-acogedor: apela a viajar con libertad, descubrir, desconectar, vivir experiencias.

Si los ejemplos incluyen componentes (cajas destacadas, checklist, cita, testimonio, CTA, "regalo"), REUSA esos componentes adaptando el contenido: no los omitas para "ahorrar".

El usuario te dará un briefing y hasta 2 campañas previas como referencia. Devuelve SOLO el HTML completo.`;

function trimToN(str: string, n: number): string {
  if (!str) return '';
  return str.length <= n ? str : str.slice(0, n);
}

export async function POST(req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;
  const sb = g.sb;

  const body = await req.json().catch(() => ({}));
  const briefing = (body.briefing || '').toString();
  const referenceIds = Array.isArray(body.reference_ids)
    ? (body.reference_ids.slice(0, 2) as string[])
    : [];

  if (!briefing.trim()) {
    return new Response(JSON.stringify({ error: 'El briefing es obligatorio' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Falta OPENAI_API_KEY en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: campaign } = await sb.from('mailing_campaigns')
    .select('id, slug, subject, description')
    .eq('slug', slug)
    .maybeSingle();
  if (!campaign) {
    return new Response(JSON.stringify({ error: 'Campaña no encontrada' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let referencesBlock = '';
  if (referenceIds.length) {
    const { data: refs } = await sb.from('mailing_campaigns')
      .select('id, subject, description, html_content')
      .in('id', referenceIds);
    (refs || []).forEach((r, i) => {
      referencesBlock += `\n\n--- Referencia ${i + 1} ---\nSubject: ${r.subject}\nDescripción: ${r.description || ''}\nHTML:\n${trimToN(r.html_content || '', 12000)}\n`;
    });
  }

  const userPrompt = `Briefing del admin:\n"""\n${briefing}\n"""\n\nAsunto propuesto: ${campaign.subject}\nDescripción de la campaña: ${campaign.description || '(sin descripción)'}\n${referencesBlock ? `Campañas de referencia (úsalas como estilo, extensión y estructura):${referencesBlock}` : 'No hay campañas de referencia. Apóyate solo en la guía de estilo.'}\n\nGenera AHORA el HTML completo de la nueva campaña respetando todas las reglas del sistema. Devuelve SOLO el HTML sin comentarios.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function push(kind: string, data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`event: ${kind}\ndata: ${JSON.stringify(data)}\n\n`));
      }
      let collected = '';
      try {
        push('status', { message: 'Llamando a OpenAI gpt-4o-mini...' });
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            stream: true,
            temperature: 0.7,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userPrompt },
            ],
          }),
        });

        if (!response.ok || !response.body) {
          const txt = await response.text().catch(() => '');
          push('error', { message: `OpenAI respondió ${response.status}: ${txt.slice(0, 400)}` });
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') continue;
            try {
              const json = JSON.parse(payload);
              const delta: string | undefined = json.choices?.[0]?.delta?.content;
              if (delta) {
                collected += delta;
                push('delta', { text: delta });
              }
            } catch {
              // línea suelta o keep-alive, ignoramos.
            }
          }
        }

        // Limpieza: si OpenAI envuelve con ```html ... ```
        let html = collected.trim();
        if (html.startsWith('```')) {
          html = html.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim();
        }

        if (!html) {
          push('error', { message: 'OpenAI no devolvió contenido.' });
          controller.close();
          return;
        }

        push('status', { message: 'Guardando HTML en la base de datos...' });
        const { error: updErr } = await sb.from('mailing_campaigns')
          .update({
            html_content: html,
            generation_prompt: briefing,
            generation_reference_ids: referenceIds.length ? referenceIds : null,
          })
          .eq('id', campaign.id);
        if (updErr) {
          push('error', { message: `No se pudo guardar el HTML: ${updErr.message}` });
          controller.close();
          return;
        }

        push('done', { length: html.length });
        controller.close();
      } catch (e) {
        push('error', { message: (e as Error).message || String(e) });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
    },
  });
}
