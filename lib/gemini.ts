import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Pedido } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Usamos Flash porque para letras cortas nos alcanza sobrado y sale muchísimo más barato
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

/**
 * Genera la letra de una canción personalizada usando Gemini.
 * Devuelve un objeto con la letra estructurada por secciones.
 */
export async function generarLetra(pedido: Pedido): Promise<string> {
  const prompt = construirPrompt(pedido);

  const result = await model.generateContent(prompt);
  const texto = result.response.text().trim();

  // Sanitizamos: sacamos backticks o marcado que Gemini a veces mete
  return texto.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();
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
