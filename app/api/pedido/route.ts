import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase";
import { arrancarPipeline } from "@/lib/pipeline";
import { BASE_URL } from "@/lib/config";
import type { NuevoPedido } from "@/types";

export const runtime = "nodejs";
// Cuando Google está saturado, cada rechazo puede tardar decenas de segundos.
// La cadena de fallbacks de Gemini se limita sola a 150s, pero este tope tiene
// que ser holgado: si Vercel mata la función antes, el pedido queda en
// "generando" para siempre sin llegar a anotar el error. 300 es el máximo del
// plan Hobby.
export const maxDuration = 300;

// Cada pedido cuesta ~US$0,16 en fal.ai. Sin este freno, cualquiera puede
// dejarte sin saldo en una tarde apretando "enviar".
const MAX_PEDIDOS_POR_EMAIL_POR_HORA = 3;

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

    const email = body.email.trim().toLowerCase();

    // Anti-abuso básico por email (no frena a alguien con mails infinitos,
    // pero sí al 95% de los curiosos y al botón apretado 10 veces).
    const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", haceUnaHora);

    if ((count ?? 0) >= MAX_PEDIDOS_POR_EMAIL_POR_HORA) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Ya tenés varias canciones en proceso con este email. Esperá un rato y probá de nuevo.",
        },
        { status: 429 }
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
        email,
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

    // Arrancamos el pipeline en background con la URL pública estable
    waitUntil(arrancarPipeline(data.id, BASE_URL));

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
  if (b.historia && b.historia.length > 3000) e.push("Historia demasiado larga (máx. 3000 caracteres)");
  if (!b.estilo) e.push("Falta estilo");
  if (!b.clima) e.push("Falta clima");
  if (!b.voz) e.push("Falta voz");
  if (!b.email || !/\S+@\S+\.\S+/.test(b.email)) e.push("Email inválido");
  return e;
}
