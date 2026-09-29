import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { finalizarVariante, marcarError, reencolarSinLetra } from "@/lib/pipeline";
import { BASE_URL } from "@/lib/config";

export const runtime = "nodejs";
// Descargar un MP3 de ~2,5 min de fal y subirlo a B2 puede llevar 10-20s.
export const maxDuration = 60;

/**
 * Este endpoint recibe el aviso de fal.ai cuando UNA canción terminó de generarse.
 * URL: /api/fal-webhook/{pedidoId}/{variante}
 *
 *   variante = "A" | "B"   → intento normal (letra exacta de Gemini)
 *   variante = "A2" | "B2" → plan B (Lyria escribe la letra sobre la historia)
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

    if (!pedidoId || !/^[AB]2?$/.test(variante)) {
      console.error("Webhook con params inválidos:", params);
      return NextResponse.json({ ok: false, error: "Params inválidos" }, { status: 400 });
    }

    const letra = variante[0] as "A" | "B";
    const esPlanB = variante.endsWith("2");

    const body = await req.json();
    const requestId = body?.request_id;
    const status = body?.status;

    console.log(`Webhook fal.ai — pedido ${pedidoId} variante ${variante} status ${status}`);

    if (status !== "OK" && status !== "COMPLETED") {
      // Guardamos el cuerpo COMPLETO del error (recortado), no solo el resumen:
      // un "422" pelado no dice si fue texto largo o filtro de contenido.
      const resumen = String(body?.error ?? body?.payload_error ?? "sin detalle");
      const detalle = JSON.stringify(body ?? {}).slice(0, 700);
      console.error("fal.ai reportó error:", detalle);

      if (!esPlanB) {
        // Primer rechazo: intentamos una vez más sin la letra exacta.
        waitUntil(reencolarSinLetra(pedidoId, letra, BASE_URL, resumen));
      } else {
        await marcarError(pedidoId, `fal.ai variante ${letra} (plan B): ${resumen} | ${detalle}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (!requestId) {
      return NextResponse.json({ ok: false, error: "Sin request_id" }, { status: 400 });
    }

    waitUntil(finalizarVariante(pedidoId, letra, requestId, BASE_URL));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error en /api/fal-webhook:", err);
    return NextResponse.json({ ok: true, warning: err.message });
  }
}
