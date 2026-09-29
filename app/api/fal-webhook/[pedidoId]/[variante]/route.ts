import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { finalizarVariante, marcarError } from "@/lib/pipeline";
import { BASE_URL } from "@/lib/config";

export const runtime = "nodejs";
// Descargar un MP3 de ~2,5 min de fal y subirlo a B2 puede llevar 10-20s.
export const maxDuration = 60;

/**
 * Este endpoint recibe el aviso de fal.ai cuando UNA canción terminó de generarse.
 * URL: /api/fal-webhook/{pedidoId}/{variante}
 *
 * Los datos vienen por el path (no por query params) porque fal.ai
 * rechaza URLs con query params.
 *
 * Payload de fal: { request_id, status: "OK" | "ERROR", payload, error, ... }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { pedidoId: string; variante: string } }
) {
  try {
    const { pedidoId, variante } = params;

    if (!pedidoId || (variante !== "A" && variante !== "B")) {
      console.error("Webhook con params inválidos:", params);
      return NextResponse.json({ ok: false, error: "Params inválidos" }, { status: 400 });
    }

    const body = await req.json();
    const requestId = body?.request_id;
    const status = body?.status;

    console.log(`Webhook fal.ai — pedido ${pedidoId} variante ${variante} status ${status}`);

    if (status !== "OK" && status !== "COMPLETED") {
      // Antes esto solo se logueaba y el pedido quedaba en "generando" PARA SIEMPRE:
      // el cliente veía "componiendo..." eternamente y nunca recibía nada.
      const detalle =
        body?.error ?? body?.payload_error ?? JSON.stringify(body ?? {}).slice(0, 400);
      console.error("fal.ai reportó error:", detalle);
      await marcarError(pedidoId, `fal.ai variante ${variante}: ${detalle}`);
      return NextResponse.json({ ok: true });
    }

    if (!requestId) {
      return NextResponse.json({ ok: false, error: "Sin request_id" }, { status: 400 });
    }

    waitUntil(finalizarVariante(pedidoId, variante as "A" | "B", requestId, BASE_URL));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error en /api/fal-webhook:", err);
    return NextResponse.json({ ok: true, warning: err.message });
  }
}
