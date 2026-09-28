import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Pedido } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Modelos ordenados de más nuevo/rápido a más viejo/estable
// "latest" son alias que Google mantiene actualizados automáticamente
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

Crea una letra de canción original para:

DESTINATARIO: ${pedido.nombre_destinatario || "un ser querido"}
QUIEN LA DEDICA: ${pedido.nombre_dedicante || "alguien especial"}
OCASIÓN: ${pedido.ocasion || "una ocasión especial"}
RELACIÓN: ${pedido.relacion || "no especificada"}
ESTILO MUSICAL: ${pedido.estilo_musical || "balada emotiva"}
MENSAJE PRINCIPAL: ${pedido.mensaje_principal || "expresar cariño y aprecio"}
RECUERDOS O DETALLES ESPECIALES: ${pedido.detalles_especiales || "no especificados"}

INSTRUCCIONES:
- Estructura: 2 versos + coro + 1 verso + coro final
- Duración estimada: 2-3 minutos cantados
- Tono emotivo, personal y auténtico
- Incorpora los detalles específicos de forma natural
- Rima cuando sea posible pero prioriza el mensaje sobre la métrica
- En español neutro salvo que el estilo pida otra cosa

Devuelve SOLO la letra, sin títulos ni explicaciones ni acordes.`;
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
