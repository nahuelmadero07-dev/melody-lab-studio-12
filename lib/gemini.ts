import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Pedido } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Modelos ordenados de más rápido/nuevo a más estable/lento
// Los alias "latest" los mantiene Google apuntando a la versión más nueva
const MODELOS_FALLBACK = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-pro-latest",
];

const MAX_INTENTOS_POR_MODELO = 2;
const ESPERA_ENTRE_INTENTOS_MS = 3000;

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

  for (const nombreModelo of MODELOS_FALLBACK) {
    for (let intento = 1; intento <= MAX_INTENTOS_POR_MODELO; intento++) {
      try {
        console.log(
          `[Gemini] Probando modelo ${nombreModelo} (intento ${intento}/${MAX_INTENTOS_POR_MODELO})`
        );

        const model = genAI.getGenerativeModel({ model: nombreModelo });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const texto = response.text();

        if (texto && texto.trim().length > 0) {
          console.log(`[Gemini] ✅ Éxito con modelo ${nombreModelo}`);
          return texto;
        }

        throw new Error("Respuesta vacía de Gemini");
      } catch (error: any) {
        const mensaje = `${nombreModelo} intento ${intento}: ${error.message || error}`;
        errores.push(mensaje);
        console.error(`[Gemini] ❌ ${mensaje}`);

        if (intento < MAX_INTENTOS_POR_MODELO) {
          console.log(
            `[Gemini] Esperando ${ESPERA_ENTRE_INTENTOS_MS}ms antes de reintentar...`
          );
          await esperar(ESPERA_ENTRE_INTENTOS_MS);
        }
      }
    }
  }

  throw new Error(
    `Todos los modelos de Gemini fallaron. Errores:\n${errores.join("\n")}`
  );
}
