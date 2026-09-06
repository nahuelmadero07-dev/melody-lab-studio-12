"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Formulario = {
  ocasion: string;
  tuNombre: string;
  destinatario: string;
  relacion: string;
  historia: string;
  estilo: string;
  clima: string;
  voz: string;
  email: string;
  whatsapp: string;
};

const inicial: Formulario = {
  ocasion: "",
  tuNombre: "",
  destinatario: "",
  relacion: "",
  historia: "",
  estilo: "",
  clima: "",
  voz: "",
  email: "",
  whatsapp: "",
};

export default function CrearPage() {
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<Formulario>(inicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = 9;
  const progreso = useMemo(() => Math.round(((paso + 1) / total) * 100), [paso]);

  function set<K extends keyof Formulario>(k: K, v: Formulario[K]) {
    setDatos((d) => ({ ...d, [k]: v }));
  }

  function siguiente() {
    if (paso < total - 1) setPaso(paso + 1);
  }
  function anterior() {
    if (paso > 0) setPaso(paso - 1);
  }

  async function enviar() {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const j = await res.json();
      if (!res.ok || !j.ok) {
        throw new Error(j.error || "No pudimos crear el pedido. Probá de nuevo.");
      }

      // Redirigimos a la página de escucha, que muestra el progreso en vivo
      // (se auto-refresca cada 5s hasta que la canción esté lista).
      window.location.href = `/escuchar/${j.token}`;
    } catch (e: any) {
      setError(e.message || "Algo salió mal. Probá de nuevo.");
      setEnviando(false);
    }
  }

  /* ============ FLUJO PASO A PASO ============ */
  const puedeAvanzar = validarPaso(paso, datos);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8">
      {/* Cabecera con progreso */}
      <header className="mb-14 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tighter2 text-parchment">
          Melody Lab <span className="text-parchment-muted">Studio</span>
          <span className="text-gold">.</span>
        </Link>
        <p className="text-sm text-parchment-dim">
          Paso {paso + 1} de {total}
        </p>
      </header>

      <div className="mb-14 h-0.5 w-full overflow-hidden rounded bg-night-soft">
        <div
          className="h-full bg-gold transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>

      {/* Contenido del paso */}
      <div className="flex-1">
        {paso === 0 && (
          <StepChoice
            titulo="¿Cuál es la ocasión?"
            ayuda="Elegí una. Esto marca el tono de toda la canción."
            valor={datos.ocasion}
            onChange={(v) => set("ocasion", v)}
            opciones={[
              "Aniversario",
              "Cumpleaños",
              "Pedir perdón",
              "Homenaje",
              "Nacimiento",
              "Boda",
              "Amistad",
              "Solo porque sí",
            ]}
          />
        )}

        {paso === 1 && (
          <StepInput
            titulo="¿Cómo te llamás?"
            ayuda="Es para dirigirnos a vos cuando te avisemos que está lista."
            valor={datos.tuNombre}
            onChange={(v) => set("tuNombre", v)}
            placeholder="Tu nombre"
          />
        )}

        {paso === 2 && (
          <StepInput
            titulo="¿Y cómo se llama la persona?"
            ayuda="El nombre que va a sonar cantado adentro de la canción."
            valor={datos.destinatario}
            onChange={(v) => set("destinatario", v)}
            placeholder="Su nombre"
          />
        )}

        {paso === 3 && (
          <StepChoice
            titulo={`¿Qué relación tenés con ${datos.destinatario || "esa persona"}?`}
            ayuda="Nos ayuda a elegir el vocabulario y la intimidad de la letra."
            valor={datos.relacion}
            onChange={(v) => set("relacion", v)}
            opciones={[
              "Pareja",
              "Hijo/a",
              "Mamá",
              "Papá",
              "Hermano/a",
              "Amigo/a",
              "Abuelo/a",
              "Otro",
            ]}
          />
        )}

        {paso === 4 && (
          <StepTextarea
            titulo="Contanos la historia."
            ayuda="Detalles, apodos, momentos, algo íntimo que solo ustedes dos entiendan. Cuanto más específico, mejor sale la letra. No hay mínimo, pero 3 o 4 líneas ayudan un montón."
            valor={datos.historia}
            onChange={(v) => set("historia", v)}
            placeholder="Ej: Nos conocimos en un bondi al Once, ella iba leyendo Cortázar. Nuestra canción de siempre es 'Ojalá' de Silvio. Le digo 'flaca' aunque no lo es. Cumplimos 5 años este viernes..."
          />
        )}

        {paso === 5 && (
          <StepChoice
            titulo="¿Qué estilo musical le pega?"
            ayuda="Pensá qué escucha ella (o él). Si dudás, balada nunca falla."
            valor={datos.estilo}
            onChange={(v) => set("estilo", v)}
            opciones={["Pop", "Balada", "Rock", "Reggaeton", "Bolero", "Mariachi"]}
          />
        )}

        {paso === 6 && (
          <StepChoice
            titulo="¿Qué clima querés?"
            ayuda="El sentimiento general de la canción."
            valor={datos.clima}
            onChange={(v) => set("clima", v)}
            opciones={["Romántico", "Alegre", "Melancólico", "Festivo"]}
          />
        )}

        {paso === 7 && (
          <StepChoice
            titulo="¿Voz masculina o femenina?"
            ayuda="También podés pedir las dos y comparar."
            valor={datos.voz}
            onChange={(v) => set("voz", v)}
            opciones={["Masculina", "Femenina", "Las dos"]}
          />
        )}

        {paso === 8 && (
          <StepFinal
            email={datos.email}
            whatsapp={datos.whatsapp}
            onEmail={(v) => set("email", v)}
            onWhatsapp={(v) => set("whatsapp", v)}
          />
        )}

        {error && (
          <p className="mt-6 rounded-lg border border-rose-dust/30 bg-rose-dust/5 px-4 py-3 text-sm text-rose-dust">
            {error}
          </p>
        )}
      </div>

      {/* Navegación */}
      <footer className="mt-14 flex items-center justify-between">
        <button
          onClick={anterior}
          disabled={paso === 0}
          className="rounded-full px-4 py-2 text-sm text-parchment-muted hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Atrás
        </button>

        {paso < total - 1 ? (
          <button
            onClick={siguiente}
            disabled={!puedeAvanzar}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 font-medium text-night hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={enviar}
            disabled={!puedeAvanzar || enviando}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 font-medium text-night hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            {enviando ? "Enviando..." : "Crear mi canción gratis"}
          </button>
        )}
      </footer>
    </main>
  );
}

/* ============ SUBCOMPONENTES ============ */

function StepChoice({
  titulo,
  ayuda,
  valor,
  onChange,
  opciones,
}: {
  titulo: string;
  ayuda: string;
  valor: string;
  onChange: (v: string) => void;
  opciones: string[];
}) {
  return (
    <div>
      <h1 className="font-display text-3xl leading-tight tracking-tighter2 text-parchment md:text-4xl">
        {titulo}
      </h1>
      <p className="mt-3 text-parchment-muted">{ayuda}</p>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {opciones.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-xl border px-5 py-4 text-left transition ${
              valor === o
                ? "border-gold bg-gold/10 text-parchment"
                : "border-parchment-muted/15 text-parchment-muted hover:border-parchment-muted/40 hover:text-parchment"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepInput({
  titulo,
  ayuda,
  valor,
  onChange,
  placeholder,
}: {
  titulo: string;
  ayuda: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl leading-tight tracking-tighter2 text-parchment md:text-4xl">
        {titulo}
      </h1>
      <p className="mt-3 text-parchment-muted">{ayuda}</p>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="mt-8 w-full border-b-2 border-parchment-muted/20 bg-transparent pb-3 font-display text-3xl text-parchment placeholder:text-parchment-dim focus:border-gold focus:outline-none"
      />
    </div>
  );
}

function StepTextarea({
  titulo,
  ayuda,
  valor,
  onChange,
  placeholder,
}: {
  titulo: string;
  ayuda: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl leading-tight tracking-tighter2 text-parchment md:text-4xl">
        {titulo}
      </h1>
      <p className="mt-3 text-parchment-muted">{ayuda}</p>
      <textarea
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={8}
        autoFocus
        className="mt-8 w-full rounded-xl border border-parchment-muted/20 bg-night-soft/50 p-5 text-base leading-relaxed text-parchment placeholder:text-parchment-dim focus:border-gold focus:outline-none"
      />
      <p className="mt-2 text-right text-xs text-parchment-dim">
        {valor.length} caracteres
      </p>
    </div>
  );
}

function StepFinal({
  email,
  whatsapp,
  onEmail,
  onWhatsapp,
}: {
  email: string;
  whatsapp: string;
  onEmail: (v: string) => void;
  onWhatsapp: (v: string) => void;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl leading-tight tracking-tighter2 text-parchment md:text-4xl">
        ¿Adónde te mandamos el adelanto?
      </h1>
      <p className="mt-3 text-parchment-muted">
        El email es obligatorio. El WhatsApp es opcional pero llega más rápido.
      </p>

      <div className="mt-8 space-y-6">
        <label className="block">
          <span className="mb-2 block text-sm text-parchment-muted">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="tu@email.com"
            autoFocus
            className="w-full rounded-xl border border-parchment-muted/20 bg-night-soft/50 px-4 py-3 text-parchment placeholder:text-parchment-dim focus:border-gold focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-parchment-muted">
            WhatsApp <span className="text-parchment-dim">(opcional)</span>
          </span>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => onWhatsapp(e.target.value)}
            placeholder="+54 9 11 1234 5678"
            className="w-full rounded-xl border border-parchment-muted/20 bg-night-soft/50 px-4 py-3 text-parchment placeholder:text-parchment-dim focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      <p className="mt-8 rounded-lg border border-parchment-muted/10 bg-night-soft/30 px-4 py-3 text-sm text-parchment-dim">
        Escuchás el adelanto gratis. Solo pagás <span className="text-parchment">$9,90</span> si te
        emociona. Sin cargos ocultos ni suscripciones.
      </p>
    </div>
  );
}

/* ============ VALIDACIÓN POR PASO ============ */

function validarPaso(paso: number, d: Formulario): boolean {
  switch (paso) {
    case 0: return !!d.ocasion;
    case 1: return d.tuNombre.trim().length >= 2;
    case 2: return d.destinatario.trim().length >= 2;
    case 3: return !!d.relacion;
    case 4: return d.historia.trim().length >= 20;
    case 5: return !!d.estilo;
    case 6: return !!d.clima;
    case 7: return !!d.voz;
    case 8: return /\S+@\S+\.\S+/.test(d.email);
    default: return false;
  }
}
