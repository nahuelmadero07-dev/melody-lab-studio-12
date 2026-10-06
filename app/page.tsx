"use client";

/* ================================================================
   app/page.tsx — Landing nueva para Melody Lab Studio
   Reemplaza el archivo actual.

   Depende de:
   - /public/testimonios/01-hermoso.webp .. 08-buenisimo.webp
   - lib/config.ts (PRECIO_LABEL)
   - Fuentes cargadas en layout.tsx (Fraunces, Inter, Caveat)
   - Clases custom en globals.css (home-dark, h-display, h-section,
     italic-soft, pulse-cta, wa-float, chat-bubble-in)
   - Colores custom en tailwind.config.ts (ebony, cream, rose, gold2, wa)
   ================================================================ */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRECIO_LABEL } from "@/lib/config";

/* ---------- Tracking Meta Pixel (idéntico al page.tsx viejo) ---------- */
function trackClickCrear() {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "ViewContent", { content_name: "crear" });
  }
}
function trackClickWhatsapp() {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("trackCustom", "ClickWhatsapp");
  }
}

/* ---------- Contacto ---------- */
const WHATSAPP_NUM = "5491166382852";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(
  "Hola, tengo una duda antes de pedir mi canción"
)}`;

/* ---------- Capturas reales en /public/testimonios/ ---------- */
const CAPTURAS = [
  { src: "/testimonios/01-hermoso.webp", alt: "Cliente escribió: HERMOSO ME HICISTE" },
  { src: "/testimonios/02-espectacular.webp", alt: "Cliente escribió: Espectacular felicitaciones" },
  { src: "/testimonios/03-super-recomendable.webp", alt: "Cliente escribió: Super recomendable" },
  { src: "/testimonios/04-me-emocione.webp", alt: "Cliente escribió: Me emocioné, está hermosa" },
  { src: "/testimonios/05-hermoso-gracias.webp", alt: "Cliente escribió: Hermoso gracias" },
  { src: "/testimonios/06-muyy-biennn.webp", alt: "Cliente escribió: Muy bien, me gustó mucho" },
  { src: "/testimonios/07-saltar-de-felicidad.webp", alt: "Cliente escribió: Me hicieron saltar de felicidad a ambos" },
  { src: "/testimonios/08-buenisimo.webp", alt: "Cliente escribió: Buenísimo" },
];

/* ---------- Mensajes del ticker superior ---------- */
const TICKER_MSGS = [
  "Adelanto gratis",
  "Entrega en 1 minuto",
  "7 días de garantía",
  "Voz cantada real · Google Lyria",
  "Mercado Pago · 3 cuotas sin interés",
];

/* ---------- Compradores para el toast ---------- */
const COMPRADORES = [
  { name: "Graciela", city: "Buenos Aires" },
  { name: "Marta", city: "Córdoba" },
  { name: "Silvia", city: "Rosario" },
  { name: "Patricia", city: "Mendoza" },
  { name: "Claudia", city: "Tucumán" },
  { name: "Roberto", city: "La Plata" },
  { name: "Gustavo", city: "Mar del Plata" },
  { name: "Eduardo", city: "Salta" },
  { name: "Ricardo", city: "Santa Fe" },
  { name: "Adriana", city: "San Juan" },
  { name: "Alejandro", city: "Neuquén" },
  { name: "Marcela", city: "Bahía Blanca" },
  { name: "Gabriela", city: "Resistencia" },
  { name: "Jorge", city: "Posadas" },
  { name: "Fernando", city: "Paraná" },
  { name: "Susana", city: "Corrientes" },
  { name: "Daniel", city: "Formosa" },
  { name: "Hugo", city: "Bariloche" },
];

/* ---------- Testimonios cards ---------- */
const TESTIMONIOS = [
  {
    initial: "R",
    name: "Rosita",
    title: "La escuchó en el almuerzo familiar",
    text: "Era el cumple 70 de mi mamá. Le puse la canción en el almuerzo. Toda la familia terminó llorando. Mi mamá me pidió escucharla 5 veces más esa misma tarde. No podía creer que decía su nombre.",
  },
  {
    initial: "M",
    name: "Marta",
    title: "Mi marido se quedó mudo",
    text: "Lo pusimos en el estéreo del auto cuando volvíamos de la cena de aniversario. Mi marido no dijo nada por dos minutos. Cuando terminó me agarró la mano y me dijo gracias. Nos emocionamos los dos.",
  },
  {
    initial: "N",
    name: "Nuria",
    title: "Mi hija me la pidió otra vez",
    text: "Se la hice a mi hija de 8 años para su cumpleaños, con la historia de cómo esperamos su llegada. La escuchó y me dijo mamá ponela otra vez. La repitió como 10 veces. Hoy la escucha para dormirse.",
  },
  {
    initial: "J",
    name: "Juanjo",
    title: "Karina me saltó encima",
    text: "Se la mandé por WhatsApp porque estábamos lejos. Me respondió un audio llorando. Al día siguiente me saltó encima apenas la vi. El regalo más barato y más fuerte que le hice en 7 años.",
  },
];

/* ---------- FAQ ---------- */
const FAQS = [
  {
    q: "¿Qué recibo exactamente?",
    a: "Dos versiones diferentes de la canción (misma letra, distinto arreglo) en formato MP3, un link privado para escucharla online y compartirla, y factura electrónica. Todo en el mismo minuto, por mail.",
  },
  {
    q: "¿Cuánto tarda?",
    a: "Menos de 1 minuto desde que terminás el formulario. Mientras tanto podés quedarte en la página escuchando el adelanto gratis.",
  },
  {
    q: "¿Puedo escuchar antes de pagar?",
    a: "Sí. Después de contarnos la historia, en menos de un minuto te llega un adelanto gratis de 30 segundos con el nombre cantado adentro. Si te emociona, pagás. Si no, no pagás nada.",
  },
  {
    q: "Medios de pago",
    a: "Tarjeta de crédito con hasta 3 cuotas sin interés, débito en un pago, y todas las opciones de Mercado Pago (dinero en cuenta, tarjetas, QR).",
  },
  {
    q: "¿Puedo elegir el estilo de música?",
    a: "Sí. En el formulario elegís entre balada romántica, pop, cumbia, rock, folklore, bossa, trap, infantil y varios más. También elegís voz masculina o femenina.",
  },
  {
    q: "¿Qué pasa si no me gusta?",
    a: "Tenés 7 días desde la compra para pedir el reembolso completo. Sin preguntas, sin trámites. Nos escribís por WhatsApp y en 24h tenés la plata de vuelta.",
  },
];

/* ================================================================
   COMPONENTE PRINCIPAL
   ================================================================ */
export default function Home() {
  return (
    <div className="home-dark min-h-screen">
      <StyleBlock />
      <TopTicker />
      <TopNav />

      <main id="top">
        <Hero />
        <SocialStrip />
        <Benefits />
        <OfferAndCTA />
        <Garantia />
        <Comparador />
        <CarruselCapturas />
        <ReaccionReal />
        <ComoFunciona />
        <Experto />
        <Testimonios />
        <FAQ />
        <MediaTicker />
        <FinalCTA />
      </main>

      <Footer />
      <BuyerToast />
      <WhatsAppFloat />
    </div>
  );
}

/* ================================================================
   ESTILOS INLINE: keyframes y clases custom para esta página
   (No tocamos globals.css)
   ================================================================ */
function StyleBlock() {
  return (
    <style>{`
      @keyframes mls-ticker { to { transform: translateX(calc(-50% - 30px)); } }
      @keyframes mls-carousel { to { transform: translateX(calc(-50% - 7px)); } }
      @keyframes mls-media { to { transform: translateX(calc(-50% - 30px)); } }
      @keyframes mls-shine {
        0% { left: -160%; opacity: 0; }
        6% { opacity: 1; }
        90% { opacity: 1; }
        100% { left: 190%; opacity: 0; }
      }
      @keyframes mls-spin { to { transform: rotate(360deg); } }

      .mls-ticker-track { animation: mls-ticker 25s linear infinite; }
      .mls-carousel-track { animation: mls-carousel 50s linear infinite; }
      .mls-media-track { animation: mls-media 25s linear infinite; }
      .mls-reel { animation: mls-spin 4s linear infinite; }
      .mls-reel-rev { animation: mls-spin 4s linear infinite reverse; }
      .mls-shine-active::before {
        animation: mls-shine 2.4s cubic-bezier(.25,.46,.45,.94) .3s forwards;
      }

      .mls-mask-h {
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
      }

      .mls-shine-box { position: relative; overflow: hidden; }
      .mls-shine-box::before {
        content: ""; pointer-events: none; position: absolute;
        top: -80%; left: -160%; width: 80%; height: 260%;
        background: linear-gradient(105deg, transparent 15%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.05) 70%, transparent 85%);
        transform: skewX(-12deg); opacity: 0;
      }

      .mls-toast {
        transform: translateY(140%); opacity: 0;
        transition: transform .5s cubic-bezier(.4,0,.2,1), opacity .4s;
      }
      .mls-toast.show { transform: translateY(0); opacity: 1; }

      details.mls-faq[open] .mls-caret { transform: rotate(180deg); }
      .mls-caret { transition: transform .3s; }

      /* Soft gradients por secciones */
      .mls-section-alt {
        background: #150E11;
        border-top: 1px solid rgba(245,232,207,.06);
        border-bottom: 1px solid rgba(245,232,207,.06);
      }
    `}</style>
  );
}

/* ================================================================
   TOP TICKER
   ================================================================ */
function TopTicker() {
  // Duplicamos los mensajes 6 veces para loop infinito
  const repeated = Array(6).fill(TICKER_MSGS).flat();
  return (
    <div
      className="overflow-hidden border-b border-cream/10"
      style={{
        background: "linear-gradient(90deg,#1a0f14 0%,#2a1620 50%,#1a0f14 100%)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="mls-ticker-track flex gap-[60px] py-2.5 w-max">
        {repeated.map((m, i) => (
          <span
            key={i}
            className="text-[12.5px] font-semibold tracking-[1.5px] uppercase text-cream whitespace-nowrap inline-flex items-center gap-2"
          >
            <span className="text-rose">●</span>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   NAV
   ================================================================ */
function TopNav() {
  return (
    <nav
      className="sticky top-0 z-40 backdrop-blur-md border-b border-cream/5"
      style={{ background: "rgba(14,10,12,0.9)" }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="inline-block h-7 w-7 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #D4A74A 0%, #D4A74A 30%, #0E0A0C 32%, #0E0A0C 46%, #231A1E 48%, #231A1E 100%)",
            }}
          />
          <span className="font-serif text-[17px] font-medium text-cream">
            Melody Lab <span className="text-cream-dim">Studio</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_URL}
            onClick={trackClickWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] text-cream-dim hover:text-cream px-3 py-1.5 rounded-full border border-cream/10 transition"
          >
            <svg className="h-3.5 w-3.5 text-wa" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 3.5A11.8 11.8 0 0 0 2.1 18.5L1 23l4.6-1.1A11.8 11.8 0 1 0 20 3.5z" />
            </svg>
            WhatsApp
          </a>
          <Link
            href="/crear"
            onClick={trackClickCrear}
            className="inline-flex items-center text-[13px] font-medium bg-rose text-white px-4 py-2 rounded-full hover:bg-rose-deep transition"
          >
            Empezar
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ================================================================
   HERO
   ================================================================ */
function Hero() {
  return (
    <section className="px-4 md:px-8 pt-8 md:pt-14 pb-10 md:pb-20">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-5 gap-10 lg:gap-14 items-center">
        {/* Cassette - va primero en mobile */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <CassetteDecorativo />
        </div>

        {/* Texto hero */}
        <div className="order-2 lg:order-1 lg:col-span-3">
          <div className="inline-flex items-center gap-2 text-[12px] text-rose font-medium tracking-wider uppercase mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose" />
            Hecho con Google Lyria · entregado en 1 minuto
          </div>
          <h1 className="h-display text-[44px] sm:text-[56px] lg:text-[72px] text-cream">
            Una canción<br />
            con <em className="italic-soft">su nombre</em>,<br />
            cantada en 1 minuto.
          </h1>

          {/* Rating */}
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            <StarRow count={5} />
            <span className="text-[14px] font-bold text-cream">4.8</span>
            <span className="text-[13px] font-medium text-cream-faint">
              <u>127 calificaciones</u>
            </span>
          </div>

          <p className="mt-6 text-[17px] md:text-[18px] text-cream/80 leading-relaxed max-w-xl">
            Contanos quién es y qué los une. Nuestra IA compone una canción única con su nombre cantado adentro y los recuerdos que le pertenecen solo a ustedes dos.
          </p>

          <div className="mt-8" id="empezar">
            <Link
              href="/crear"
              onClick={trackClickCrear}
              className="pulse-cta inline-flex items-center justify-center gap-2 bg-rose hover:bg-rose-deep text-white font-semibold text-[17px] px-7 py-4 rounded-full transition w-full sm:w-auto"
            >
              Empezar mi canción gratis
              <ArrowRight />
            </Link>
            <div className="mt-4 flex items-center flex-wrap gap-x-4 gap-y-2 text-[14px] text-cream-dim">
              <span className="inline-flex items-center gap-1.5">
                <StarIcon />
                Adelanto gratis
              </span>
              <span>•</span>
              <span>
                Pagás <strong className="text-cream">{PRECIO_LABEL}</strong> solo si te emociona
              </span>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-cream-faint">
            <span className="inline-flex items-center gap-1.5">
              <MPIcon />
              Mercado Pago
            </span>
            <span>•</span>
            <span>7 días de garantía</span>
            <span>•</span>
            <span>Factura electrónica</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Cassette estático decorativo */
function CassetteDecorativo() {
  return (
    <div
      className="rounded-2xl p-6 max-w-md mx-auto"
      style={{
        background: "linear-gradient(145deg,#2a1b22 0%,#1a1014 100%)",
        border: "1px solid rgba(245,232,207,.1)",
        boxShadow: "0 20px 60px -20px rgba(0,0,0,.6), inset 0 1px 0 rgba(245,232,207,.08)",
      }}
    >
      {/* Etiqueta */}
      <div className="bg-cream text-ebony rounded-md px-3.5 py-3 flex items-center gap-3 font-serif">
        <span className="bg-rose text-white px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide">
          A
        </span>
        <span className="text-[15px] font-bold truncate flex-1">
          Para Karina — Juanjo
        </span>
      </div>

      {/* Reels */}
      <div className="flex justify-around mt-4 py-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={i === 0 ? "mls-reel w-14 h-14 rounded-full relative" : "mls-reel-rev w-14 h-14 rounded-full relative"}
            style={{
              background:
                "radial-gradient(circle,#2a1b22 30%,#0E0A0C 32%,#0E0A0C 55%,#2a1b22 57%)",
              border: "2px solid rgba(245,232,207,.15)",
            }}
          >
            <span
              className="absolute inset-[40%] rounded-full"
              style={{ background: "#D4A74A" }}
            />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-[3px] rounded-sm overflow-hidden" style={{ background: "rgba(245,232,207,.1)" }}>
        <div className="h-full rounded-sm" style={{ width: "34%", background: "#F0416C" }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[11px] text-cream-faint tabular-nums">
        <span>0:42</span>
        <span>2:14</span>
      </div>
    </div>
  );
}

/* ================================================================
   SOCIAL STRIP
   ================================================================ */
function SocialStrip() {
  const iniciales = [
    { l: "R", bg: "#D4A74A", fg: "#0E0A0C" },
    { l: "M", bg: "#F0416C", fg: "#fff" },
    { l: "N", bg: "#231A1E", fg: "#F5E8CF" },
    { l: "J", bg: "#F5E8CF", fg: "#0E0A0C" },
  ];
  return (
    <section className="border-y border-cream/10 py-4 md:py-5" style={{ background: "#150E11" }}>
      <div className="mx-auto max-w-6xl px-4 md:px-8 flex items-center justify-center sm:justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {iniciales.map((i, k) => (
              <span
                key={k}
                className="h-9 w-9 rounded-full flex items-center justify-center font-serif font-semibold text-[14px] border-2"
                style={{ background: i.bg, color: i.fg, borderColor: "#0E0A0C" }}
              >
                {i.l}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-cream-dim leading-tight">
            <strong className="text-cream font-medium">Rosita, Marta, Nuria y Juanjo</strong>
            <br />
            <span className="text-[12px]">regalaron la suya este mes</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-cream-dim">
          <StarRow count={5} />
          <span>
            Más de <strong className="text-cream font-medium">500 personas</strong> ya la regalaron
          </span>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   BENEFITS
   ================================================================ */
function Benefits() {
  const items = [
    { html: "Una <strong>canción única</strong> con su nombre cantado adentro" },
    { html: "La historia que <strong>solo ustedes dos</strong> conocen" },
    { html: "Entregada en <strong>1 minuto</strong>, directo a tu WhatsApp" },
    { html: "<strong>7 días de garantía</strong>: si no te emociona, te devolvemos todo" },
  ];
  return (
    <section className="px-4 md:px-8 pt-10 md:pt-14 pb-2">
      <div className="mx-auto max-w-xl">
        <h2 className="text-center font-serif text-[22px] font-semibold text-cream mb-5">
          ¿Qué recibís?
        </h2>
        <ul className="list-none p-0 m-0 flex flex-col gap-3">
          {items.map((it, i) => (
            <li key={i} className="flex gap-3 items-start text-[15px] text-cream/80 leading-snug">
              <CheckGreen />
              <span className="font-medium" dangerouslySetInnerHTML={{ __html: it.html }} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ================================================================
   OFFER + CTA
   ================================================================ */
function OfferAndCTA() {
  return (
    <>
      {/* Oferta */}
      <section className="px-4 md:px-8 pt-6 pb-2">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-center font-serif text-[17px] font-bold text-gold2 mb-4 text-center">
            <span className="flex-1 border-b border-gold2/30 mr-3" />
            Elegí tu canción
            <span className="flex-1 border-b border-gold2/30 ml-3" />
          </div>

          <div
            className="relative border-2 border-rose rounded-[18px] p-5 shadow-[0_10px_30px_-10px_rgba(240,65,108,0.3)]"
            style={{
              background: "linear-gradient(145deg,rgba(240,65,108,.08) 0%,rgba(240,65,108,.02) 100%)",
            }}
          >
            <span
              className="absolute -top-3 right-5 bg-rose text-white text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded"
              style={{ boxShadow: "0 4px 10px rgba(240,65,108,.4)" }}
            >
              RECOMENDADO
            </span>

            <div className="flex items-center gap-4">
              <span
                className="w-8 h-8 rounded-full border-2 border-rose bg-white flex items-center justify-center flex-none"
                aria-hidden="true"
              >
                <span className="w-4 h-4 rounded-full bg-rose" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2.5">
                  <h3 className="text-[17px] font-bold text-cream m-0">
                    Tu canción personalizada
                  </h3>
                  <p className="font-serif text-[22px] font-extrabold text-cream m-0 whitespace-nowrap">
                    {PRECIO_LABEL}
                  </p>
                </div>
                <p className="text-[13.5px] text-cream-dim mt-1 m-0">
                  2 versiones diferentes · descarga MP3 · link para compartir
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-3.5 border-t border-cream/15 border-dashed flex flex-col gap-2">
              <GiftRow text="<strong>Adelanto gratis</strong> — escuchás antes de pagar" />
              <GiftRow text="<strong>Factura electrónica</strong> incluida" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA bajo oferta */}
      <div className="mx-auto max-w-xl px-4 mt-6 flex flex-col items-center">
        <Link
          href="/crear"
          onClick={trackClickCrear}
          className="inline-flex items-center justify-center gap-2 bg-rose hover:bg-rose-deep text-white font-semibold text-[17px] px-7 py-4 rounded-full transition w-full"
          style={{ boxShadow: "0 10px 30px -8px rgba(240,65,108,.5)" }}
        >
          Crear mi canción ahora
          <ArrowRight />
        </Link>
      </div>
    </>
  );
}

function GiftRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-cream-dim">
      <span className="w-5 h-5 rounded-md bg-rose text-white flex items-center justify-center flex-none">
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M10.334 1 4 8.333 1.667 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span dangerouslySetInnerHTML={{ __html: text }} className="[&>strong]:text-cream [&>strong]:font-semibold" />
    </div>
  );
}

/* ================================================================
   GARANTÍA (con shine effect)
   ================================================================ */
function Garantia() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      const t = setTimeout(() => el.classList.add("mls-shine-active"), 800);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("mls-shine-active");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="px-4 md:px-8 pt-3 pb-10">
      <div className="mx-auto max-w-xl">
        <div
          ref={boxRef}
          className="mls-shine-box flex items-start gap-3 p-4 rounded-xl border border-cream/10"
          style={{ background: "rgba(245,232,207,.04)" }}
        >
          <svg className="w-[22px] h-[22px] text-gold2 flex-none mt-0.5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4zm-1 14l6-6-1.4-1.4L11 13.2 8.4 10.6 7 12l4 4z"
            />
          </svg>
          <div className="flex flex-col gap-1">
            <p className="m-0 text-[14.5px] font-bold text-cream">7 días de garantía</p>
            <p className="m-0 text-[13px] font-medium text-cream-dim leading-snug">
              Si la canción no te emociona, te devolvemos cada peso. Sin preguntas. Sin trámites.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   COMPARADOR (antes / después conceptual)
   ================================================================ */
function Comparador() {
  return (
    <section className="px-4 md:px-8 py-14">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
          La diferencia
        </p>
        <h2 className="h-section text-[32px] md:text-[44px] text-cream mb-8">
          De una idea tuya<br />a una canción cantada.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left">
          <div
            className="rounded-[18px] p-7"
            style={{
              background: "rgba(245,232,207,.03)",
              border: "1px dashed rgba(245,232,207,.15)",
            }}
          >
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-cream/10 text-cream-faint mb-3.5">
              Antes
            </span>
            <h3 className="font-serif text-[22px] font-semibold text-cream mb-3 leading-tight">
              Una tarjeta en blanco
            </h3>
            <p className="text-[14.5px] text-cream-dim leading-relaxed m-0">
              Querés decir algo que no se puede escribir. Tenés el recuerdo, el apodo, la broma interna. Pero el papel se queda chico y el regalo típico no alcanza.
            </p>
          </div>
          <div
            className="rounded-[18px] p-7"
            style={{
              background:
                "linear-gradient(145deg,rgba(212,167,74,.1) 0%,rgba(240,65,108,.08) 100%)",
              border: "1px solid rgba(212,167,74,.3)",
              boxShadow: "0 20px 50px -20px rgba(240,65,108,.3)",
            }}
          >
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-rose text-white mb-3.5">
              Después
            </span>
            <h3 className="font-serif text-[22px] font-semibold text-cream mb-3 leading-tight">
              Una canción con su nombre
            </h3>
            <p className="text-[14.5px] text-cream-dim leading-relaxed m-0">
              Todo eso convertido en una canción cantada de verdad, con su nombre dentro de la letra. Dura 2 minutos. Se guarda en el teléfono. Se escucha una y otra vez.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   CARRUSEL DE CAPTURAS REALES
   ================================================================ */
function CarruselCapturas() {
  // Repetimos 3 veces para loop infinito
  const slides = Array(3).fill(CAPTURAS).flat();
  return (
    <section className="py-10 overflow-hidden">
      <p className="text-center text-[12px] text-gold2 uppercase tracking-widest mb-6">
        Mensajes reales de quienes la recibieron
      </p>
      <div className="mls-mask-h overflow-hidden">
        <div className="mls-carousel-track flex gap-3.5 items-center w-max py-2.5">
          {slides.map((s, i) => (
            <div
              key={i}
              className="flex-none w-[240px] bg-white rounded-2xl overflow-hidden transition hover:-translate-y-1"
              style={{
                aspectRatio: "540 / 1170",
                boxShadow: "0 12px 32px -10px rgba(0,0,0,.55)",
              }}
            >
              <Image
                src={s.src}
                alt={s.alt}
                width={540}
                height={1170}
                loading={i < 3 ? "eager" : "lazy"}
                priority={i < 2}
                className="block w-full h-full object-cover object-top"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   REACCIÓN REAL (Juanjo + Karina)
   ================================================================ */
function ReaccionReal() {
  return (
    <section className="px-4 md:px-8 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
          Lo que pasa cuando la escuchan
        </p>
        <h2 className="h-section text-[32px] md:text-[44px] max-w-2xl text-cream">
          Juanjo se la mandó a Karina.<br />Esto fue lo que le respondió.
        </h2>

        <div className="grid md:grid-cols-5 gap-8 md:gap-10 items-center mt-10">
          <div className="md:col-span-3">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#1C1418",
                boxShadow: "0 30px 80px -20px rgba(0,0,0,.6)",
              }}
            >
              {/* Reemplazá por una captura real si tenés */}
              <Image
                src="/testimonios/07-saltar-de-felicidad.webp"
                alt="Juanjo recibió el mensaje de Karina después de mandarle su canción"
                width={540}
                height={1170}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="font-hand text-rose text-[26px] leading-tight mb-4">
              &ldquo;Me hicieron saltar de felicidad a&nbsp;ambos.&rdquo;
            </p>
            <p className="text-[15px] text-cream-dim leading-relaxed mb-5">
              Juanjo quería sorprender a Karina en su aniversario. Nos contó cómo se conocieron, el apodo que ella le pone, los momentos que lo definen. Eligió balada romántica, voz masculina. En menos de un minuto le llegó el adelanto. La pagó, se la mandó.
            </p>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-cream flex items-center justify-center font-serif text-ebony font-semibold">
                J
              </span>
              <div>
                <p className="text-[14px] text-cream font-medium m-0">Juanjo</p>
                <p className="text-[12px] text-cream-faint m-0">Buenos Aires · septiembre 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   CÓMO FUNCIONA
   ================================================================ */
function ComoFunciona() {
  return (
    <section id="como" className="px-4 md:px-8 py-16 mls-section-alt">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 md:mb-14 max-w-xl">
          <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
            Cómo funciona
          </p>
          <h2 className="h-section text-[32px] md:text-[48px] text-cream">
            Tres pantallas,<br />un minuto,<br />y ya la tenés.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          <Paso
            n="1"
            titulo="Contás su historia"
            body="Su nombre, la ocasión, qué los une. Si tenés un apodo, un recuerdo, un lugar de ustedes dos, lo ponés también. Dura 2 minutos. En el celular, sin registro."
          />
          <Paso
            n="2"
            titulo="Escuchás el adelanto gratis"
            body="En menos de un minuto llega a tu pantalla un fragmento de 30 segundos con su nombre cantado adentro. Sin costo. Si no te mueve nada, no pagás."
          />
          <Paso
            n="3"
            titulo="Pagás y la mandás"
            body={`Si te emociona, pagás ${PRECIO_LABEL} por Mercado Pago y recibís las 2 versiones completas en MP3 más un link para compartir. Todo en el mismo minuto.`}
          />
        </div>
      </div>
    </section>
  );
}

function Paso({ n, titulo, body }: { n: string; titulo: string; body: string }) {
  return (
    <div className="pt-2">
      <span className="font-serif text-[60px] font-semibold text-gold2 opacity-90 block leading-none mb-3">
        {n}
      </span>
      <h3 className="font-serif text-[22px] font-semibold text-cream mb-2.5">{titulo}</h3>
      <p className="text-[14.5px] text-cream-dim leading-relaxed m-0">{body}</p>
    </div>
  );
}

/* ================================================================
   EXPERTO (productor musical)
   ================================================================ */
function Experto() {
  return (
    <section className="px-4 md:px-8 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4 text-center">
          Validado por profesionales
        </p>
        <div
          className="rounded-[20px] p-6 md:p-7 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-5 md:gap-7 items-center"
          style={{ background: "#1C1418", border: "1px solid rgba(245,232,207,.1)" }}
        >
          <div
            className="w-[120px] h-[120px] rounded-full flex items-center justify-center font-serif text-[48px] font-bold text-ebony mx-auto"
            style={{ background: "linear-gradient(145deg,#D4A74A,#F0416C)" }}
          >
            MR
          </div>
          <div>
            <p className="font-serif text-[20px] font-semibold text-cream mb-1 m-0">
              Martín Rossi
            </p>
            <p className="text-[13px] text-gold2 font-semibold mb-1 m-0">
              Productor musical
            </p>
            <p className="text-[12px] text-cream-faint mb-3 m-0">
              15 años en estudios de grabación · Capital Federal
            </p>
            <p className="text-[14.5px] text-cream-dim leading-relaxed italic m-0">
              <span className="text-rose font-serif text-[22px] mr-1">&ldquo;</span>
              La IA generativa cambió completamente qué significa &ldquo;regalar una canción&rdquo;. Lo que antes requería un estudio y días de trabajo hoy sale en un minuto, con voz cantada real y nivel de producción decente. Melody Lab lo hace bien: la letra está bien construida, la voz suena natural y la música acompaña la historia.
              <span className="text-rose font-serif text-[22px] ml-0.5">&rdquo;</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   TESTIMONIOS
   ================================================================ */
function Testimonios() {
  return (
    <section className="px-4 md:px-8 py-16 mls-section-alt">
      <div className="mx-auto max-w-5xl">
        <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
          Lo que dicen
        </p>
        <h2 className="h-section text-[32px] md:text-[44px] text-cream">
          500+ regalos entregados.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-9">
          {TESTIMONIOS.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-5"
              style={{ background: "#1C1418", border: "1px solid rgba(245,232,207,.08)" }}
            >
              <div className="flex items-center gap-3 mb-3.5">
                <span className="h-11 w-11 rounded-full bg-gold2 text-ebony flex items-center justify-center font-serif font-bold text-[18px] flex-none">
                  {t.initial}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-cream font-semibold mb-0.5 m-0">{t.name}</p>
                  <StarRow count={5} size={12} />
                </div>
              </div>
              <h3 className="font-serif text-[16px] font-semibold text-cream mb-2 leading-tight">
                {t.title}
              </h3>
              <p className="text-[14px] text-cream-dim leading-relaxed m-0">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   FAQ
   ================================================================ */
function FAQ() {
  return (
    <section className="px-4 md:px-8 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
          Preguntas
        </p>
        <h2 className="h-section text-[32px] md:text-[44px] text-cream">
          Lo que todos preguntan.
        </h2>
        <div className="mt-8 border-t border-cream/10">
          {FAQS.map((f, i) => (
            <details key={i} className="mls-faq border-b border-cream/10">
              <summary className="flex justify-between items-center gap-3 py-4 cursor-pointer list-none">
                <h3 className="text-[15.5px] font-semibold text-cream m-0">{f.q}</h3>
                <svg className="mls-caret w-3.5 h-3.5 text-gold2 flex-none" viewBox="0 0 10 6" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
                  />
                </svg>
              </summary>
              <div className="pb-5 text-[14.5px] text-cream-dim leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   MEDIA TICKER (logos de medios)
   ================================================================ */
function MediaTicker() {
  const media = ["LA NACIÓN", "Clarín", "Infobae", "TN", "C5N", "Página/12", "iProfesional", "Perfil"];
  const repeated = Array(4).fill(media).flat();
  return (
    <div className="py-8 overflow-hidden">
      <p className="text-center text-[11px] font-bold tracking-[1.5px] uppercase text-cream-faint mb-5">
        Visto en medios de comunicación
      </p>
      <div className="mls-mask-h overflow-hidden">
        <div className="mls-media-track flex items-center gap-[60px] w-max">
          {repeated.map((m, i) => (
            <span
              key={i}
              className="font-serif text-[22px] font-bold text-cream opacity-30 hover:opacity-80 transition tracking-wide whitespace-nowrap"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   FINAL CTA
   ================================================================ */
function FinalCTA() {
  return (
    <section className="px-4 md:px-8 py-20 text-center">
      <div className="mx-auto max-w-xl">
        <h2 className="h-section text-[32px] md:text-[40px] text-cream mb-4">
          Hacé que escuche<br />su nombre cantado.
        </h2>
        <p className="text-[16px] text-cream-dim mb-7">
          Adelanto gratis. Pagás solo si te emociona.
        </p>
        <Link
          href="/crear"
          onClick={trackClickCrear}
          className="pulse-cta inline-flex items-center justify-center gap-2 bg-rose hover:bg-rose-deep text-white font-semibold text-[17px] px-7 py-4 rounded-full transition"
        >
          Empezar mi canción gratis
          <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

/* ================================================================
   FOOTER
   ================================================================ */
function Footer() {
  return (
    <footer className="py-10 border-t border-cream/10 mls-section-alt">
      <div className="mx-auto max-w-6xl px-4 md:px-8 text-center">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <span
            className="inline-block h-6 w-6 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #D4A74A 0%, #D4A74A 30%, #0E0A0C 32%, #0E0A0C 46%, #231A1E 48%, #231A1E 100%)",
            }}
          />
          <span className="font-serif text-[15px] text-cream">Melody Lab Studio</span>
        </div>
        <p className="text-[12px] text-cream-faint m-0">
          © 2026 Melody Lab Studio · <a href="#" className="text-gold2">Términos</a> ·{" "}
          <a href="#" className="text-gold2">Privacidad</a> ·{" "}
          <a href={WHATSAPP_URL} onClick={trackClickWhatsapp} target="_blank" rel="noopener noreferrer" className="text-gold2">
            WhatsApp
          </a>
        </p>
      </div>
    </footer>
  );
}

/* ================================================================
   TOAST DE COMPRADORES (flotante abajo izquierda)
   ================================================================ */
function BuyerToast() {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const [current, setCurrent] = useState({ name: "Graciela", city: "Buenos Aires" });

  useEffect(() => {
    if (closed) return;
    const pick = () => COMPRADORES[Math.floor(Math.random() * COMPRADORES.length)];
    const show = () => {
      setCurrent(pick());
      setVisible(true);
      setTimeout(() => setVisible(false), 4500);
    };
    const first = setTimeout(show, 3500);
    const interval = setInterval(show, 13000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [closed]);

  if (closed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mls-toast fixed z-[100] flex items-center gap-2.5 px-3.5 py-3 rounded-xl max-w-[300px] ${
        visible ? "show" : ""
      }`}
      style={{
        bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        left: "20px",
        background: "rgba(28,20,24,.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(245,232,207,.12)",
        boxShadow: "0 20px 50px rgba(0,0,0,.5)",
      }}
    >
      <span className="w-[38px] h-[38px] rounded-full bg-gold2 text-ebony flex items-center justify-center font-serif font-bold text-[16px] flex-none">
        {current.name.charAt(0)}
      </span>
      <div className="flex flex-col gap-px min-w-0 text-[12px]">
        <span className="text-cream font-semibold">{current.name}</span>
        <span className="text-cream-faint text-[11px]">{current.city}</span>
        <span className="text-rose text-[11px] font-semibold mt-0.5">
          pidió su canción · hace unos segundos
        </span>
      </div>
      <button
        aria-label="Cerrar notificación"
        onClick={() => setClosed(true)}
        className="bg-transparent border-0 text-cream-faint p-1 text-[18px] leading-none cursor-pointer"
      >
        ×
      </button>
    </div>
  );
}

/* ================================================================
   WHATSAPP FLOTANTE
   ================================================================ */
function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_URL}
      onClick={trackClickWhatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      aria-label="Hablar por WhatsApp"
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 3.5A11.8 11.8 0 0 0 2.1 18.5L1 23l4.6-1.1A11.8 11.8 0 1 0 20 3.5zM12 20.3a8.3 8.3 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.3-.8-.7-1.4-1.7-1.5-2-.2-.3 0-.4.1-.5l.4-.4c.1-.1.2-.3.3-.4 0-.2 0-.3-.1-.4 0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4s-.9.9-.9 2.2.9 2.6 1 2.7c.1.2 1.7 2.7 4.2 3.7 2.5 1 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.1-.5-.2z" />
      </svg>
      <span className="hidden sm:inline text-[14px] font-semibold">¿Dudas?</span>
    </a>
  );
}

/* ================================================================
   ÍCONOS Y UTILIDADES
   ================================================================ */
function StarIcon({ size = 14, fill = "#D4A74A" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
    </svg>
  );
}

function StarRow({ count = 5, size = 16 }: { count?: number; size?: number }) {
  return (
    <span className="flex items-center gap-px">
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} size={size} />
      ))}
    </span>
  );
}

function ArrowRight() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckGreen() {
  return (
    <svg className="w-[22px] h-[22px] flex-none mt-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#35e897" opacity=".15" />
      <circle cx="12" cy="12" r="9" fill="#35e897" />
      <path d="M8 12l3 3 5-6" stroke="#0E0A0C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MPIcon() {
  return (
    <svg className="w-4 h-3 inline-block" viewBox="0 0 24 18" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="17" rx="3" fill="#00B1EA" stroke="rgba(255,255,255,.2)" />
      <circle cx="8" cy="9" r="4" fill="#FFD700" />
      <circle cx="16" cy="9" r="4" fill="#FFD700" opacity=".7" />
    </svg>
  );
}
