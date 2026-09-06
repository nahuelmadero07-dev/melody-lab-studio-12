import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import crypto from "crypto";

// Modo prod/test según variable de entorno (para poder probar el flujo sin cobrar)
const USAR_PROD = process.env.MP_USAR_PROD === "true";

const accessToken = USAR_PROD
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!;

const client = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 5000 },
});

/**
 * Crea una preferencia de pago (link de checkout) para un pedido.
 * Devuelve la URL a la que hay que redirigir al usuario.
 */
export async function crearLinkPago(args: {
  token: string; // token único del pedido (external_reference)
  destinatario: string;
  monto: number;
  baseUrl: string; // ej: "https://melody-lab-studio-k1wf.vercel.app"
}): Promise<string> {
  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: [
        {
          id: args.token,
          title: `Canción personalizada para ${args.destinatario}`,
          description: "Melody Lab Studio — canción completa con voz cantada, dos versiones",
          quantity: 1,
          unit_price: args.monto,
          currency_id: "ARS", // Ajustar según país. Argentina: ARS
        },
      ],
      external_reference: args.token,
      back_urls: {
        success: `${args.baseUrl}/escuchar/${args.token}?pago=aprobado`,
        pending: `${args.baseUrl}/escuchar/${args.token}?pago=pendiente`,
        failure: `${args.baseUrl}/escuchar/${args.token}?pago=fallido`,
      },
      auto_return: "approved",
      notification_url: `${args.baseUrl}/api/webhook-mp`,
      statement_descriptor: "MELODYLAB",
    },
  });

  const initPoint = USAR_PROD ? result.init_point : result.sandbox_init_point;
  if (!initPoint) {
    throw new Error("Mercado Pago no devolvió init_point");
  }
  return initPoint;
}

/**
 * Consulta a Mercado Pago los detalles reales de un pago dado su ID.
 * Es lo que hacemos cuando llega un webhook — no confiamos en el body del webhook,
 * consultamos la fuente de verdad.
 */
export async function consultarPago(paymentId: string): Promise<{
  status: string;
  externalReference: string;
  monto: number;
}> {
  const payment = new Payment(client);
  const data = await payment.get({ id: paymentId });

  return {
    status: data.status ?? "unknown",
    externalReference: data.external_reference ?? "",
    monto: data.transaction_amount ?? 0,
  };
}

/**
 * Verifica la firma del webhook para asegurarse que viene de Mercado Pago.
 * MP firma con HMAC-SHA256 usando el "secret" del webhook.
 *
 * Docs oficiales:
 * https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export function verificarFirmaWebhook(args: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string; // El id del pago (viene en la query o el body)
}): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // Si no está configurado (dev), skipeamos

  if (!args.xSignature || !args.xRequestId) return false;

  // MP manda x-signature como "ts=xxx,v1=hash"
  const parts = args.xSignature.split(",");
  const tsPart = parts.find((p) => p.startsWith("ts="))?.split("=")[1];
  const v1Part = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!tsPart || !v1Part) return false;

  // Template a firmar según MP: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
  const template = `id:${args.dataId};request-id:${args.xRequestId};ts:${tsPart};`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(template);
  const hashCalculado = hmac.digest("hex");

  return hashCalculado === v1Part;
}
