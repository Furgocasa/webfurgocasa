import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * POST /api/blog/views
 * 
 * Incrementa las visitas de un artículo del blog de forma atómica.
 * Se llama desde el cliente para evitar el cacheo de ISR.
 * Usa service_role porque RLS solo permite SELECT público en posts.
 * 
 * Body:
 * - postId: UUID del post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId || typeof postId !== "string" || !UUID_RE.test(postId)) {
      return NextResponse.json(
        { error: "postId es requerido" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Usar la función SQL atómica para evitar race conditions
    const { error } = await supabase.rpc("increment_post_views", {
      post_id: postId,
    });

    if (error) {
      console.error("Error incrementando vistas:", error);
      return NextResponse.json(
        { error: "Error al incrementar vistas" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/blog/views:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
