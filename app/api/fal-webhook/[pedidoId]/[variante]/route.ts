import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { finalizarVariante } from "@/lib/pipeline";

export const runtime = "nodejs";

const BASE_URL_PRODUCCION = "https://melody-lab-studio-k1wf.vercel.app";

/**
 * Este endpoint recibe el aviso de fal.ai cuando UNA canción terminó de generarse.
 * URL: /api/fal-webhook/{pedidoId}/{variante}
 *
 * Los datos vienen por el path (no por query params) porque fal.ai
 * rechaza URLs con query params.
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
      console.error("fal.ai reportó error:", JSON.stringify(body).slice(0, 500));
      return NextResponse.json({ ok: true });
    }

    if (!requestId) {
      return NextResponse.json({ ok: false, error: "Sin request_id" }, { status: 400 });
    }

    waitUntil(finalizarVariante(pedidoId, variante as "A" | "B", requestId, BASE_URL_PRODUCCION));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error en /api/fal-webhook:", err);
    return NextResponse.json({ ok: true, warning: err.message });
  }
}
