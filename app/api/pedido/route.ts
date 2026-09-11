import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase";
import { ejecutarPipeline } from "@/lib/pipeline";
import type { NuevoPedido } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NuevoPedido;

    const errores = validarPayload(body);
    if (errores.length > 0) {
      return NextResponse.json(
        { ok: false, error: errores.join(". ") },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("pedidos")
      .insert({
        ocasion: body.ocasion,
        tu_nombre: body.tuNombre,
        destinatario: body.destinatario,
        relacion: body.relacion,
        historia: body.historia,
        estilo: body.estilo,
        clima: body.clima,
        voz: body.voz,
        email: body.email,
        whatsapp: body.whatsapp || null,
        status: "generando",
        plan: "estandar",
        monto: 9.9,
      })
      .select("id, token")
      .single();

    if (error || !data) {
      console.error("Error insertando pedido:", error);
      return NextResponse.json(
        { ok: false, error: "No pudimos crear el pedido. Probá de nuevo en un rato." },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl(req);
    waitUntil(ejecutarPipeline(data.id, baseUrl));

    return NextResponse.json({
      ok: true,
      token: data.token,
      id: data.id,
    });
  } catch (err: any) {
    console.error("Error en /api/pedido:", err);
    return NextResponse.json(
      { ok: false, error: "Error interno. Probá de nuevo." },
      { status: 500 }
    );
  }
}

function validarPayload(b: any): string[] {
  const e: string[] = [];
  if (!b.ocasion) e.push("Falta ocasión");
  if (!b.tuNombre || b.tuNombre.length < 2) e.push("Falta tu nombre");
  if (!b.destinatario || b.destinatario.length < 2) e.push("Falta nombre del destinatario");
  if (!b.relacion) e.push("Falta relación");
  if (!b.historia || b.historia.length < 20) e.push("Historia muy corta");
  if (!b.estilo) e.push("Falta estilo");
  if (!b.clima) e.push("Falta clima");
  if (!b.voz) e.push("Falta voz");
  if (!b.email || !/\S+@\S+\.\S+/.test(b.email)) e.push("Email inválido");
  return e;
}

function getBaseUrl(req: NextRequest): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
