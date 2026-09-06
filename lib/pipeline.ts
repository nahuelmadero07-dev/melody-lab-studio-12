import { supabaseAdmin } from "@/lib/supabase";
import { generarLetra } from "@/lib/gemini";
import { generarCancion } from "@/lib/fal";
import { subirAudio, firmarUrl, descargarAudio } from "@/lib/b2";
import { enviarEmail } from "@/lib/resend";
import { emailCancionLista } from "@/lib/emails";
import type { Pedido } from "@/types";

/**
 * Ejecuta el pipeline completo para un pedido:
 *   1. Genera la letra con Gemini
 *   2. Genera 2 canciones en paralelo con Lyria vía fal.ai
 *   3. Descarga los audios y los sube a Backblaze B2
 *   4. Actualiza el pedido a status='listo' con las URLs
 *   5. Manda email al cliente con link a /escuchar/{token}
 *
 * Si algo falla, marca el pedido como error con mensaje descriptivo.
 */
export async function ejecutarPipeline(pedidoId: string, baseUrl: string) {
  try {
    // Traemos el pedido actualizado
    const pedido = await getPedido(pedidoId);

    // ---------- 1. Letra ----------
    const letra = await generarLetra(pedido);
    pedido.letra = letra; // La guardamos en memoria para pasarla al paso siguiente
    await supabaseAdmin.from("pedidos").update({ letra }).eq("id", pedidoId);

    // ---------- 2. Canciones en paralelo ----------
    const [cancionA, cancionB] = await Promise.all([
      generarCancion(pedido, "A"),
      generarCancion(pedido, "B"),
    ]);

    // ---------- 3. Descargar de fal + subir a B2 ----------
    const [bufA, bufB] = await Promise.all([
      descargarAudio(cancionA.audioUrl),
      descargarAudio(cancionB.audioUrl),
    ]);

    const keyA = `canciones/${pedido.token}/version-a.mp3`;
    const keyB = `canciones/${pedido.token}/version-b.mp3`;

    await Promise.all([
      subirAudio(keyA, bufA),
      subirAudio(keyB, bufB),
    ]);

    // ---------- 4. Update pedido ----------
    // Guardamos las KEYS internas, no las URLs firmadas (esas se generan al vuelo
    // cuando el usuario abre /escuchar, así siempre están frescas).
    await supabaseAdmin
      .from("pedidos")
      .update({
        status: "listo",
        url_a: keyA,
        url_b: keyB,
        snippet_a: keyA, // Por ahora usamos el mismo archivo; el corte a 30s lo hace el frontend
        snippet_b: keyB,
        delivered_at: new Date().toISOString(),
      })
      .eq("id", pedidoId);

    // ---------- 5. Email ----------
    const urlEscuchar = `${baseUrl}/escuchar/${pedido.token}`;
    const { subject, html } = emailCancionLista({
      destinatarioLabel: pedido.destinatario,
      urlEscuchar,
    });
    await enviarEmail(pedido.email, subject, html);
  } catch (err: any) {
    const mensaje = err?.message ?? "Error desconocido";
    console.error(`Pipeline falló para ${pedidoId}:`, err);

    await supabaseAdmin
      .from("pedidos")
      .update({
        status: "error",
        error_message: mensaje.slice(0, 1000),
      })
      .eq("id", pedidoId);
  }
}

async function getPedido(pedidoId: string): Promise<Pedido> {
  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .eq("id", pedidoId)
    .single();

  if (error || !data) {
    throw new Error(`No se encontró pedido ${pedidoId}: ${error?.message}`);
  }
  return data as Pedido;
}

/**
 * Helper que exponemos también fuera: dado un pedido "listo", genera URLs
 * firmadas frescas para las 2 versiones. Las URLs expiran en 24hs.
 */
export async function firmarUrlsPedido(pedido: Pedido) {
  const [urlA, urlB] = await Promise.all([
    pedido.url_a ? firmarUrl(pedido.url_a, 24) : null,
    pedido.url_b ? firmarUrl(pedido.url_b, 24) : null,
  ]);
  return { urlA, urlB };
}
