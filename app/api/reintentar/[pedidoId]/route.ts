import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase";
import { arrancarPipeline } from "@/lib/pipeline";
import { BASE_URL } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Endpoint ADMIN para relanzar un pedido que quedó en "error" o colgado en
 * "generando" (por ejemplo, porque Gemini devolvió 503 en todos los modelos,
 * o Vercel mató la función antes de terminar).
 *
 * Sin esto, cada error transitorio de un proveedor = una venta perdida y un
 * cliente al que tenés que pedirle que vuelva a cargar todo el formulario.
 *
 * USO DESDE EL NAVEGADOR (sin terminal):
 *   https://TU-DOMINIO/api/reintentar/<id del pedido>?clave=TU_ADMIN_SECRET
 *
 * El <id del pedido> es la columna "id" de la tabla pedidos en Supabase.
 * Requiere la variable de entorno ADMIN_SECRET en Vercel (una contraseña
 * larga inventada por vos). Nunca compartas ese link: quien lo tenga puede
 * relanzar pedidos, y cada relanzamiento cuesta ~US$0,16 en fal.ai.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { pedidoId: string } }
) {
  const clave = new URL(req.url).searchParams.get("clave");
  return relanzar(params.pedidoId, clave);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { pedidoId: string } }
) {
  const clave =
    req.headers.get("x-admin-secret") ?? new URL(req.url).searchParams.get("clave");
  return relanzar(params.pedidoId, clave);
}

async function relanzar(pedidoId: string, clave: string | null) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Falta configurar ADMIN_SECRET en las variables de entorno de Vercel" },
      { status: 500 }
    );
  }
  if (clave !== secret) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { data: pedido, error } = await supabaseAdmin
    .from("pedidos")
    .select("id, status, destinatario")
    .eq("id", pedidoId)
    .single();

  if (error || !pedido) {
    return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
  }

  if (pedido.status === "listo" || pedido.status === "pagado") {
    return NextResponse.json(
      {
        ok: false,
        error: `El pedido ya está en "${pedido.status}". No se relanza para no pisar una canción terminada.`,
      },
      { status: 400 }
    );
  }

  // Volvemos a "generando" y limpiamos lo que haya quedado a medias.
  // Si alguna variante ya se había subido, se vuelve a generar igual
  // (más simple que reconciliar a medias; cuesta US$0,16).
  await supabaseAdmin
    .from("pedidos")
    .update({
      status: "generando",
      error_message: null,
      letra: null,
      url_a: null,
      url_b: null,
      snippet_a: null,
      snippet_b: null,
      fal_request_id_a: null,
      fal_request_id_b: null,
    })
    .eq("id", pedidoId);

  waitUntil(arrancarPipeline(pedidoId, BASE_URL));

  return NextResponse.json({
    ok: true,
    mensaje: `Pipeline relanzado para la canción de ${pedido.destinatario}. Tarda 2-5 minutos. Seguilo en /escuchar/{token}.`,
  });
}
