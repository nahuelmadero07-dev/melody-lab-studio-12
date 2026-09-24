import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { finalizarVariante } from "@/lib/pipeline";

export const runtime = "nodejs";

/**
 * Este endpoint recibe el aviso de fal.ai cuando UNA canción terminó de generarse.
 * fal.ai le pega acá con el request_id y el status. Nosotros respondemos rápido (200 OK)
 * y en background descargamos el audio, lo subimos a B2 y actualizamos el pedido.
 *
 * URL: /api/fal-webhook?pedidoId=xxx&variante=A
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pedidoId = url.searchParams.get("pedidoId");
    const variante = url.searchParams.get("variante") as "A" | "B" | null;

    if (!pedidoId || !variante) {
      console.error("Webhook sin pedidoId o variante:", url.toString());
      return NextResponse.json({ ok: false, error: "Params faltantes" }, { status: 400 });
    }

    const body = await req.json();
    const requestId = body?.request_id;
    const status = body?.status;

    console.log(`Webhook fal.ai — pedido ${pedidoId} variante ${variante} status ${status}`);

    if (status !== "OK" && status !== "COMPLETED") {
      // fal.ai reportó un error en la generación
      console.error("fal.ai reportó error:", JSON.stringify(body).slice(0, 500));
      // Aún así respondemos 200 para que fal no reintente
      return NextResponse.json({ ok: true });
    }

    if (!requestId) {
      return NextResponse.json({ ok: false, error: "Sin request_id" }, { status: 400 });
    }

    // Procesamos en background. Respondemos ya para que fal no espere.
    const baseUrl = getBaseUrl(req);
    waitUntil(finalizarVariante(pedidoId, variante, requestId, baseUrl));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error en /api/fal-webhook:", err);
    // Respondemos 200 para que fal no reintente indefinidamente
    return NextResponse.json({ ok: true, warning: err.message });
  }
}

function getBaseUrl(req: NextRequest): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
