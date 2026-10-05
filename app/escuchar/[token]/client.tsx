"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatearPrecio } from "@/lib/config";

/**
 * Mientras el pedido está "generando", vuelve a pedir la página al servidor
 * cada N segundos. Sin esto, el texto "esta página se actualiza sola" era
 * mentira: `revalidate` solo regenera el HTML en el servidor, el navegador
 * del cliente no se entera de nada hasta que apreta F5.
 */
export function AutoRefresh({ cadaMs = 8000 }: { cadaMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), cadaMs);
    return () => clearInterval(id);
  }, [router, cadaMs]);
  return null;
}

/**
 * Reproductor de "adelanto" — permite escuchar solo los primeros 30 segundos.
 * Al llegar a 0:30 pausa y muestra el mensaje de compra.
 *
 * IMPORTANTE: esto es un lock de UI, no de seguridad. Un usuario técnico podría
 * bypassarlo. Para MVP es suficiente; en v2 vamos a hacer el corte real del MP3
 * en el backend antes de subirlo.
 */
export function ReproductorSnippet({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [terminoSnippet, setTerminoSnippet] = useState(false);

  const LIMITE = 30; // segundos

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setProgress(audio.currentTime);
      if (audio.currentTime >= LIMITE) {
        audio.pause();
        audio.currentTime = LIMITE;
        setReproduciendo(false);
        setTerminoSnippet(true);
      }
    };
    const onPlay = () => setReproduciendo(true);
    const onPause = () => setReproduciendo(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      // Si ya terminó el snippet, arrancamos de nuevo desde 0
      if (terminoSnippet) {
        audio.currentTime = 0;
        setTerminoSnippet(false);
      }
      audio.play();
    } else {
      audio.pause();
    }
  }

  const pct = Math.min((progress / LIMITE) * 100, 100);
  const min = Math.floor(progress / 60);
  const sec = String(Math.floor(progress % 60)).padStart(2, "0");

  return (
    <div>
      <audio ref={audioRef} src={url} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          aria-label={reproduciendo ? "Pausar" : "Reproducir"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-night hover:bg-gold-soft"
        >
          {reproduciendo ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 4h3v12H6zM11 4h3v12h-3z" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 4l10 6-10 6V4z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="h-1 overflow-hidden rounded-full bg-night-deep">
            <div
              className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-soft transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-parchment-dim">
            <span>{min}:{sec}</span>
            <span>0:30 — adelanto</span>
          </div>
        </div>
      </div>
      {terminoSnippet && (
        <p className="mt-4 text-sm text-gold">
          Terminó el adelanto. Desbloqueá la canción completa abajo para escuchar los 2 min y medio.
        </p>
      )}
    </div>
  );
}

/**
 * Reproductor completo — se muestra DESPUÉS de pagar.
 *
 * ⚠ Rediseñado: antes el único botón de descarga era un link chico tipo
 * "Descargar MP3" con ícono mínimo. En mobile, la gente mayor no lo veía
 * y buscaba descargar desde los "3 puntitos" nativos del <audio controls>
 * (que son microscópicos). Resultado: pagaban y no se llevaban el MP3.
 *
 * Ahora: botón ANCHO Y DORADO abajo del reproductor, imposible de no ver.
 */
export function ReproductorCompleto({
  url,
  filename,
}: {
  url: string;
  filename: string;
}) {
  return (
    <div>
      <audio controls src={url} className="w-full" />
      <a
        href={url}
        download={filename}
        className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-gold px-6 py-5 font-medium text-night shadow-lg shadow-gold/20 transition hover:bg-gold-soft active:scale-[0.98]"
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 3v12M6 11l6 6 6-6M3 20h18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-lg md:text-xl">Descargar esta canción</span>
      </a>
      <p className="mt-2 text-center text-xs text-parchment-dim">
        Se guarda en tu celular como archivo MP3.
      </p>
    </div>
  );
}

/**
 * Botón que crea un link de pago en Mercado Pago y redirige al checkout.
 */
export function BotonComprar({
  token,
  monto,
}: {
  token: string;
  monto: number;
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function comprar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/crear-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Error creando el pago");
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "InitiateCheckout", {
          value: monto,
          currency: "ARS",
        });
      }
      window.location.href = json.url;
    } catch (e: any) {
      setError(e.message);
      setCargando(false);
    }
  }

  return (
    <div>
      <button
        onClick={comprar}
        disabled={cargando}
        className="inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 font-medium text-night hover:bg-gold-soft disabled:opacity-50"
      >
        {cargando ? "Redirigiendo..." : `Desbloquear canción completa — ${formatearPrecio(monto)}`}
        {!cargando && (
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {error && (
        <p className="mt-3 text-sm text-rose-dust">{error}</p>
      )}
    </div>
  );
}
