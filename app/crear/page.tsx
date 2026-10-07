"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PRECIO_LABEL } from "@/lib/config";

type Formulario = {
  // Lo que viaja al backend (mantiene los mismos campos para no romper el API)
  ocasion: string;
  tuNombre: string;      // Ya no se pide. Se manda vacío.
  destinatario: string;
  relacion: string;
  historia: string;
  estilo: string;        // Puede ser predefinido o custom (viene del input libre).
  clima: string;         // Se deriva automáticamente de la pregunta emocional.
  voz: string;
  email: string;
  whatsapp: string;      // Ya no se pide. Se manda vacío.

  // Solo para el frontend — no viaja al backend
  _sentimiento: string;      // Label visible de "¿qué querés que sienta?"
  _estiloCustom: string;     // Lo que el usuario escribe si elige "Otro".
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
  _sentimiento: "",
  _estiloCustom: "",
};

/* ============ MAPEO SENTIMIENTO → CLIMA (backend) ============ */
// La pregunta emocional reemplaza al "clima" seco. Internamente lo traducimos
// a los 4 climas que ya conoce el backend/prompt.
const SENTIMIENTOS: Array<{ label: string; clima: string }> = [
  { label: "Que se emocione hasta las lágrimas", clima: "Melancólico" },
  { label: "Que recuerde momentos juntos",        clima: "Romántico" },
  { label: "Que sonría de felicidad",             clima: "Alegre" },
  { label: "Que la quiera bailar",                clima: "Festivo" },
];

/* ============ ESTILOS MUSICALES ============ */
const ESTILOS = [
  "Balada romántica",
  "Pop",
  "Rock nacional",
  "Cumbia",
  "Tango",
  "Bolero",
  "Mariachi / Ranchera",
  "Folklore",
  "Reggaeton",
  "Salsa",
  "Vals",
  "Religiosa",
];

/* ============ MAPEO RELACIÓN → ETIQUETA DINÁMICA ============ */
// Para que la pregunta del nombre sea natural ("¿cómo se llama tu mamá?").
const ETIQUETA_RELACION: Record<string, string> = {
  "Mi pareja":     "tu pareja",
  "Mi mamá":       "tu mamá",
  "Mi papá":       "tu papá",
  "Mi hijo/a":     "tu hijo/a",
  "Mi hermano/a":  "tu hermano/a",
  "Mi abuelo/a":   "tu abuelo/a",
  "Un amigo/a":    "tu amigo/a",
  "Otra persona":  "esa persona",
};

export default function CrearPage() {
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<Formulario>(inicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = 7;
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
      // Si eligió un estilo custom, usamos ese. Si no, el predefinido.
      const estiloFinal = datos.estilo === "__custom" ? datos._estiloCustom.trim() : datos.estilo;

      const payload = {
        ocasion: datos.ocasion,
        tuNombre: "",                       // Ya no se pide, mandamos vacío
        destinatario: datos.destinatario,
        relacion: datos.relacion,
        historia: datos.historia,
        estilo: estiloFinal,
        clima: datos.clima,                 // Derivado del sentimiento
        voz: datos.voz,
        email: datos.email.trim(),
        whatsapp: "",                       // Ya no se pide
      };

      const res = await fetch("/api/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json();
      if (!res.ok || !j.ok) {
        throw new Error(j.error || "No pudimos crear el pedido. Probá de nuevo.");
      }

      // Evento Lead al pixel para que Meta aprenda
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead");
      }

      window.location.href = `/escuchar/${j.token}`;
    } catch (e: any) {
      setError(e.message || "Algo salió mal. Probá de nuevo.");
      setEnviando(false);
    }
  }

  const puedeAvanzar = validarPaso(paso, datos);
  const etiquetaDinamica = ETIQUETA_RELACION[datos.relacion] || "esa persona";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8">
      {/* Cabecera con progreso */}
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tighter2 text-parchment">
          Melody Lab <span className="text-parchment-muted">Studio</span>
          <span className="text-gold">.</span>
        </Link>
        <p className="text-sm text-parchment-dim">
          Paso {paso + 1} de {total}
        </p>
      </header>

      <div className="mb-12 h-1 w-full overflow-hidden rounded bg-night-soft">
        <div
          className="h-full bg-gold transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>

      {/* Contenido del paso */}
      <div className="flex-1">
        {/* PASO 1: ¿Para quién? (click puro, cero fricción) */}
        {paso === 0 && (
          <StepChoice
            titulo="¿Para quién es la canción?"
            ayuda="Elegí una. Esto nos ayuda a pensar la letra desde el principio."
            valor={datos.relacion}
            onChange={(v) => set("relacion", v)}
            opciones={[
              "Mi pareja",
              "Mi mamá",
              "Mi papá",
              "Mi hijo/a",
              "Mi hermano/a",
              "Mi abuelo/a",
              "Un amigo/a",
              "Otra persona",
            ]}
          />
        )}

        {/* PASO 2: Ocasión (click puro) */}
        {paso === 1 && (
          <StepChoice
            titulo="¿Cuál es la ocasión?"
            ayuda="El tono de la canción se ajusta a esto."
            valor={datos.ocasion}
            onChange={(v) => set("ocasion", v)}
            opciones={[
              "Cumpleaños",
              "Aniversario",
              "Día de la madre / padre",
              "Boda",
              "Nacimiento",
              "Homenaje",
              "Pedir perdón",
              "Solo porque sí",
            ]}
          />
        )}

        {/* PASO 3: Nombre del destinatario */}
        {paso === 2 && (
          <StepInput
            titulo={`¿Cómo se llama ${etiquetaDinamica}?`}
            ayuda="El nombre que va a sonar cantado adentro de la canción."
            valor={datos.destinatario}
            onChange={(v) => set("destinatario", v)}
            placeholder="Su nombre"
          />
        )}

        {/* PASO 4: Historia (con prompts guiados) */}
        {paso === 3 && (
          <StepTextarea
            titulo={`Contanos qué los hace únicos a vos y ${datos.destinatario || "esa persona"}.`}
            ayuda="Mientras más detalles personales nos des, más única va a salir la canción. Un recuerdo que te emociona, un apodo, algo que repitan siempre, una canción que compartan, un lugar que para ustedes significa algo."
            valor={datos.historia}
            onChange={(v) => set("historia", v)}
            placeholder={`Ej: ${datos.destinatario || "Marta"} es mi mamá y cumple 73. Nos criamos juntos después que mi papá se fue. Nos juntamos todos los domingos a tomar mate y escuchar Sandro, su cantante favorito. Me dice 'nene' aunque tengo 48. Siempre me acompañó en todo y quiero que sepa cuánto la admiro...`}
          />
        )}

        {/* PASO 5: Sentimiento → clima (anclaje emocional) */}
        {paso === 4 && (
          <StepChoice
            titulo="¿Qué querés que sienta cuando la escuche?"
            ayuda="Pensá en el momento en que se la vas a mostrar. ¿Cómo te lo imaginás?"
            valor={datos._sentimiento}
            onChange={(v) => {
              set("_sentimiento", v);
              // Mapeamos a clima internamente
              const s = SENTIMIENTOS.find((x) => x.label === v);
              if (s) set("clima", s.clima);
            }}
            opciones={SENTIMIENTOS.map((s) => s.label)}
          />
        )}

        {/* PASO 6: Estilo + voz (combinado) */}
        {paso === 5 && (
          <StepEstiloYVoz
            estilo={datos.estilo}
            estiloCustom={datos._estiloCustom}
            voz={datos.voz}
            onEstilo={(v) => set("estilo", v)}
            onEstiloCustom={(v) => set("_estiloCustom", v)}
            onVoz={(v) => set("voz", v)}
          />
        )}

        {/* PASO 7: Email */}
        {paso === 6 && (
          <StepFinal
            email={datos.email}
            onEmail={(v) => set("email", v)}
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
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={valor.length < 30 ? "text-parchment-dim" : "text-gold"}>
          {valor.length < 30
            ? `Mínimo 30 caracteres (${30 - valor.length} más)`
            : "✓ Buena, cuanto más detalles mejor"}
        </span>
        <span className="text-parchment-dim">{valor.length} caracteres</span>
      </div>
    </div>
  );
}

function StepEstiloYVoz({
  estilo,
  estiloCustom,
  voz,
  onEstilo,
  onEstiloCustom,
  onVoz,
}: {
  estilo: string;
  estiloCustom: string;
  voz: string;
  onEstilo: (v: string) => void;
  onEstiloCustom: (v: string) => void;
  onVoz: (v: string) => void;
}) {
  const usandoCustom = estilo === "__custom";

  return (
    <div>
      <h1 className="font-display text-3xl leading-tight tracking-tighter2 text-parchment md:text-4xl">
        ¿Qué estilo musical le pega?
      </h1>
      <p className="mt-3 text-parchment-muted">
        Pensá en qué escucha habitualmente. Si no estás seguro, balada nunca falla.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {ESTILOS.map((e) => (
          <button
            key={e}
            onClick={() => onEstilo(e)}
            className={`rounded-xl border px-4 py-3 text-sm transition ${
              estilo === e
                ? "border-gold bg-gold/10 text-parchment"
                : "border-parchment-muted/15 text-parchment-muted hover:border-parchment-muted/40 hover:text-parchment"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Caja para estilo custom */}
      <div className="mt-5">
        <button
          onClick={() => onEstilo("__custom")}
          className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
            usandoCustom
              ? "border-gold bg-gold/10 text-parchment"
              : "border-parchment-muted/15 text-parchment-muted hover:border-parchment-muted/40 hover:text-parchment"
          }`}
        >
          ¿Otro estilo? Escribilo acá
        </button>
        {usandoCustom && (
          <input
            type="text"
            value={estiloCustom}
            onChange={(e) => onEstiloCustom(e.target.value)}
            placeholder="Ej: Chamamé, Cuarteto, Jazz, Bossa Nova..."
            autoFocus
            className="mt-3 w-full rounded-xl border border-gold/40 bg-night-soft/50 px-4 py-3 text-parchment placeholder:text-parchment-dim focus:border-gold focus:outline-none"
          />
        )}
      </div>

      {/* Voz */}
      <div className="mt-10">
        <h2 className="font-display text-xl text-parchment">¿Voz masculina o femenina?</h2>
        <p className="mt-1 text-sm text-parchment-muted">
          También podés elegir un dúo con las dos voces.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {["Masculina", "Femenina", "Dúo"].map((v) => (
            <button
              key={v}
              onClick={() => onVoz(v)}
              className={`rounded-xl border px-4 py-3 text-sm transition ${
                voz === v
                  ? "border-gold bg-gold/10 text-parchment"
                  : "border-parchment-muted/15 text-parchment-muted hover:border-parchment-muted/40 hover:text-parchment"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepFinal({
  email,
  onEmail,
}: {
  email: string;
  onEmail: (v: string) => void;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl leading-tight tracking-tighter2 text-parchment md:text-4xl">
        ¿A qué email te mandamos el adelanto?
      </h1>
      <p className="mt-3 text-parchment-muted">
        Te avisamos ahí en cuanto esté lista (tarda 2–3 minutos).
      </p>

      <div className="mt-8">
        <label className="block">
          <span className="mb-2 block text-sm text-parchment-muted">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="tu@email.com"
            autoFocus
            className="w-full rounded-xl border border-parchment-muted/20 bg-night-soft/50 px-4 py-3 text-lg text-parchment placeholder:text-parchment-dim focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      <p className="mt-8 rounded-lg border border-parchment-muted/10 bg-night-soft/30 px-4 py-3 text-sm text-parchment-dim">
        Escuchás el adelanto gratis. Solo pagás <span className="text-parchment">{PRECIO_LABEL}</span> si te
        emociona. Sin cargos ocultos ni suscripciones.
      </p>
    </div>
  );
}

/* ============ VALIDACIÓN POR PASO ============ */

function validarPaso(paso: number, d: Formulario): boolean {
  switch (paso) {
    case 0: return !!d.relacion;
    case 1: return !!d.ocasion;
    case 2: return d.destinatario.trim().length >= 2;
    case 3: return d.historia.trim().length >= 30;
    case 4: return !!d._sentimiento && !!d.clima;
    case 5: {
      // Estilo válido: elegido predefinido O custom con texto
      const estiloOk = d.estilo && (d.estilo !== "__custom" || d._estiloCustom.trim().length >= 2);
      return !!estiloOk && !!d.voz;
    }
    case 6: return /\S+@\S+\.\S+/.test(d.email);
    default: return false;
  }
}
