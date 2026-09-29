import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase";
import { arrancarPipeline } from "@/lib/pipeline";
import { BASE_URL } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Endpoint ADMIN para reintentar un pedido que quedó en "error"
 * (por ejemplo, porque Gemini devolvió 503 en todos los modelos, o fal falló).
 *
 * Sin esto, cada error transitorio de un proveedor = una venta perdida y un
 * cliente al que tenés que pedirle que vuelva a cargar todo el formulario.
 *
 * Uso (desde tu terminal, nunca desde el frontend):
 *   curl -X POST https://TU-DOMINIO/api/reintentar/<pedidoId> \
 *        -H "x-admin-secret: $ADMIN_SECRET"
 *
 * Requiere la env var ADMIN_SECRET en Vercel (un string largo y random).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { pedidoId: string } }
) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.headers.get("x-admin-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { pedidoId } = params;

  const { data: pedido, error } = await supabaseAdmin
    .from("pedidos")
    .select("id, status")
    .eq("id", pedidoId)
    .single();

  if (error || !pedido) {
    return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
  }

  if (pedido.status !== "error") {
    return NextResponse.json(
      { ok: false, error: `El pedido está en "${pedido.status}", solo se reintentan los que están en "error"` },
      { status: 400 }
    );
  }

  // Volvemos a "generando" y limpiamos lo que haya quedado a medias.
  // Si alguna variante ya se había subido a B2, se vuelve a generar igual
  // (más simple que reconciliar a medias; cuesta US$0,16).
  await supabaseAdmin
    .from("pedidos")
    .update({
      status: "generando",
      error_message: null,
      url_a: null,
      url_b: null,
      snippet_a: null,
      snippet_b: null,
      fal_request_id_a: null,
      fal_request_id_b: null,
    })
    .eq("id", pedidoId);

  waitUntil(arrancarPipeline(pedidoId, BASE_URL));

  return NextResponse.json({ ok: true, mensaje: "Pipeline relanzado" });
}
