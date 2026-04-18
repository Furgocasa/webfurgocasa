import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateBlogCoverFromTarget } from "@/lib/blog/generate-blog-cover";

export { generateBlogCoverFromTarget };

const requestSchema = z
  .object({
    postId: z.string().uuid().optional(),
    articleUrl: z.string().url().optional(),
    forceRegenerate: z.boolean().optional().default(true),
  })
  .refine((value) => Boolean(value.postId || value.articleUrl), {
    message: "Debes indicar postId o articleUrl",
  });

export async function POST(request: NextRequest) {
  try {
    const sessionSupabase = await createClient();
    const {
      data: { user },
    } = await sessionSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    const { data: admin } = await sessionSupabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json({ ok: false, error: "Acceso solo para administradores" }, { status: 403 });
    }

    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.errors.map((item) => item.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { postId, articleUrl, forceRegenerate } = parsedBody.data;
    const result = await generateBlogCoverFromTarget({
      postId,
      articleUrl,
      forceRegenerate,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[admin/blog/generate-cover]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Error interno generando la portada" },
      { status: 500 }
    );
  }
}
