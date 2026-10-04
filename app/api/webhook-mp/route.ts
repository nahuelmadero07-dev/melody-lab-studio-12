import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { consultarPago, verificarFirmaWebhook } from "@/lib/mercadopago";
import { enviarEmail } from "@/lib/resend";
import { emailPagoConfirmado } from "@/lib/emails";
import { BASE_URL } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 30;

async function enviarPurchaseMeta(args: {
  paymentId: string;
  monto: number;
  email?: string | null;
}) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = "1423641575865360";

  if (!accessToken) {
    console.warn("Falta META_CAPI_ACCESS_TOKEN");
    return;
  }

  const crypto = await import("crypto");

  const emailHash = args.email
    ? crypto
        .createHash("sha256")
        .update(args.email.trim().toLowerCase())
        .digest("hex")
    : undefined;

  const event = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `mp_${args.paymentId}`,
        action_source: "website",
        event_source_url: `${BASE_URL}/`,
        user_data: {
          ...(emailHash ? { em: [emailHash] } : {}),
        },
        custom_data: {
          currency: "ARS",
          value: args.monto,
        },
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(
      accessToken
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error("Error enviando Purchase a Meta:", json);
    return;
  }

  console.log("Purchase enviado a Meta:", json);
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const dataIdQuery =
      url.searchParams.get("data.id") ?? url.searchParams.get("id");

    let body: any = {};

    try {
      body = await req.json();
    } catch {}

    const dataId = dataIdQuery ?? body?.data?.id ?? body?.id;
    const tipo =
      url.searchParams.get("type") ?? body?.type ?? body?.topic;

    if (tipo !== "payment" || !dataId) {
      return NextResponse.json({
        ok: true,
        note: "Notificación ignorada",
      });
    }

    const firmaOk = verificarFirmaWebhook({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId: String(dataId),
    });

    if (!firmaOk) {
      console.warn("Webhook con firma inválida:", {
        dataId,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "Firma inválida",
        },
        {
          status: 401,
        }
      );
    }

    const pago = await consultarPago(String(dataId));

    if (pago.status !== "approved") {
      return NextResponse.json({
        ok: true,
        note: `Pago en estado ${pago.status}`,
      });
    }

    const token = pago.externalReference;

    if (!token) {
      return NextResponse.json({
        ok: true,
        note: "Sin external_reference",
      });
    }

    const { data: pedido, error: errBusqueda } =
      await supabaseAdmin
        .from("pedidos")
        .select(
          "id, email, destinatario, status, payment_id"
        )
        .eq("token", token)
        .single();

    if (errBusqueda || !pedido) {
      console.error(
        "Pedido no encontrado para webhook:",
        token
      );

      return NextResponse.json({
        ok: true,
        note: "Pedido no encontrado",
      });
    }

    if (
      pedido.status === "pagado" &&
      pedido.payment_id === String(dataId)
    ) {
      return NextResponse.json({
        ok: true,
        note: "Ya procesado",
      });
    }

    await supabaseAdmin
      .from("pedidos")
      .update({
        status: "pagado",
        payment_id: String(dataId),
        paid_at: new Date().toISOString(),
      })
      .eq("id", pedido.id);

    await enviarPurchaseMeta({
      paymentId: String(dataId),
      monto: pago.monto,
      email: pedido.email,
    });

    const urlEscuchar = `${BASE_URL}/escuchar/${token}`;

    const { subject, html } = emailPagoConfirmado({
      destinatarioLabel: pedido.destinatario,
      urlEscuchar,
    });

    await enviarEmail(
      pedido.email,
      subject,
      html
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (err: any) {
    console.error(
      "Error en /api/webhook-mp:",
      err
    );

    return NextResponse.json(
      {
        ok: false,
        error: err.message,
      },
      {
        status: 200,
      }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "webhook-mp",
  });
}
