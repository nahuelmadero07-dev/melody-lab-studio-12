import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Pedido } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Lista de modelos en orden de preferencia. Si uno falla o está saturado,
// probamos el siguiente. Podés reordenar según lo que veas que funciona mejor.
const MODELOS_FALLBACK = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
];

/**
 * Genera la letra de una canción personalizada usando Gemini.
 * Prueba varios modelos en cascada si el primero falla (503, 429, timeout).
 */
export async function generarLetra(pedido: Pedido): Promise<string> {
  const prompt = construirPrompt(pedido);
  let ultimoError: any = null;

  for (const nombreModelo of MODELOS_FALLBACK) {
    // Intentamos hasta 2 veces por modelo, con espera exponencial
    for (let intento = 1; intento <= 2; intento++) {
      try {
        console.log(`Gemini: probando ${nombreModelo} (intento ${intento})`);
        const model = genAI.getGenerativeModel({ model: nombreModelo });
        const result = await model.generateContent(prompt);
        const texto = result.response.text().trim();
        console.log(`Gemini: éxito con ${nombreModelo}`);
        return texto.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();
      } catch (err: any) {
        ultimoError = err;
        const msg = err?.message ?? "";
        console.error(`Gemini falló con ${nombreModelo}: ${msg.slice(0, 200)}`);

        // Si es 404 (modelo no existe), no reintentamos, pasamos al siguiente modelo
        if (msg.includes("404") || msg.includes("not found") || msg.includes("no longer available")) {
          break;
        }

        // Si es 503 (saturado) o 429 (rate limit), esperamos antes de reintentar
        if (msg.includes("503") || msg.includes("429") || msg.includes("high demand")) {
          if (intento < 2) {
            const espera = intento * 3000; // 3s el primer reintento
            console.log(`Gemini: esperando ${espera}ms antes de reintentar`);
            await sleep(espera);
            continue;
          }
        }

        // Otro tipo de error → pasamos al siguiente modelo directo
        break;
      }
    }
  }

  // Si llegamos acá, todos los modelos fallaron
  throw new Error(
    `Todos los modelos de Gemini fallaron. Último error: ${ultimoError?.message ?? "desconocido"}`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function construirPrompt(pedido: Pedido): string {
  return `Sos un letrista profesional especializado en canciones emotivas personalizadas.

CONTEXTO DEL PEDIDO:
- Ocasión: ${pedido.ocasion}
- La canción es un regalo de ${pedido.tu_nombre} para ${pedido.destinatario}.
- Relación entre ellos: ${pedido.relacion}
- Historia que quiere plasmar:
"""
${pedido.historia}
"""
- Estilo musical elegido: ${pedido.estilo}
- Clima emocional: ${pedido.clima}
- Voz elegida: ${pedido.voz}

TAREA:
Escribí la letra completa de una canción de aproximadamente 2 minutos y medio.
La letra debe estar en ESPAÑOL rioplatense/neutro.
El nombre "${pedido.destinatario}" DEBE aparecer al menos 2 veces en la canción, y una de esas veces obligatoriamente en el ESTRIBILLO.
Los detalles específicos de la historia deben incorporarse de forma natural, no forzada.

ESTRUCTURA (usá exactamente estas etiquetas de sección):
[Verso 1]
(4-6 líneas)

[Estribillo]
(4 líneas — el gancho emocional principal, con "${pedido.destinatario}" adentro)

[Verso 2]
(4-6 líneas — profundiza en detalles de la historia)

[Estribillo]
(mismo del anterior)

[Puente]
(2-4 líneas — el momento más íntimo o revelador)

[Estribillo final]
(mismo estribillo, opcionalmente con una variación en la última línea)

REGLAS ESTRICTAS:
- NO uses clichés genéricos ("eres mi luz", "en mi corazón siempre estarás", etc.). Buscá metáforas específicas a la historia real.
- Rimas suaves y consonantes al final de líneas alternadas está bien; no fuerces rimas si arruinan el sentido.
- Nada de comentarios tuyos, solo la letra con las etiquetas de sección.

Devolvé SOLO la letra, sin introducción ni cierre.`;
}
