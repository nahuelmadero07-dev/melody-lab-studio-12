import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { consultarPago, verificarFirmaWebhook } from "@/lib/mercadopago";
import { enviarEmail } from "@/lib/resend";
import { emailPagoConfirmado } from "@/lib/emails";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // MP puede mandar el id de pago por query o por body — cubrimos ambos casos
    const url = new URL(req.url);
    const dataIdQuery = url.searchParams.get("data.id") ?? url.searchParams.get("id");

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // A veces MP manda GET o body vacío para ping — respondemos 200
    }

    const dataId = dataIdQuery ?? body?.data?.id ?? body?.id;
    const tipo = url.searchParams.get("type") ?? body?.type ?? body?.topic;

    // Solo procesamos notificaciones de tipo 'payment'
    if (tipo !== "payment" || !dataId) {
      return NextResponse.json({ ok: true, note: "Notificación ignorada" });
    }

    // Verificamos la firma (evita que alguien externo dispare este endpoint fingiendo ser MP)
    const firmaOk = verificarFirmaWebhook({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId: String(dataId),
    });

    if (!firmaOk) {
      console.warn("Webhook con firma inválida:", { dataId });
      return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
    }

    // Consultamos a MP los detalles reales del pago
    const pago = await consultarPago(String(dataId));

    // Solo procesamos pagos aprobados
    if (pago.status !== "approved") {
      return NextResponse.json({ ok: true, note: `Pago en estado ${pago.status}` });
    }

    // El external_reference es nuestro token
    const token = pago.externalReference;
    if (!token) {
      return NextResponse.json({ ok: true, note: "Sin external_reference" });
    }

    // Buscamos y actualizamos el pedido
    const { data: pedido, error: errBusqueda } = await supabaseAdmin
      .from("pedidos")
      .select("id, email, destinatario, status, payment_id")
      .eq("token", token)
      .single();

    if (errBusqueda || !pedido) {
      console.error("Pedido no encontrado para webhook:", token);
      return NextResponse.json({ ok: true, note: "Pedido no encontrado" });
    }

    // Idempotencia: si ya está pagado y con este mismo payment_id, no hacemos nada
    if (pedido.status === "pagado" && pedido.payment_id === String(dataId)) {
      return NextResponse.json({ ok: true, note: "Ya procesado" });
    }

    await supabaseAdmin
      .from("pedidos")
      .update({
        status: "pagado",
        payment_id: String(dataId),
        paid_at: new Date().toISOString(),
      })
      .eq("id", pedido.id);

    // Mandamos email de confirmación
    const baseUrl = getBaseUrl(req);
    const urlEscuchar = `${baseUrl}/escuchar/${token}`;
    const { subject, html } = emailPagoConfirmado({
      destinatarioLabel: pedido.destinatario,
      urlEscuchar,
    });
    await enviarEmail(pedido.email, subject, html);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error en /api/webhook-mp:", err);
    // MP requiere que respondamos 200 aunque haya error, si no reintenta hasta el infinito
    // Solo devolvemos 500 si es un error de firma (arriba)
    return NextResponse.json({ ok: false, error: err.message }, { status: 200 });
  }
}

// MP puede hacer GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "webhook-mp" });
}

function getBaseUrl(req: NextRequest): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
