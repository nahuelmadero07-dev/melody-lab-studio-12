import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { firmarUrlsPedido } from "@/lib/pipeline";
import { PRECIO_ARS } from "@/lib/config";
import type { Pedido } from "@/types";
import { ReproductorSnippet, ReproductorCompleto, BotonComprar, AutoRefresh } from "./client";

// Siempre leemos el estado fresco de Supabase (generando → listo → pagado).
// El refresco del lado del cliente lo hace <AutoRefresh /> mientras está generando.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  // La fuente de verdad son los ARCHIVOS DE AUDIO, no la etiqueta de estado.
  // Si el audio ya existe, la canción está lista y se muestra,
  // aunque el estado haya quedado mal grabado (pasó con versiones viejas del
  // sitio que dejaban pedidos con audio pero estado "generando").
  // Pedidos nuevos: una sola versión (url_a). Pedidos viejos pueden tener url_b también.
  const tieneAudios = Boolean(pedido.url_a);

  /* ------- ESTADO: GENERANDO (y sin audios todavía) ------- */
  if (pedido.status === "generando" && !tieneAudios) {
    return (
      <Mensaje
        titulo={`Componiendo la canción para ${pedido.destinatario}...`}
        subtitulo="Tarda entre 2 y 3 minutos. Podés dejar esta pestaña abierta — se actualiza sola. También te vamos a mandar un email cuando esté lista."
      >
        <AutoRefresh cadaMs={8000} />
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

  /* ------- ESTADO: ERROR (y sin audios que mostrar) ------- */
  if (pedido.status === "error" && !tieneAudios) {
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
            ✓ Canción desbloqueada
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
          : "Escuchá los primeros 30 segundos gratis. Si te emociona, desbloqueás la canción completa."}
      </p>

      {/* 🚨 BANNER URGENTE DE DESCARGA — solo cuando ya pagó */}
      {yaPagado && (
        <div className="mt-8 rounded-2xl border-2 border-gold bg-gold/10 p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-night">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 3v12M6 11l6 6 6-6M3 20h18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-display text-xl leading-snug text-parchment md:text-2xl">
                Importante: descargá las canciones a tu celular
              </p>
              <p className="mt-2 text-sm leading-relaxed text-parchment-muted md:text-base">
                Buscá el botón dorado grande debajo de la canción y tocalo para guardarla.
                Si cerrás esta página sin descargarla, la podés recuperar entrando al link del
                email que te mandamos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reproductores */}
      <div className="mt-12 space-y-8">
        <VersionCard
          etiqueta={urlB ? "Versión A" : "Tu canción"}
          descripcion={`Para ${pedido.destinatario}`}
          urlAudio={urlA}
          yaPagado={yaPagado}
        />
        {/* Solo pedidos viejos (de cuando se generaban 2 versiones) tienen url_b */}
        <VersionCard
          etiqueta="Versión B"
          descripcion="Arreglo full band, cinematográfico"
          urlAudio={urlB}
          yaPagado={yaPagado}
        />
      </div>

      {/* CTA de compra (si todavía no pagó) */}
      {!yaPagado && (
        <div className="mt-14 rounded-2xl border border-gold/20 bg-gold/5 p-8">
          <p className="font-display text-2xl leading-tight text-parchment">
            ¿Te emocionó? Desbloqueá la canción completa.
          </p>
          <p className="mt-3 text-parchment-muted">
            Te llevás la canción completa (2 min y medio) para descargar como MP3 y
            regalar. Único pago, sin suscripción.
          </p>
          <div className="mt-6">
            <BotonComprar token={pedido.token} monto={pedido.monto ?? PRECIO_ARS} />
          </div>
          <p className="mt-4 text-xs text-parchment-dim">
            Pago procesado por Mercado Pago. 7 días de garantía de devolución.
          </p>
        </div>
      )}

      {/* 🚨 RECORDATORIO FINAL de descarga + invitación a seguir el IG */}
      {yaPagado && (
        <div className="mt-14 space-y-6">
          <div className="rounded-xl border border-parchment-muted/15 bg-night-soft/40 p-5">
            <p className="text-sm font-medium text-parchment">
              ¿Ya descargaste la canción?
            </p>
            <p className="mt-2 text-sm text-parchment-muted">
              Tocá el botón dorado "Descargar esta canción" arriba. Si cerrás esta página sin
              bajarla, la podés recuperar siempre desde el link del email.
            </p>
          </div>

          <div className="rounded-xl border border-gold/15 bg-gold/5 p-5 text-center">
            <p className="text-sm text-parchment">
              💛 Si te emocionó, mostranos cómo lo recibió
            </p>
            <p className="mt-1 text-xs text-parchment-muted">
              Mandanos la reacción por Instagram, nos encanta verla.
            </p>
            <a
              href="https://www.instagram.com/melody.labstudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2 text-sm text-gold hover:bg-gold/10"
            >
              Seguinos en Instagram @melody.labstudio
            </a>
          </div>
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
  // Refuerzo anti-caché: le declara a Next que esta lectura JAMÁS se guarda.
  noStore();
  const { data } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  return (data as Pedido | null) ?? null;
}
