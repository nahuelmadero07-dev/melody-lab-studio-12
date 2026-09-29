import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Pedido } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Modelos ordenados de preferido a último recurso. UN intento por modelo:
 * cuando Google está saturado, insistir con el mismo modelo solo quema tiempo;
 * cambiar de modelo cambia de pool de capacidad, que es lo que sirve.
 *
 * OJO: gemini-2.0-flash fue apagado el 1/6/2026 (devuelve 404, no sirve de
 * fallback). Los alias "-latest" apuntan al mismo modelo saturado, tampoco.
 * Verificá qué modelos ve tu API key con:
 *   curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
 */
const MODELOS_FALLBACK = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite", // más liviano = menos demanda = menos 503
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
];

// Tiempo máximo que esperamos a que UN modelo responda. Sin esto, cuando Google
// está saturado la conexión puede quedar colgada minutos y Vercel mata la
// función sin darnos chance de anotar el error (el pedido queda en "generando"
// para siempre). 20s es de sobra para una letra.
const TIMEOUT_POR_LLAMADA_MS = 20_000;

// Tiempo máximo TOTAL de toda la cadena. Tiene que quedar bien por debajo del
// maxDuration de la ruta que nos llama (/api/pedido = 300s).
const PRESUPUESTO_TOTAL_MS = 150_000;

const PAUSA_ENTRE_MODELOS_MS = 1_500;

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const inicio = Date.now();

  for (const nombreModelo of MODELOS_FALLBACK) {
    const transcurrido = Date.now() - inicio;
    if (transcurrido > PRESUPUESTO_TOTAL_MS) {
      errores.push(`Se agotó el presupuesto de tiempo (${Math.round(transcurrido / 1000)}s)`);
      break;
    }

    try {
      console.log(`[Gemini] Probando modelo ${nombreModelo} (${Math.round(transcurrido / 1000)}s transcurridos)`);

      const model = genAI.getGenerativeModel(
        { model: nombreModelo },
        { timeout: TIMEOUT_POR_LLAMADA_MS }
      );
      const result = await model.generateContent(prompt);
      const texto = result.response.text();

      if (texto && texto.trim().length > 0) {
        console.log(`[Gemini] ✅ Éxito con modelo ${nombreModelo}`);
        return texto;
      }

      throw new Error("Respuesta vacía de Gemini");
    } catch (error: any) {
      const mensaje = `${nombreModelo}: ${error?.message ?? error}`;
      errores.push(mensaje);
      console.error(`[Gemini] ❌ ${mensaje}`);
      await esperar(PAUSA_ENTRE_MODELOS_MS);
    }
  }

  throw new Error(
    `Todos los modelos de Gemini fallaron. Errores:\n${errores.join("\n")}`
  );
}
