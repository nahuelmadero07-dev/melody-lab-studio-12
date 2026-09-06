"use client";

import { useEffect, useRef, useState } from "react";

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
 * Reproductor completo — sin límite de 30 segundos, con botón de descarga.
 * Se muestra después de que el usuario paga.
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
      <div className="mt-4">
        <a
          href={url}
          download={filename}
          className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-soft"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 3v11M5 10l5 5 5-5M3 17h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Descargar MP3
        </a>
      </div>
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
        {cargando ? "Redirigiendo..." : `Desbloquear canción completa — $${monto.toFixed(2).replace(".", ",")}`}
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
