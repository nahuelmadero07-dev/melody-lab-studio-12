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
