import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { crearLinkPago } from "@/lib/mercadopago";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Falta token" },
        { status: 400 }
      );
    }

    // Buscamos el pedido para validar que existe y está en estado 'listo'
    const { data: pedido, error } = await supabaseAdmin
      .from("pedidos")
      .select("id, token, destinatario, monto, status")
      .eq("token", token)
      .single();

    if (error || !pedido) {
      return NextResponse.json(
        { ok: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    if (pedido.status !== "listo") {
      return NextResponse.json(
        {
          ok: false,
          error: `El pedido está en estado ${pedido.status}, no se puede pagar aún`,
        },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(req);
    const initPoint = await crearLinkPago({
      token: pedido.token,
      destinatario: pedido.destinatario,
      monto: pedido.monto ?? 9.9,
      baseUrl,
    });

    return NextResponse.json({ ok: true, url: initPoint });
  } catch (err: any) {
    console.error("Error en /api/crear-pago:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Error interno" },
      { status: 500 }
    );
  }
}

function getBaseUrl(req: NextRequest): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
