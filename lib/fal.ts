import { fal } from "@fal-ai/client";
import type { Pedido } from "@/types";

fal.config({
  credentials: process.env.FAL_KEY!,
});

const LYRIA_ENDPOINT = "fal-ai/lyria3/pro";

export type CancionEnCola = {
  requestId: string;
};

/**
 * Encola una canción en fal.ai y devuelve el request_id inmediatamente.
 * NO espera a que termine. fal.ai llamará al webhook cuando esté listo.
 */
export async function encolarCancion(
  pedido: Pedido,
  variante: "A" | "B",
  webhookUrl: string
): Promise<CancionEnCola> {
  const prompt = construirPromptMusical(pedido, variante);
  const letra = pedido.letra ?? "";

  const { request_id } = await fal.queue.submit(LYRIA_ENDPOINT, {
    input: {
      prompt,
      lyrics: letra,
      duration_seconds: 150,
      seed: variante === "A" ? 42 : 137,
    },
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
      ? "male vocal"
      : "female vocal";

  const estiloIngles = traducirEstilo(pedido.estilo);
  const climaIngles = traducirClima(pedido.clima);

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
