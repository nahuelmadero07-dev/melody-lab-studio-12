/**
 * URL pública ESTABLE del sitio. Se usa para armar:
 *  - los links de los emails (/escuchar/{token})
 *  - los webhooks de fal.ai y de Mercado Pago
 *  - las back_urls de Mercado Pago
 *
 * NUNCA usar process.env.VERCEL_URL para esto: apunta al deploy específico
 * (URL larga, efímera y que puede estar detrás de Deployment Protection, con lo
 * cual Mercado Pago o fal.ai reciben un 401 y el pedido queda colgado).
 *
 * Cuando tengas dominio propio, cargá NEXT_PUBLIC_BASE_URL en Vercel
 * (ej: https://melodylabstudio.com) y listo — no hace falta tocar código.
 */
export const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://melody-lab-studio-k1wf.vercel.app"
).replace(/\/+$/, "");

/**
 * Precio de la canción completa, en pesos argentinos (ARS).
 * Es el ÚNICO lugar donde se define: se usa para cobrar en Mercado Pago,
 * para guardar el monto del pedido y para mostrarlo en la web y en los mails.
 */
export const PRECIO_ARS = 7990;

/** Formatea un monto como "$7.990" (formato argentino, sin decimales). */
export function formatearPrecio(monto: number): string {
  const entero = Math.round(monto).toString();
  return `$${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/** Precio listo para mostrar: "$7.990" */
export const PRECIO_LABEL = formatearPrecio(PRECIO_ARS);
