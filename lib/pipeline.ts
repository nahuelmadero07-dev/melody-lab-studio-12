import { supabaseAdmin } from "@/lib/supabase";
import { generarLetra } from "@/lib/gemini";
import { encolarCancion, obtenerResultado } from "@/lib/fal";
import { subirAudio, firmarUrl, descargarAudio } from "@/lib/b2";
import { enviarEmail } from "@/lib/resend";
import { emailCancionLista } from "@/lib/emails";
import type { Pedido } from "@/types";

/**
 * PASO 1 DEL PIPELINE: genera la letra con Gemini y encola las 2 canciones en fal.ai.
 * Debe correr RÁPIDO (menos de 10 segundos). No espera a que fal termine.
 * fal.ai llamará al webhook cuando cada canción esté lista.
 */
export async function arrancarPipeline(pedidoId: string, baseUrl: string) {
  try {
    const pedido = await getPedido(pedidoId);

    // 1. Letra (Gemini responde en 2-5 segundos)
    const letra = await generarLetra(pedido);
    pedido.letra = letra;
    await supabaseAdmin.from("pedidos").update({ letra }).eq("id", pedidoId);

    // 2. Encolamos las 2 canciones — devuelven inmediatamente los request_id
    const webhookUrl = `${baseUrl}/api/fal-webhook?pedidoId=${pedidoId}`;

    const [colaA, colaB] = await Promise.all([
      encolarCancion(pedido, "A", `${webhookUrl}&variante=A`),
      encolarCancion(pedido, "B", `${webhookUrl}&variante=B`),
    ]);

    // 3. Guardamos los request_id para trackear
    await supabaseAdmin
      .from("pedidos")
      .update({
        fal_request_id_a: colaA.requestId,
        fal_request_id_b: colaB.requestId,
      })
      .eq("id", pedidoId);
  } catch (err: any) {
    const mensaje = err?.message ?? "Error desconocido al arrancar";
    console.error(`arrancarPipeline falló para ${pedidoId}:`, err);

    await supabaseAdmin
      .from("pedidos")
      .update({
        status: "error",
        error_message: mensaje.slice(0, 1000),
      })
      .eq("id", pedidoId);
  }
}

/**
 * PASO 2 DEL PIPELINE: procesa el resultado de UNA variante cuando fal.ai avisa.
 * Descarga el audio de fal, lo sube a B2, y si YA están las 2 versiones,
 * marca el pedido como listo y manda el email.
 */
export async function finalizarVariante(
  pedidoId: string,
  variante: "A" | "B",
  requestId: string,
  baseUrl: string
) {
  try {
    // Traemos el audio ya generado
    const audioUrl = await obtenerResultado(requestId);

    // Descargamos de fal y subimos a B2
    const buf = await descargarAudio(audioUrl);
    const pedido = await getPedido(pedidoId);
    const key = `canciones/${pedido.token}/version-${variante.toLowerCase()}.mp3`;
    await subirAudio(key, buf);

    // Actualizamos la columna correspondiente
    const campo = variante === "A" ? "url_a" : "url_b";
    const campoSnippet = variante === "A" ? "snippet_a" : "snippet_b";

    await supabaseAdmin
      .from("pedidos")
      .update({
        [campo]: key,
        [campoSnippet]: key,
      })
      .eq("id", pedidoId);

    // ¿Ya están las 2 versiones? Si sí, marcamos listo y mandamos email
    const pedidoActualizado = await getPedido(pedidoId);
    if (pedidoActualizado.url_a && pedidoActualizado.url_b) {
      await supabaseAdmin
        .from("pedidos")
        .update({
          status: "listo",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", pedidoId);

      const urlEscuchar = `${baseUrl}/escuchar/${pedidoActualizado.token}`;
      const { subject, html } = emailCancionLista({
        destinatarioLabel: pedidoActualizado.destinatario,
        urlEscuchar,
      });
      await enviarEmail(pedidoActualizado.email, subject, html);
    }
  } catch (err: any) {
    const mensaje = err?.message ?? "Error desconocido en finalización";
    console.error(`finalizarVariante ${variante} falló para ${pedidoId}:`, err);

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
