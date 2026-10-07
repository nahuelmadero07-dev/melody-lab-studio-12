import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase";
import { arrancarPipeline } from "@/lib/pipeline";
import { BASE_URL, PRECIO_ARS } from "@/lib/config";
import {
  COOKIE_DISPOSITIVO,
  chequearLimites,
  esEmailDescartable,
  normalizarEmail,
  obtenerIp,
} from "@/lib/antiabuso";
import type { NuevoPedido } from "@/types";

export const runtime = "nodejs";
// Cuando Google está saturado, cada rechazo puede tardar decenas de segundos.
// La cadena de fallbacks de Gemini se limita sola a 150s, pero este tope tiene
// que ser holgado: si Vercel mata la función antes, el pedido queda en
// "generando" para siempre sin llegar a anotar el error. 300 es el máximo del
// plan Hobby.
export const maxDuration = 300;

// Los frenos contra muestras gratis ilimitadas están en lib/antiabuso.ts
// (por email, por dispositivo y por IP). Ahí se cambian los límites.

export async function POST(req: NextRequest) {
  // Identificador del navegador: si no tiene cookie, le creamos una.
  const dispositivoExistente = req.cookies.get(COOKIE_DISPOSITIVO)?.value ?? null;
  const dispositivo = dispositivoExistente ?? crypto.randomUUID();

  // Todas las respuestas pasan por acá para dejarle la cookie al navegador.
  const responder = (body: any, status = 200) => {
    const res = NextResponse.json(body, { status });
    if (!dispositivoExistente) {
      res.cookies.set(COOKIE_DISPOSITIVO, dispositivo, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 año
      });
    }
    return res;
  };

  try {
    const body = (await req.json()) as NuevoPedido;

    const errores = validarPayload(body);
    if (errores.length > 0) {
      return responder({ ok: false, error: errores.join(". ") }, 400);
    }

    const email = body.email.trim().toLowerCase();
    const emailNormalizado = normalizarEmail(email);
    const ip = obtenerIp(req.headers);

    if (esEmailDescartable(email)) {
      return responder(
        { ok: false, error: "Usá un email real: ahí te mandamos el link de tu canción." },
        400
      );
    }

    const bloqueo = await chequearLimites({
      email,
      emailNormalizado,
      dispositivo: dispositivoExistente, // si recién se crea la cookie, no tiene historial
      ip,
    });
    if (bloqueo) {
      console.warn(`[antiabuso] Bloqueado: ${emailNormalizado} ip=${ip} disp=${dispositivoExistente}`);
      return responder({ ok: false, error: bloqueo }, 429);
    }

    const fila = {
      ocasion: body.ocasion,
      tu_nombre: body.tuNombre || "",       // Ya no se pide en el nuevo flujo, puede venir vacío
      destinatario: body.destinatario,
      relacion: body.relacion,
      historia: body.historia,
      estilo: body.estilo,
      clima: body.clima,
      voz: body.voz,
      email,
      whatsapp: body.whatsapp || null,       // Ya no se pide en el nuevo flujo
      status: "generando",
      plan: "estandar",
      monto: PRECIO_ARS,
    };

    let { data, error } = await supabaseAdmin
      .from("pedidos")
      .insert({ ...fila, email_normalizado: emailNormalizado, ip, dispositivo })
      .select("id, token")
      .single();

    // Si todavía no se agregaron las columnas nuevas en Supabase, guardamos
    // igual el pedido sin ellas para no perder la venta.
    if (error && /email_normalizado|dispositivo|\bip\b|column/i.test(error.message ?? "")) {
      console.error("[antiabuso] Faltan columnas en Supabase, corré el SQL:", error.message);
      ({ data, error } = await supabaseAdmin
        .from("pedidos")
        .insert(fila)
        .select("id, token")
        .single());
    }

    if (error || !data) {
      console.error("Error insertando pedido:", error);
      return responder(
        { ok: false, error: "No pudimos crear el pedido. Probá de nuevo en un rato." },
        500
      );
    }

    // Arrancamos el pipeline en background con la URL pública estable
    waitUntil(arrancarPipeline(data.id, BASE_URL));

    return responder({
      ok: true,
      token: data.token,
      id: data.id,
    });
  } catch (err: any) {
    console.error("Error en /api/pedido:", err);
    return responder({ ok: false, error: "Error interno. Probá de nuevo." }, 500);
  }
}

function validarPayload(b: any): string[] {
  const e: string[] = [];
  if (!b.ocasion) e.push("Falta ocasión");
  // ⚠ Antes se exigía b.tuNombre. Ahora no se pide en el formulario (fricción muerta).
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
