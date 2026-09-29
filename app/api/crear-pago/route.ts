import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { crearLinkPago } from "@/lib/mercadopago";
import { BASE_URL } from "@/lib/config";

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

    // BASE_URL fija: las back_urls y la notification_url de Mercado Pago tienen
    // que apuntar al dominio público, no al deploy efímero de VERCEL_URL.
    const initPoint = await crearLinkPago({
      token: pedido.token,
      destinatario: pedido.destinatario,
      monto: pedido.monto ?? 9.9,
      baseUrl: BASE_URL,
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

