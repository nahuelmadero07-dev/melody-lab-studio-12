import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* ============ NAV MÍNIMA ============ */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6 md:pt-8">
        <Link href="/" className="font-display text-2xl tracking-tighter2 text-parchment">
          Melody Lab <span className="text-parchment-muted">Studio</span>
          <span className="text-gold">.</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-parchment-muted md:flex">
          <a href="#como-funciona" className="hover:text-parchment">Cómo funciona</a>
          <a href="#ocasiones" className="hover:text-parchment">Ocasiones</a>
          <a href="#faq" className="hover:text-parchment">Preguntas</a>
        </div>
        <Link
          href="/crear"
          className="rounded-full border border-parchment-muted/30 px-4 py-2 text-sm text-parchment hover:border-gold hover:text-gold"
        >
          Crear canción
        </Link>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="hero-halo pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-10">
            {/* Copy */}
            <div>
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-xs text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Un regalo hecho a medida
              </p>

              <h1 className="font-display text-[3.25rem] leading-[0.95] tracking-tighter2 text-parchment md:text-[4.5rem]">
                Convertí <em className="italic">su historia</em> en una canción.
              </h1>

              <p className="mt-6 max-w-reading text-lg leading-relaxed text-parchment-muted">
                Contás la historia. Nuestra IA la vuelve una canción con su nombre,
                cantada y con la letra que armamos con vos. Escuchás un adelanto gratis y
                pagás solo si te emociona.
              </p>

              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/crear"
                  className="group inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 font-medium text-night transition hover:bg-gold-soft"
                >
                  Crear mi canción
                  <svg className="h-4 w-4 transition group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <p className="text-sm text-parchment-dim">
                  Demo gratis · Solo pagás si te gusta · Desde $9,90
                </p>
              </div>
            </div>

            {/* Mockup reproductor */}
            <PlayerMockup />
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA (secuencia real → numeración OK) ============ */}
      <section id="como-funciona" className="border-t border-parchment-muted/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 max-w-2xl">
            <h2 className="font-display text-4xl leading-tight tracking-tighter2 text-parchment md:text-5xl">
              Tres pasos, dos minutos de tu parte.
            </h2>
            <p className="mt-4 text-parchment-muted">
              Lo hacemos simple porque el regalo no es la interfaz. Es lo que va a escuchar.
            </p>
          </div>

          <ol className="grid gap-8 md:grid-cols-3">
            <Step
              n="01"
              title="Contás la historia"
              body="Su nombre, la ocasión, la relación y qué querés que le llegue. Un formulario paso a paso que tarda unos dos minutos."
            />
            <Step
              n="02"
              title="La IA compone"
              body="Generamos dos versiones distintas: dos voces, dos climas, dos estilos. Con su nombre cantado dentro de la letra."
            />
            <Step
              n="03"
              title="Escuchás y decidís"
              body="Te mandamos un adelanto de 30 segundos por email o WhatsApp. Si te emociona, desbloqueás la canción completa por $9,90."
            />
          </ol>
        </div>
      </section>

      {/* ============ OCASIONES ============ */}
      <section id="ocasiones" className="border-t border-parchment-muted/10 bg-night-deep/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <h2 className="font-display text-4xl leading-tight tracking-tighter2 text-parchment md:text-5xl">
                Para cualquier momento que merezca ser cantado.
              </h2>
            </div>
            <p className="max-w-sm text-parchment-muted">
              Elegís la ocasión al empezar. El tono de la canción se ajusta a eso.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {occasions.map((o) => (
              <div
                key={o.title}
                className="surface rounded-xl p-5 transition hover:border-gold/40"
              >
                <div className="mb-3 text-gold">{o.icon}</div>
                <p className="font-display text-xl leading-tight text-parchment">{o.title}</p>
                <p className="mt-1 text-sm text-parchment-dim">{o.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GARANTÍA / CIERRE EMOCIONAL ============ */}
      <section className="border-t border-parchment-muted/10">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="font-display text-3xl leading-snug text-parchment md:text-4xl">
            Si no te emociona cuando lo escuchás, no pagás. Así de simple.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-parchment-muted">
            Y después de pagar, tenés siete días de garantía. Porque un regalo que no llega
            al corazón no es un regalo.
          </p>
          <Link
            href="/crear"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 font-medium text-night hover:bg-gold-soft"
          >
            Empezar ahora
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="border-t border-parchment-muted/10">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="mb-10 font-display text-4xl leading-tight tracking-tighter2 text-parchment md:text-5xl">
            Preguntas honestas.
          </h2>

          <div className="divide-y divide-parchment-muted/10">
            {faqs.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg text-parchment">
                  {f.q}
                  <span className="text-gold transition group-open:rotate-45">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-parchment-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-parchment-muted/10 bg-night-deep/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div>
              <p className="font-display text-2xl tracking-tighter2 text-parchment">
                Melody Lab <span className="text-parchment-muted">Studio</span>
                <span className="text-gold">.</span>
              </p>
              <p className="mt-3 max-w-xs text-sm text-parchment-dim">
                Canciones hechas a medida, con IA. Un regalo que no se olvida.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3 md:gap-14">
              <div>
                <p className="mb-3 text-parchment">Producto</p>
                <ul className="space-y-2 text-parchment-dim">
                  <li><a href="#como-funciona" className="hover:text-gold">Cómo funciona</a></li>
                  <li><a href="#ocasiones" className="hover:text-gold">Ocasiones</a></li>
                  <li><a href="#faq" className="hover:text-gold">Preguntas</a></li>
                </ul>
              </div>
              <div>
                <p className="mb-3 text-parchment">Legal</p>
                <ul className="space-y-2 text-parchment-dim">
                  <li><a href="/terminos" className="hover:text-gold">Términos</a></li>
                  <li><a href="/privacidad" className="hover:text-gold">Privacidad</a></li>
                </ul>
              </div>
              <div>
                <p className="mb-3 text-parchment">Contacto</p>
                <ul className="space-y-2 text-parchment-dim">
                  <li><a href="mailto:hola@melodylabstudio.com" className="hover:text-gold">hola@melodylabstudio.com</a></li>
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-10 border-t border-parchment-muted/10 pt-6 text-xs text-parchment-dim">
            Las canciones son generadas con inteligencia artificial usando Google Lyria con watermark SynthID.
            No representan a artistas reales ni son composiciones humanas. © {new Date().getFullYear()} Melody Lab Studio.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ============ COMPONENTES INTERNOS ============ */

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="relative pl-14">
      <span className="absolute left-0 top-1 font-display text-3xl leading-none text-gold/70">
        {n}
      </span>
      <h3 className="font-display text-2xl leading-tight text-parchment">{title}</h3>
      <p className="mt-2 text-parchment-muted">{body}</p>
    </li>
  );
}

function PlayerMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Halo sutil detrás */}
      <div className="absolute -inset-8 rounded-full bg-gold/5 blur-3xl" />

      <div className="surface relative rounded-2xl p-6">
        {/* Disco animado */}
        <div className="mx-auto mb-6 flex h-56 w-56 items-center justify-center">
          <div className="relative h-56 w-56 animate-spin-slow rounded-full bg-gradient-to-br from-night-soft via-night to-night-deep shadow-inner">
            {/* Ranuras del vinilo */}
            <div className="absolute inset-4 rounded-full border border-parchment-muted/10" />
            <div className="absolute inset-8 rounded-full border border-parchment-muted/10" />
            <div className="absolute inset-14 rounded-full border border-parchment-muted/10" />
            <div className="absolute inset-20 rounded-full border border-parchment-muted/10" />
            {/* Centro dorado */}
            <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-night" />
          </div>
        </div>

        {/* Info del tema */}
        <div className="mb-4">
          <p className="font-display text-lg text-parchment">Para mi vieja, en sus 60</p>
          <p className="text-sm text-parchment-dim">Estilo bolero · voz femenina</p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-night-deep">
          <div className="animate-progress h-full w-full bg-gradient-to-r from-gold-deep via-gold to-gold-soft" />
        </div>
        <div className="mb-6 flex justify-between text-xs text-parchment-dim">
          <span>0:12</span>
          <span>0:30 — adelanto</span>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-6">
          <button aria-label="Anterior" className="text-parchment-muted hover:text-parchment">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 4L6 10l9 6V4zM5 4h1v12H5z" />
            </svg>
          </button>
          <button
            aria-label="Reproducir"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-night hover:bg-gold-soft"
          >
            <svg className="ml-0.5 h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 4l10 6-10 6V4z" />
            </svg>
          </button>
          <button aria-label="Siguiente" className="text-parchment-muted hover:text-parchment">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4l9 6-9 6V4zM14 4h1v12h-1z" />
            </svg>
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-parchment-dim">
          Este es un adelanto. La canción completa la desbloqueás si te gusta.
        </p>
      </div>
    </div>
  );
}

/* ============ DATA ============ */

const occasions = [
  {
    title: "Aniversario",
    sub: "El día que se conocieron, en forma de canción.",
    icon: <IconHeart />,
  },
  {
    title: "Cumpleaños",
    sub: "Con su nombre cantado, no el genérico.",
    icon: <IconCake />,
  },
  {
    title: "Pedir perdón",
    sub: "Cuando las palabras se quedan cortas.",
    icon: <IconHand />,
  },
  {
    title: "Homenaje",
    sub: "Para recordar a quien ya no está.",
    icon: <IconMoon />,
  },
  {
    title: "Nacimiento",
    sub: "La primera canción de su vida.",
    icon: <IconStar />,
  },
  {
    title: "Boda",
    sub: "Su historia, contada en tres minutos.",
    icon: <IconRing />,
  },
  {
    title: "Amistad",
    sub: "Para ese amigo que es familia.",
    icon: <IconClink />,
  },
  {
    title: "Solo porque sí",
    sub: "El mejor motivo de todos.",
    icon: <IconSpark />,
  },
];

const faqs = [
  {
    q: "¿Cuánto tarda en llegar?",
    a: "Entre 2 y 3 minutos. Te avisamos por email —y por WhatsApp si nos lo dejaste— cuando esté listo el adelanto.",
  },
  {
    q: "¿Puedo elegir el estilo musical?",
    a: "Sí. En el formulario elegís entre pop, balada, rock, reggaeton, bolero o mariachi. Si dudás, marcá el que mejor le pegue a la persona.",
  },
  {
    q: "¿Y la voz? ¿Es masculina o femenina?",
    a: "Vos elegís. También podés pedir que generemos dos versiones distintas, una de cada, y quedarte con la que más te guste.",
  },
  {
    q: "¿Y si no me convence lo que sale?",
    a: "Antes de pagar, escuchás un adelanto de 30 segundos de cada versión. Si no te emociona, no pagás. Y una vez pagado, tenés siete días de garantía de devolución.",
  },
  {
    q: "¿Suena como algún cantante famoso?",
    a: "No. La voz es sintética, generada con IA. No podemos imitar a artistas reales ni queremos: cada canción es única y no representa a nadie más que a la historia que nos contás.",
  },
  {
    q: "¿Puedo descargar el MP3 para regalarlo?",
    a: "Sí. Una vez desbloqueado, podés descargar los archivos MP3 y compartirlos por donde quieras: WhatsApp, mail, o poniéndolo a sonar en persona.",
  },
];

/* ============ ICONOS (SVG inline, propios) ============ */

function IconHeart() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconCake() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20h16M5 20V13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M12 11V6M9 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconHand() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 11V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V6a1.5 1.5 0 0 1 3 0v9a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-4a1.5 1.5 0 0 1 3 0" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconMoon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 15.5A8 8 0 0 1 8.5 4a8 8 0 1 0 11.5 11.5z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconStar() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5 9.5 9 12 3z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconRing() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="15" r="6"/>
      <path d="M9 6l3-3 3 3-3 3-3-3z" strokeLinejoin="round"/>
    </svg>
  );
}
function IconClink() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 4l3 9-3 6M18 4l-3 9 3 6M9 13h6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconSpark() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" strokeLinecap="round"/>
    </svg>
  );
}
