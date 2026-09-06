import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { firmarUrlsPedido } from "@/lib/pipeline";
import type { Pedido } from "@/types";
import { ReproductorSnippet, ReproductorCompleto, BotonComprar } from "./client";

// Revalidamos cada 5s porque el estado del pedido cambia (generando → listo → pagado)
export const revalidate = 5;

export default async function EscucharPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { pago?: string };
}) {
  const pedido = await getPedido(params.token);

  if (!pedido) {
    return (
      <Mensaje
        titulo="No encontramos esta canción"
        subtitulo="El link puede estar mal escrito. Revisá el mail que te mandamos, ahí está el link correcto."
      />
    );
  }

  /* ------- ESTADO: GENERANDO ------- */
  if (pedido.status === "generando") {
    return (
      <Mensaje
        titulo={`Componiendo la canción para ${pedido.destinatario}...`}
        subtitulo="Tarda entre 2 y 3 minutos. Podés dejar esta pestaña abierta — se actualiza sola. También te vamos a mandar un email cuando esté lista."
      >
        <div className="mt-10 flex items-center gap-3 text-parchment-muted">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gold" />
          </div>
          <span className="text-sm">
            En proceso. Esta página se actualiza sola.
          </span>
        </div>
      </Mensaje>
    );
  }

  /* ------- ESTADO: ERROR ------- */
  if (pedido.status === "error") {
    return (
      <Mensaje
        titulo="Algo salió mal generando tu canción"
        subtitulo="No te preocupes, no te cobramos nada. Escribinos a hola@melodylabstudio.com y lo resolvemos ahora mismo."
      />
    );
  }

  /* ------- ESTADO: LISTO / PAGADO ------- */
  const { urlA, urlB } = await firmarUrlsPedido(pedido);
  const yaPagado = pedido.status === "pagado";
  const acabaDePagar = searchParams.pago === "aprobado" && yaPagado;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <div className="mb-14 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tighter2 text-parchment">
          Melody Lab <span className="text-parchment-muted">Studio</span>
          <span className="text-gold">.</span>
        </Link>
        {yaPagado && (
          <span className="rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-xs text-gold">
            ✓ Canción completa desbloqueada
          </span>
        )}
      </div>

      {/* Título */}
      <h1 className="font-display text-4xl leading-tight tracking-tighter2 text-parchment md:text-5xl">
        {acabaDePagar
          ? `¡Listo! Ya está desbloqueada la canción para ${pedido.destinatario}.`
          : yaPagado
          ? `Tu canción para ${pedido.destinatario}.`
          : `Escuchá el adelanto de la canción para ${pedido.destinatario}.`}
      </h1>
      <p className="mt-4 text-parchment-muted">
        {yaPagado
          ? "Podés escucharla, descargarla y compartirla las veces que quieras."
          : "Preparamos dos versiones. Escuchá 30 segundos de cada una — la que más te emocione es la que se lleva."}
      </p>

      {/* Reproductores */}
      <div className="mt-12 space-y-8">
        <VersionCard
          etiqueta="Versión A"
          descripcion="Arreglo acústico e íntimo"
          urlAudio={urlA}
          yaPagado={yaPagado}
        />
        <VersionCard
          etiqueta="Versión B"
          descripcion="Arreglo full band, cinematográfico"
          urlAudio={urlB}
          yaPagado={yaPagado}
        />
      </div>

      {/* CTA de compra o mensaje de descarga */}
      {!yaPagado && (
        <div className="mt-14 rounded-2xl border border-gold/20 bg-gold/5 p-8">
          <p className="font-display text-2xl leading-tight text-parchment">
            ¿Te emocionó? Desbloqueá las canciones completas.
          </p>
          <p className="mt-3 text-parchment-muted">
            Te llevás las dos versiones completas (2 min y medio cada una) para descargar
            como MP3 y regalar. Único pago, sin suscripción.
          </p>
          <div className="mt-6">
            <BotonComprar token={pedido.token} monto={pedido.monto ?? 9.9} />
          </div>
          <p className="mt-4 text-xs text-parchment-dim">
            Pago procesado por Mercado Pago. 7 días de garantía de devolución.
          </p>
        </div>
      )}

      {/* Letra (siempre visible, no es lo caro) */}
      {pedido.letra && (
        <details className="mt-14 rounded-2xl border border-parchment-muted/10 p-6">
          <summary className="cursor-pointer font-display text-xl text-parchment">
            Ver la letra
          </summary>
          <pre className="mt-6 whitespace-pre-wrap font-sans text-parchment-muted">
            {pedido.letra}
          </pre>
        </details>
      )}
    </main>
  );
}

/* ---------- Subcomponentes ---------- */

function VersionCard({
  etiqueta,
  descripcion,
  urlAudio,
  yaPagado,
}: {
  etiqueta: string;
  descripcion: string;
  urlAudio: string | null;
  yaPagado: boolean;
}) {
  if (!urlAudio) return null;
  return (
    <div className="surface rounded-2xl p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="font-display text-2xl text-parchment">{etiqueta}</p>
          <p className="text-sm text-parchment-dim">{descripcion}</p>
        </div>
      </div>
      {yaPagado ? (
        <ReproductorCompleto url={urlAudio} filename={`melody-lab-${etiqueta.toLowerCase().replace(" ", "-")}.mp3`} />
      ) : (
        <ReproductorSnippet url={urlAudio} />
      )}
    </div>
  );
}

function Mensaje({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-14 font-display text-xl tracking-tighter2 text-parchment">
        Melody Lab <span className="text-parchment-muted">Studio</span>
        <span className="text-gold">.</span>
      </Link>
      <h1 className="font-display text-4xl leading-tight tracking-tighter2 text-parchment md:text-5xl">
        {titulo}
      </h1>
      <p className="mt-4 max-w-md text-parchment-muted">{subtitulo}</p>
      {children}
    </main>
  );
}

async function getPedido(token: string): Promise<Pedido | null> {
  const { data } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  return (data as Pedido | null) ?? null;
}
