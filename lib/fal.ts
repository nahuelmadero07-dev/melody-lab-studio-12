import { fal } from "@fal-ai/client";
import type { Pedido } from "@/types";

fal.config({
  credentials: process.env.FAL_KEY!,
});

/**
 * IMPORTANTE — VERIFICAR EL ENDPOINT EXACTO DE LYRIA 3 PRO EN FAL.AI
 *
 * Al momento de escribir esto, el endpoint es "fal-ai/lyria-3-pro" según la convención.
 * Si al ejecutar da error tipo "endpoint not found" o "model not available":
 *   1. Andá a https://fal.ai/models y buscá "lyria" en el explorer.
 *   2. Copiá el endpoint exacto que aparece (formato "fal-ai/xxx").
 *   3. Reemplazá el valor de LYRIA_ENDPOINT abajo.
 *
 * Alternativas testeadas en el mercado si Lyria 3 Pro no está disponible:
 *   - "fal-ai/minimax-music/v2"     — $0.15 por canción, buena calidad español
 *   - "fal-ai/elevenlabs/music"     — $0.80/min, más caro, calidad premium
 */
const LYRIA_ENDPOINT = "fal-ai/lyria3/pro";

export type CancionGenerada = {
  audioUrl: string; // URL temporal en fal.ai (hay que descargar y subir a B2)
  duracionSeg: number;
};

/**
 * Genera una canción con voz cantada usando Lyria 3 Pro vía fal.ai.
 * Devuelve la URL temporal del MP3 (hay que descargarla ANTES de que expire).
 *
 * @param pedido        Datos del pedido para construir el prompt.
 * @param variante      "A" o "B" — para generar 2 versiones distintas del mismo pedido.
 */
export async function generarCancion(
  pedido: Pedido,
  variante: "A" | "B"
): Promise<CancionGenerada> {
  const prompt = construirPromptMusical(pedido, variante);
  const letra = pedido.letra ?? "";

  const result: any = await fal.subscribe(LYRIA_ENDPOINT, {
    input: {
      prompt,
      lyrics: letra,
      // La duración depende del modelo — Lyria 3 Pro soporta hasta 180s
      duration_seconds: 150,
      // Para variantes distintas usamos seeds diferentes
      seed: variante === "A" ? 42 : 137,
    },
    logs: false,
  });

  // La respuesta de fal para modelos de música suele tener .audio.url o .audio_file.url
  // Manejamos ambos formatos por robustez.
  const audioUrl =
    result?.data?.audio?.url ??
    result?.data?.audio_file?.url ??
    result?.audio?.url ??
    null;

  if (!audioUrl) {
    throw new Error(
      `fal.ai no devolvió audio URL. Respuesta cruda: ${JSON.stringify(result).slice(0, 500)}`
    );
  }

  return {
    audioUrl,
    duracionSeg: result?.data?.duration ?? 150,
  };
}

function construirPromptMusical(pedido: Pedido, variante: "A" | "B"): string {
  const voz =
    pedido.voz.toLowerCase().includes("masculina") ||
    pedido.voz.toLowerCase().includes("las dos") && variante === "A"
      ? "male vocal"
      : "female vocal";

  const estiloIngles = traducirEstilo(pedido.estilo);
  const climaIngles = traducirClima(pedido.clima);

  // Sutiles variaciones entre A y B para que suenen distintas pero coherentes
  const variacion =
    variante === "A"
      ? "warm acoustic arrangement, intimate feel"
      : "richer full-band arrangement, cinematic";

  return `${estiloIngles} song in Spanish, ${climaIngles} mood, ${voz}. ${variacion}. Professional studio production, clear vocals, emotive delivery. Personal gift song for a special occasion (${pedido.ocasion.toLowerCase()}).`;
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
