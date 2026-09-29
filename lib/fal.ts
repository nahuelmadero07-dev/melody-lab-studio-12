import { fal } from "@fal-ai/client";
import type { Pedido } from "@/types";

fal.config({
  credentials: process.env.FAL_KEY!,
});

const LYRIA_ENDPOINT = "fal-ai/lyria3/pro";

// La letra va DENTRO del prompt. Tope prudente: fal/Lyria devuelven 422 si el
// texto se pasa de largo. Se corta en el último salto de línea antes del tope
// para no dejar un verso a la mitad.
const MAX_CARACTERES_LETRA = 1800;
const MAX_CARACTERES_HISTORIA = 400;

/**
 * "letra": Lyria canta la letra que escribió Gemini (modo normal).
 * "tema":  plan B. Si fal rechaza la letra exacta (422), le describimos la
 *          historia y los nombres y dejamos que Lyria escriba la letra.
 *          Menos fiel, pero el cliente recibe una canción sobre ellos en vez
 *          de un error.
 */
export type ModoPrompt = "letra" | "tema";

export type CancionEnCola = {
  requestId: string;
};

/**
 * Encola una canción en fal.ai y devuelve el request_id inmediatamente.
 * NO espera a que termine. fal.ai llamará al webhook cuando esté listo.
 *
 * Verificado contra la doc oficial de fal.ai (sep 2026): el endpoint
 * fal-ai/lyria3/pro acepta SOLO "prompt" (y opcionalmente "image_url").
 * No existen "lyrics", "duration_seconds" ni "seed": la letra viaja en el prompt,
 * con el formato que recomienda Google ("Lyrics:" + secciones [Verse]/[Chorus]).
 */
export async function encolarCancion(
  pedido: Pedido,
  variante: "A" | "B",
  webhookUrl: string,
  modo: ModoPrompt = "letra"
): Promise<CancionEnCola> {
  const prompt = construirPromptMusical(pedido, variante, modo);

  const { request_id } = await fal.queue.submit(LYRIA_ENDPOINT, {
    input: { prompt },
    webhookUrl,
  });

  return { requestId: request_id };
}

/**
 * Trae el resultado FINAL de un request ya completado (lo usa el webhook).
 */
export async function obtenerResultado(requestId: string): Promise<string> {
  const result: any = await fal.queue.result(LYRIA_ENDPOINT, {
    requestId,
  });

  const audioUrl =
    result?.data?.audio?.url ??
    result?.data?.audio_file?.url ??
    result?.audio?.url ??
    null;

  if (!audioUrl) {
    throw new Error(
      `fal.ai no devolvió audio URL. Respuesta: ${JSON.stringify(result).slice(0, 500)}`
    );
  }

  return audioUrl;
}

function construirPromptMusical(
  pedido: Pedido,
  variante: "A" | "B",
  modo: ModoPrompt
): string {
  const voz =
    pedido.voz.toLowerCase().includes("masculina") ||
    (pedido.voz.toLowerCase().includes("las dos") && variante === "A")
      ? "a warm male lead vocal"
      : "a warm female lead vocal";

  const estiloIngles = traducirEstilo(pedido.estilo);
  const climaIngles = traducirClima(pedido.clima);

  const variacion =
    variante === "A"
      ? "Warm acoustic arrangement, intimate feel, sparse instrumentation."
      : "Richer full-band arrangement, cinematic build, layered instrumentation.";

  const descripcion =
    `${estiloIngles} song with ${voz} singing in Spanish. ${climaIngles} mood. ` +
    `${variacion} Professional studio production, clear and emotive vocals. ` +
    `Full-length song, around 2 to 3 minutes, with verses, chorus and bridge.`;

  if (modo === "tema") {
    const historia = recortar(pedido.historia ?? "", MAX_CARACTERES_HISTORIA);
    return (
      `${descripcion} ` +
      `Song lyrics in Spanish, written as a personal gift from ${pedido.tu_nombre} ` +
      `to ${pedido.destinatario} (${pedido.relacion.toLowerCase()}) for ${pedido.ocasion.toLowerCase()}. ` +
      `The lyrics must mention ${pedido.destinatario} by name and be about this story: ${historia}`
    );
  }

  const letra = prepararLetra(pedido.letra ?? "");
  return `${descripcion}\n\nLyrics:\n${letra}`;
}

/**
 * Convierte las marcas de sección en español que escribe Gemini a las que
 * documenta Google ([Verse 1], [Chorus], [Bridge]) y recorta si es muy larga.
 */
function prepararLetra(letra: string): string {
  const convertida = letra
    .replace(/\[Verso\s*(\d+)\]/gi, "[Verse $1]")
    .replace(/\[Coro final\]/gi, "[Chorus]")
    .replace(/\[Coro\]/gi, "[Chorus]")
    .replace(/\[Puente\]/gi, "[Bridge]")
    .trim();

  return recortar(convertida, MAX_CARACTERES_LETRA);
}

function recortar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  const corte = texto.lastIndexOf("\n", max);
  return texto.slice(0, corte > max * 0.6 ? corte : max).trim();
}

function traducirEstilo(estilo: string): string {
  const map: Record<string, string> = {
    Pop: "Modern pop",
    Balada: "Ballad",
    Rock: "Rock",
    Reggaeton: "Reggaeton",
    Bolero: "Bolero",
    Mariachi: "Mariachi",
  };
  return map[estilo] ?? "Ballad";
}

function traducirClima(clima: string): string {
  const map: Record<string, string> = {
    Romántico: "Romantic and tender",
    Alegre: "Joyful and uplifting",
    Melancólico: "Melancholic and nostalgic",
    Festivo: "Festive and celebratory",
  };
  return map[clima] ?? "Emotive";
}
