import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Pedido } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Modelos ordenados de preferido a último recurso.
 *
 * Cada modelo vive en un pool de capacidad distinto en Google, así que un
 * "503 high demand" en uno NO implica 503 en el siguiente. Por eso la lista
 * larga: la letra es el primer paso del pipeline y si falla, se pierde la venta.
 *
 * OJO: gemini-2.0-flash fue apagado el 1/6/2026 (devuelve 404, no sirve de
 * fallback). Los alias "-latest" no figuran en la doc actual, no confiar en ellos.
 * Verificá qué modelos ve tu API key con:
 *   curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
 */
const MODELOS_FALLBACK = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const MAX_INTENTOS_POR_MODELO = 2;
// Backoff entre intentos del MISMO modelo: 2s antes del 2do intento.
// (Si agregás un 3er intento, sumá otro valor acá, ej. 6000.)
const ESPERAS_MS = [2000, 6000];

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Decide qué hacer con un error de Gemini:
 *  - "reintentar":     429 (rate limit), 5xx (alta demanda / caída), errores de red.
 *  - "saltar_modelo":  400/403/404 → modelo inexistente, key inválida o prompt
 *                      bloqueado. Insistir con el mismo modelo es tirar segundos.
 */
function clasificarError(error: any): "reintentar" | "saltar_modelo" {
  const mensaje = String(error?.message ?? error ?? "");
  // El SDK expone .status en GoogleGenerativeAIFetchError; si no, lo sacamos
  // del texto: "[503 Service Unavailable] ..."
  const desdeTexto = mensaje.match(/\[(\d{3})\s/)?.[1];
  const codigo = Number(error?.status ?? error?.response?.status ?? desdeTexto ?? 0);

  if (codigo === 0) return "reintentar"; // error de red / timeout, sin código HTTP
  if (codigo === 429 || codigo >= 500) return "reintentar";
  return "saltar_modelo";
}

function construirPrompt(pedido: Pedido): string {
  return `Eres un letrista profesional experto en canciones personalizadas emotivas.

Crea una letra de canción original a partir de este pedido:

OCASIÓN: ${pedido.ocasion}
DE PARTE DE: ${pedido.tu_nombre}
PARA: ${pedido.destinatario}
RELACIÓN ENTRE ELLOS: ${pedido.relacion}
HISTORIA / RECUERDOS / DETALLES A INCORPORAR:
${pedido.historia}

ESTILO MUSICAL: ${pedido.estilo}
CLIMA EMOCIONAL: ${pedido.clima}
TIPO DE VOZ: ${pedido.voz}

INSTRUCCIONES DE ESCRITURA:
- Estructura: Verso 1 + Coro + Verso 2 + Coro + Puente + Coro final
- Duración estimada al cantarla: entre 2 y 3 minutos
- Tono emotivo, personal y auténtico, adecuado al clima "${pedido.clima}"
- Incorpora de forma natural nombres, momentos y detalles específicos de la historia
- Prioriza que el mensaje se entienda y emocione, por encima de la métrica perfecta
- Rima cuando fluya, pero no fuerces palabras que sacrifiquen la emoción
- Escríbela en español neutro salvo que el estilo "${pedido.estilo}" pida un dialecto específico
- El destinatario (${pedido.destinatario}) debe sentir que la canción es sobre él/ella específicamente

FORMATO DE SALIDA:
Devuelve SOLAMENTE la letra, con las secciones marcadas así:
[Verso 1]
...
[Coro]
...
[Verso 2]
...
[Coro]
...
[Puente]
...
[Coro final]
...

NO incluyas título, explicaciones, comentarios, acordes, ni notas sobre la interpretación. Solo la letra.`;
}

export async function generarLetra(pedido: Pedido): Promise<string> {
  const prompt = construirPrompt(pedido);
  const errores: string[] = [];

  for (const nombreModelo of MODELOS_FALLBACK) {
    for (let intento = 1; intento <= MAX_INTENTOS_POR_MODELO; intento++) {
      try {
        console.log(
          `[Gemini] Probando modelo ${nombreModelo} (intento ${intento}/${MAX_INTENTOS_POR_MODELO})`
        );

        const model = genAI.getGenerativeModel({ model: nombreModelo });
        const result = await model.generateContent(prompt);
        const texto = result.response.text();

        if (texto && texto.trim().length > 0) {
          console.log(`[Gemini] ✅ Éxito con modelo ${nombreModelo}`);
          return texto;
        }

        throw new Error("Respuesta vacía de Gemini");
      } catch (error: any) {
        const mensaje = `${nombreModelo} intento ${intento}: ${error?.message ?? error}`;
        errores.push(mensaje);
        console.error(`[Gemini] ❌ ${mensaje}`);

        const accion = clasificarError(error);

        if (accion === "saltar_modelo") {
          console.log(`[Gemini] ⏭ ${nombreModelo} no es recuperable, paso al siguiente modelo`);
          break; // sale del for de intentos, sigue con el próximo modelo
        }

        if (intento < MAX_INTENTOS_POR_MODELO) {
          const espera = ESPERAS_MS[intento - 1] ?? ESPERAS_MS[ESPERAS_MS.length - 1];
          console.log(`[Gemini] Esperando ${espera}ms antes de reintentar...`);
          await esperar(espera);
        }
      }
    }
  }

  throw new Error(
    `Todos los modelos de Gemini fallaron. Errores:\n${errores.join("\n")}`
  );
}
