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
 */
export async function arrancarPipeline(pedidoId: string, baseUrl: string) {
  try {
    const pedido = await getPedido(pedidoId);

    // 1. Letra (Gemini responde en 2-5 segundos; con fallbacks puede llegar a ~30s)
    const letra = await generarLetra(pedido);
    pedido.letra = letra;
    await supabaseAdmin.from("pedidos").update({ letra }).eq("id", pedidoId);

    // 2. Encolamos las 2 canciones — URLs de webhook con datos en el path (no query)
    const webhookA = `${baseUrl}/api/fal-webhook/${pedidoId}/A`;
    const webhookB = `${baseUrl}/api/fal-webhook/${pedidoId}/B`;

    const [colaA, colaB] = await Promise.all([
      encolarCancion(pedido, "A", webhookA),
      encolarCancion(pedido, "B", webhookB),
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
    await marcarError(pedidoId, mensaje);
  }
}

/**
 * PASO 2 DEL PIPELINE: procesa el resultado de UNA variante cuando fal.ai avisa.
 *
 * Las dos variantes (A y B) pueden terminar al mismo tiempo, así que este código
 * corre dos veces en paralelo. Todo lo que pasa después de guardar la URL tiene
 * que ser idempotente: solo UNA de las dos ejecuciones marca "listo" y manda el mail.
 */
export async function finalizarVariante(
  pedidoId: string,
  variante: "A" | "B",
  requestId: string,
  baseUrl: string
) {
  try {
    const audioUrl = await obtenerResultado(requestId);

    const buf = await descargarAudio(audioUrl);
    const pedido = await getPedido(pedidoId);
    const key = `canciones/${pedido.token}/version-${variante.toLowerCase()}.mp3`;
    await subirAudio(key, buf);

    const campo = variante === "A" ? "url_a" : "url_b";
    const campoSnippet = variante === "A" ? "snippet_a" : "snippet_b";

    await supabaseAdmin
      .from("pedidos")
      .update({
        [campo]: key,
        [campoSnippet]: key,
      })
      .eq("id", pedidoId);

    // Transición ATÓMICA generando → listo.
    // El UPDATE solo afecta la fila si sigue en "generando" y ya tiene las dos URLs.
    // Si A y B llegan a la vez, la base garantiza que una sola de las dos ve
    // `listos.length === 1`; la otra ve 0 y no manda mail duplicado.
    const { data: listos, error: errListo } = await supabaseAdmin
      .from("pedidos")
      .update({
        status: "listo",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", pedidoId)
      .eq("status", "generando")
      .not("url_a", "is", null)
      .not("url_b", "is", null)
      .select("id, email, destinatario, token");

    if (errListo) {
      throw new Error(`Supabase al marcar listo: ${errListo.message}`);
    }

    if (!listos || listos.length === 0) {
      // Falta la otra variante todavía, o la otra ejecución ya marcó "listo".
      console.log(`[pipeline] ${pedidoId} variante ${variante} guardada; esperando la otra`);
      return;
    }

    const listo = listos[0];
    await notificarCancionLista(
      pedidoId,
      listo.email,
      listo.destinatario,
      `${baseUrl}/escuchar/${listo.token}`
    );
  } catch (err: any) {
    const mensaje = err?.message ?? "Error desconocido en finalización";
    console.error(`finalizarVariante ${variante} falló para ${pedidoId}:`, err);
    await marcarError(pedidoId, `Variante ${variante}: ${mensaje}`);
  }
}

/**
 * Manda el mail de "tu canción está lista".
 *
 * IMPORTANTE: acá la canción YA está generada, subida y el pedido YA está en
 * "listo". Si Resend falla (por ejemplo, porque todavía usás onboarding@resend.dev
 * que solo entrega a tu propio mail), el pedido NO se va a "error": el cliente
 * igual puede escucharla entrando a /escuchar/{token}. Solo dejamos registro.
 */
async function notificarCancionLista(
  pedidoId: string,
  email: string,
  destinatario: string,
  urlEscuchar: string
) {
  try {
    const { subject, html } = emailCancionLista({
      destinatarioLabel: destinatario,
      urlEscuchar,
    });
    await enviarEmail(email, subject, html);
    console.log(`[pipeline] ✉️ Mail enviado a ${email} para ${pedidoId}`);
  } catch (err: any) {
    const mensaje = err?.message ?? "Error desconocido enviando mail";
    console.error(`[pipeline] ✉️ Falló el mail de ${pedidoId} (la canción está lista igual):`, err);
    await supabaseAdmin
      .from("pedidos")
      .update({ error_message: `EMAIL: ${mensaje}`.slice(0, 1000) })
      .eq("id", pedidoId);
  }
}

/**
 * Marca un pedido como "error", pero SOLO si todavía está en "generando".
 * Nunca pisa un pedido "listo" o "pagado": si ya hay canción, hay canción.
 */
export async function marcarError(pedidoId: string, mensaje: string) {
  const { error } = await supabaseAdmin
    .from("pedidos")
    .update({
      status: "error",
      error_message: mensaje.slice(0, 1000),
    })
    .eq("id", pedidoId)
    .eq("status", "generando");

  if (error) {
    console.error(`[pipeline] No se pudo marcar error en ${pedidoId}:`, error);
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

export async function firmarUrlsPedido(pedido: Pedido) {
  const [urlA, urlB] = await Promise.all([
    pedido.url_a ? firmarUrl(pedido.url_a, 24) : null,
    pedido.url_b ? firmarUrl(pedido.url_b, 24) : null,
  ]);
  return { urlA, urlB };
}
