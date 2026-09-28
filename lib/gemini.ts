import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Modelos ordenados de más nuevo a más viejo/estable
// "latest" son alias que Google mantiene actualizados
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

export async function generarLetra(prompt: string): Promise<string> {
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
