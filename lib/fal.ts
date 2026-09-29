import { fal } from "@fal-ai/client";
import type { Pedido } from "@/types";

fal.config({
  credentials: process.env.FAL_KEY!,
});

const LYRIA_ENDPOINT = "fal-ai/lyria3/pro";

// La letra va DENTRO del prompt. Un tope evita que un pedido con una historia
// enorme genere un prompt que Lyria rechace.
const MAX_CARACTERES_LETRA = 2500;

export type CancionEnCola = {
  requestId: string;
};

/**
 * Encola una canción en fal.ai y devuelve el request_id inmediatamente.
 * NO espera a que termine. fal.ai llamará al webhook cuando esté listo.
 *
 * IMPORTANTE (verificado contra la doc oficial de fal.ai, sep 2026):
 * el endpoint fal-ai/lyria3/pro acepta SOLO dos campos de entrada:
 *   - prompt (obligatorio)
 *   - image_url (opcional)
 * NO existen los campos "lyrics", "duration_seconds" ni "seed". fal los ignoraba
 * en silencio, así que la letra que escribía Gemini nunca llegaba al modelo y
 * Lyria inventaba una letra genérica. La canción no tenía los nombres ni la
 * historia del cliente. Ahora la letra viaja dentro del prompt.
 */
export async function encolarCancion(
  pedido: Pedido,
  variante: "A" | "B",
  webhookUrl: string
): Promise<CancionEnCola> {
  const prompt = construirPromptMusical(pedido, variante);

  const { request_id } = await fal.queue.submit(LYRIA_ENDPOINT, {
    input: { prompt },
    webhookUrl,
  });

  return { requestId: request_id };
}

/**
 * Trae el resultado FINAL de un request ya completado (lo usa el webhook).
 * fal.ai avisa "ya terminó", nosotros vamos a buscar el resultado.
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

function construirPromptMusical(pedido: Pedido, variante: "A" | "B"): string {
  const voz =
    pedido.voz.toLowerCase().includes("masculina") ||
    (pedido.voz.toLowerCase().includes("las dos") && variante === "A")
      ? "male lead vocal"
      : "female lead vocal";

  const estiloIngles = traducirEstilo(pedido.estilo);
  const climaIngles = traducirClima(pedido.clima);

  const variacion =
    variante === "A"
      ? "Warm acoustic arrangement, intimate feel, sparse instrumentation."
      : "Richer full-band arrangement, cinematic build, layered instrumentation.";

  const letra = prepararLetra(pedido.letra ?? "");

  return [
    `${estiloIngles} song sung in Spanish, ${climaIngles} mood, ${voz}.`,
    variacion,
    `Professional studio production, clear and emotive vocals, around 2 to 3 minutes long.`,
    `A personal gift song for a special occasion (${pedido.ocasion.toLowerCase()}), dedicated to ${pedido.destinatario}.`,
    ``,
    `Sing exactly these lyrics, in Spanish, without changing the words or the names:`,
    ``,
    letra,
  ].join("\n");
}

/**
 * Convierte las marcas de sección en español que escribe Gemini al formato
 * inglés que entienden los modelos de música, y recorta si es muy larga.
 */
function prepararLetra(letra: string): string {
  const convertida = letra
    .replace(/\[Verso\s*(\d+)\]/gi, "[Verse $1]")
    .replace(/\[Coro final\]/gi, "[Final Chorus]")
    .replace(/\[Coro\]/gi, "[Chorus]")
    .replace(/\[Puente\]/gi, "[Bridge]")
    .replace(/\[Outro\]/gi, "[Outro]")
    .trim();

  return convertida.length > MAX_CARACTERES_LETRA
    ? convertida.slice(0, MAX_CARACTERES_LETRA)
    : convertida;
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
    Romántico: "romantic and tender",
    Alegre: "joyful and uplifting",
    Melancólico: "melancholic and nostalgic",
    Festivo: "festive and celebratory",
  };
  return map[clima] ?? "emotive";
}
