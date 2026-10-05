"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PRECIO_LABEL } from "@/lib/config";

/* ============ TRACKING META PIXEL ============ */
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
function trackClickInstagram() {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("trackCustom", "FollowInstagram");
  }
}
function trackClickCompartir() {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("trackCustom", "CompartirLanding");
  }
}

/* ============ CONFIG CONTACTO ============ */
const WHATSAPP_NUM = "5491166382852";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(
  "Hola, tengo una duda antes de pedir mi canción"
)}`;
const COMPARTIR_URL = `https://wa.me/?text=${encodeURIComponent(
  "Mirá esto que encontré, hacen canciones personalizadas con tu historia: https://www.melodylabstudio.site"
)}`;

export default function Home() {
  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-paper/90 border-b border-ink/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-xl md:text-2xl font-serif font-medium text-ink tracking-titulo">
            <svg className="h-7 w-7 text-gold" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 10v10a2 2 0 1 1-2-2h2M20 10h-6v3h6M20 10v6a2 2 0 1 1-2-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Melody Lab <span className="text-ink-dim">Studio</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[15px] text-ink-soft">
            <a href="#escuchar" className="hover:text-ink">Escuchar un ejemplo</a>
            <a href="#reacciones" className="hover:text-ink">Reacciones</a>
            <a href="#preguntas" className="hover:text-ink">Preguntas</a>
          </div>
          <div className="flex items-center gap-2">
            <a href={WHATSAPP_URL} onClick={trackClickWhatsapp} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/60 px-3 py-2 text-[14px] text-ink hover:border-ink/30">
              <WhatsappIcon className="h-4 w-4 text-[#25D366]" />
              WhatsApp
            </a>
            <Link href="/crear" onClick={trackClickCrear} className="inline-flex items-center gap-1.5 rounded-full bg-ink text-paper px-4 py-2.5 text-[14px] font-medium hover:bg-ink-soft">
              Crear canción
            </Link>
          </div>
        </div>
      </nav>

      <main id="top">
        {/* HERO */}
        <section className="pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="mx-auto max-w-6xl px-5 md:px-8 grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-3">
              <p className="inline-flex items-center gap-2 text-[13.5px] text-ink-dim mb-7">
                <span className="h-px w-8 bg-gold" />
                Melody Lab Studio
              </p>
              <h1 className="font-serif font-normal text-ink tracking-titulo text-[42px] sm:text-[54px] lg:text-[68px] leading-[0.98]">
                Su historia,<br />
                hecha canción.
              </h1>
              <p className="mt-7 max-w-lectura text-ink-soft text-[19px] md:text-[20px] leading-relaxed">
                Vos nos contás quién es y qué los une. Nosotros componemos una canción única para esa persona, con su nombre cantado adentro y los recuerdos que te hacen pensar en ella.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-5">
                <Link href="/crear" onClick={trackClickCrear} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-paper px-7 py-4 text-[17px] font-medium hover:bg-ink-soft transition">
                  Empezar mi canción
                </Link>
                <div className="text-[15px] text-ink-dim leading-snug">
                  Escuchás un adelanto gratis.<br className="hidden sm:block" />
                  Pagás solo si te emociona — <span className="text-ink">{PRECIO_LABEL}</span>.
                </div>
              </div>

              {/* Badge Mercado Pago bajo CTA */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/60 border border-ink/10 px-4 py-2 text-[13.5px] text-ink-soft">
                <svg className="h-4 w-4 text-[#009EE3]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6c0 5.5 3.4 10.4 8 11.5 4.6-1.1 8-6 8-11.5V5l-8-3zm3.5 10.5l-5 5-2.5-2.5 1.4-1.4 1.1 1.1 3.6-3.6 1.4 1.4z"/></svg>
                Pago protegido con <strong className="text-ink font-medium">Mercado Pago</strong>
              </div>

              <p className="mt-10 font-hand text-[22px] md:text-[24px] text-gold-deep leading-tight max-w-md">
                &ldquo;Me hicieron saltar de felicidad a&nbsp;ambos.&rdquo;
                <span className="block text-[15px] font-sans text-ink-dim mt-1 not-italic">— Juanjo, cliente real · agosto 2026</span>
              </p>
            </div>
            <div className="lg:col-span-2">
              <PlayerCassette />
              <p className="mt-5 font-hand text-[20px] text-ink-dim text-center">Dale play ↗</p>
            </div>
          </div>
        </section>

        {/* FRANJA PRUEBA SOCIAL */}
        <section className="border-y border-ink/10 bg-paper-warm/70">
          <div className="mx-auto max-w-6xl px-5 md:px-8 py-6 md:py-7 flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <Inicial letra="R" bg="bg-gold/30" />
                <Inicial letra="M" bg="bg-lacre/20" />
                <Inicial letra="N" bg="bg-ink/10" />
                <Inicial letra="J" bg="bg-gold-soft/40" />
              </div>
              <div className="text-[15px] text-ink-soft">
                <strong className="text-ink font-medium">Rosita, Marta, Nuria y Juanjo</strong> ya recibieron la suya.
              </div>
            </div>
            <div className="flex items-center gap-5 text-[14px] text-ink-dim">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
              </div>
              {/* 🔧 CAMBIÁ EL NÚMERO POR TU TOTAL REAL DE CANCIONES ENTREGADAS */}
              <span>Más de <strong className="text-ink">500 canciones</strong> entregadas</span>
            </div>
          </div>
        </section>

        {/* EJEMPLO JUANJO */}
        <section id="escuchar" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mb-10 md:mb-14 max-w-2xl">
              <p className="text-[13px] text-gold-deep font-medium mb-3">Un ejemplo real</p>
              <h2 className="font-serif text-ink tracking-titulo text-[36px] md:text-[48px] leading-[1.02]">
                Así quedó la canción que Juanjo le hizo a Karina.
              </h2>
            </div>
            <div className="grid md:grid-cols-5 gap-10 md:gap-12 items-start">
              <div className="md:col-span-3">
                <p className="text-ink-soft text-[18px] leading-relaxed mb-5">
                  Juanjo quería sorprender a su esposa Karina en su aniversario. Nos contó cómo se conocieron, el apodo que ella le pone, los momentos que lo definen a él como pareja. Eligió balada, voz masculina.
                </p>
                <p className="text-ink-soft text-[18px] leading-relaxed mb-6">
                  En menos de un minuto le llegó el adelanto. La escuchó, la pagó, se la mandó a Karina. Esto fue lo que nos escribió después:
                </p>
                <PlayerDemoSmall />
              </div>
              <div className="md:col-span-2">
                <Polaroid src="/testimonios/hero_juanjo.jpg" rot="r-2" cita='"Gracias, es una genialidad"' pie="Juanjo · Buenos Aires" big />
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como" className="py-20 md:py-24 bg-paper-warm/50 border-y border-ink/10">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mb-14 md:mb-16 max-w-2xl">
              <h2 className="font-serif text-ink tracking-titulo text-[36px] md:text-[48px] leading-[1.02]">
                En un minuto está en tus manos.
              </h2>
              <p className="mt-4 text-ink-soft text-[18px] max-w-lectura">
                Nada de esperas, nada de ida y vuelta por mensajes. Vos contás, nosotros componemos, vos escuchás.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10 md:gap-14">
              <Step n="1" titulo="Primero: nos contás su historia." body="Su nombre, la ocasión, qué los une a ustedes, el recuerdo que te vino a la cabeza. Un formulario corto, en el celular, sin registrarte en nada." />
              <Step n="2" titulo="Después: la compone el estudio." body="En menos de un minuto generamos dos versiones distintas de la canción, con la letra personalizada y su nombre cantado adentro." />
              <Step n="3" titulo="Al final: escuchás y decidís." body={`Te llega el adelanto de 30 segundos. Si te emociona, desbloqueás la canción completa por ${PRECIO_LABEL} y la descargás para compartir por WhatsApp.`} />
            </div>
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <span className="font-hand text-[26px] text-lacre">Todo esto</span>
              <span className="font-serif text-[42px] md:text-[52px] text-ink leading-none">en 1 minuto.</span>
              <span className="font-hand text-[20px] text-ink-dim">— sin exagerar</span>
            </div>
          </div>
        </section>

        {/* REACCIONES */}
        <section id="reacciones" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mb-14 md:mb-16 max-w-3xl">
              <p className="text-[13px] text-gold-deep font-medium mb-3">Lo que nos escriben</p>
              <h2 className="font-serif text-ink tracking-titulo text-[36px] md:text-[52px] leading-[1.02]">
                Mensajes reales que recibimos por WhatsApp.
              </h2>
              <p className="mt-5 text-ink-soft text-[18px] max-w-lectura">
                Sin filtros, sin editar, sin pedir nada a cambio. Son las capturas tal cual nos llegaron, con permiso de cada cliente para publicarlas. Tapamos solo el número de teléfono para cuidarlos.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {reacciones.map((r) => <Polaroid key={r.src} {...r} />)}
            </div>

            {/* COMPARTIR CON ALGUIEN */}
            <div className="mt-16 rounded-2xl bg-paper-warm/60 border border-ink/10 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <p className="font-serif text-[22px] md:text-[24px] text-ink leading-tight">
                  ¿Conocés a alguien a quien esto le haría bien?
                </p>
                <p className="text-[15px] text-ink-dim mt-1">Mandale el link por WhatsApp, le va a encantar.</p>
              </div>
              <a href={COMPARTIR_URL} onClick={trackClickCompartir} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-5 py-3 text-[15px] font-medium hover:bg-[#20BD5A] whitespace-nowrap">
                <WhatsappIcon className="h-5 w-5" />
                Compartir por WhatsApp
              </a>
            </div>

            <div className="mt-10 text-center">
              <a href="https://www.instagram.com/melody.labstudio/" target="_blank" rel="noopener noreferrer" onClick={trackClickInstagram} className="inline-flex items-center gap-2 text-[15px] text-ink-dim hover:text-ink">
                Mirá más reacciones en Instagram
                <InstagramIcon />
              </a>
            </div>
          </div>
        </section>

        {/* VUELVEN A PEDIRNOS */}
        <section className="py-20 md:py-28 border-t border-ink/10" style={{ background: "linear-gradient(180deg, #F7F0DC 0%, #F2E8CF 100%)" }}>
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <p className="font-hand text-[26px] text-lacre mb-3">La prueba más honesta.</p>
              <h2 className="font-serif text-ink tracking-titulo text-[36px] md:text-[52px] leading-[1.02]">
                Casi todos vuelven a pedirnos otra, para alguien más de la familia.
              </h2>
              <p className="mt-5 text-ink-soft text-[18px]">
                No lo pedimos ni lo buscamos. Lo escriben ellos, mientras todavía están escuchando la primera. Mirá:
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {vuelven.map((r) => <Polaroid key={r.src} {...r} />)}
            </div>
          </div>
        </section>

        {/* OCASIONES */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mb-14 max-w-2xl">
              <h2 className="font-serif text-ink tracking-titulo text-[36px] md:text-[48px] leading-[1.02]">
                ¿Para qué momento la querés?
              </h2>
              <p className="mt-4 text-ink-soft text-[18px]">
                El tono y la letra se ajustan a la ocasión. Elegís vos al empezar.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {ocasiones.map((o) => (
                <div key={o.titulo} className="rounded-xl p-5 bg-paper-warm/40 border border-ink/10 hover:border-gold/50 transition">
                  <div className="text-gold-deep mb-3">{o.icon}</div>
                  <p className="font-serif text-[20px] text-ink leading-tight">{o.titulo}</p>
                  <p className="mt-1 text-[14px] text-ink-dim">{o.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POR QUÉ PODÉS CONFIAR + GARANTÍA (bloque fusionado) */}
        <section className="py-20 md:py-28 border-y border-ink/10" style={{ background: "linear-gradient(180deg, #EBDFC0 0%, #F2E8CF 100%)" }}>
          <div className="mx-auto max-w-6xl px-5 md:px-8">

            <div className="text-center mb-14 max-w-2xl mx-auto">
              <p className="text-[13px] text-gold-deep font-medium mb-3">Por qué podés confiar</p>
              <h2 className="font-serif text-ink tracking-titulo text-[36px] md:text-[48px] leading-[1.02]">
                Esto no es una ruleta.<br />Es una compra segura.
              </h2>
            </div>

            {/* 4 pilares de confianza */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-16">
              <PilarConfianza
                icon={<MPIcon />}
                titulo="Pagás con Mercado Pago"
                body="La misma plataforma que usás en Mercado Libre. Si algo sale mal, estás cubierto por su programa de comprador protegido."
              />
              <PilarConfianza
                icon={<ClockIcon />}
                titulo="En 1 minuto o devolución"
                body="Si pasa el minuto y no te llegó el adelanto por email, te devolvemos cualquier pago sin preguntas."
              />
              <PilarConfianza
                icon={<ShieldIcon />}
                titulo="7 días de garantía"
                body="Después de pagar, tenés una semana para pedirnos la devolución del dinero si no estás conforme."
              />
              <PilarConfianza
                icon={<WhatsappIcon className="h-7 w-7 text-[#25D366]" />}
                titulo="Hablás con una persona"
                body="Al WhatsApp te contestamos nosotros, no un bot. Antes, durante o después de la compra."
              />
            </div>

            {/* Garantía principal */}
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="font-serif text-ink tracking-titulo text-[28px] md:text-[36px] leading-[1.1]">
                Si no te emociona cuando la escuchás, no pagás.
              </h3>
              <p className="mt-4 text-ink-soft text-[17px] max-w-xl mx-auto">
                Primero recibís el adelanto gratis. Si no te convence, lo cerrás y listo — no cobramos nada.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link href="/crear" onClick={trackClickCrear} className="inline-flex items-center justify-center rounded-full bg-ink text-paper px-7 py-4 text-[17px] font-medium hover:bg-ink-soft">
                  Empezar sin pagar nada
                </Link>
                <span className="text-[15px] text-ink-dim">Toma 2 minutos armar el pedido</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="preguntas" className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <h2 className="font-serif text-ink tracking-titulo text-[36px] md:text-[48px] leading-[1.02] mb-12">
              Las dudas que nos escriben.
            </h2>
            <div className="divide-y divide-ink/10">
              {faqs.map((f) => (
                <details key={f.q} className="group py-6">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 text-[18px] md:text-[19px] text-ink list-none">
                    {f.q}
                    <span className="text-gold-deep transition group-open:rotate-45 flex-shrink-0">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-ink-soft text-[17px] leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24 md:py-32 bg-ink text-paper relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
          <div className="relative mx-auto max-w-4xl px-5 md:px-8 text-center">
            <p className="font-hand text-[26px] text-gold-soft mb-5">La última cosa que te queremos decir.</p>
            <h2 className="font-serif text-paper tracking-titulo text-[36px] md:text-[56px] leading-[1.02]">
              Esa persona merece que, por una vez, le regales algo que no se olvide.
            </h2>
            <p className="mt-7 text-paper/70 text-[18px] max-w-xl mx-auto">
              Dos minutos armando el pedido, un minuto esperando, y una canción con su nombre que va a escuchar mil veces.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/crear" onClick={trackClickCrear} className="inline-flex items-center justify-center rounded-full bg-gold text-ink px-8 py-4 text-[17px] font-medium hover:bg-gold-soft">
                Empezar mi canción
              </Link>
              <span className="text-[15px] text-paper/60">Adelanto gratis · solo pagás si te emociona</span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-14 bg-paper-deep border-t border-ink/10">
          <div className="mx-auto max-w-6xl px-5 md:px-8 grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <svg className="h-6 w-6 text-gold-deep" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 10v10a2 2 0 1 1-2-2h2M20 10h-6v3h6M20 10v6a2 2 0 1 1-2-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-serif text-[20px] text-ink">Melody Lab Studio</span>
              </div>
              <p className="text-[14px] text-ink-dim max-w-xs leading-relaxed">
                Canciones compuestas especialmente para esa persona. Un regalo pensado, grabado y entregado en menos de un minuto.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-[12.5px] text-ink-dim">
                <svg className="h-4 w-4 text-[#009EE3]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6c0 5.5 3.4 10.4 8 11.5 4.6-1.1 8-6 8-11.5V5l-8-3zm3.5 10.5l-5 5-2.5-2.5 1.4-1.4 1.1 1.1 3.6-3.6 1.4 1.4z"/></svg>
                Pago protegido con Mercado Pago
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink mb-3">Navegación</p>
              <ul className="space-y-2 text-[14px] text-ink-dim">
                <li><a href="#escuchar" className="hover:text-ink">Escuchar un ejemplo</a></li>
                <li><a href="#como" className="hover:text-ink">Cómo funciona</a></li>
                <li><a href="#reacciones" className="hover:text-ink">Reacciones</a></li>
                <li><a href="#preguntas" className="hover:text-ink">Preguntas</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink mb-3">Contacto</p>
              <ul className="space-y-2 text-[14px] text-ink-dim">
                <li><a href="mailto:hola@melodylabstudio.site" className="hover:text-ink">hola@melodylabstudio.site</a></li>
                <li><a href={WHATSAPP_URL} onClick={trackClickWhatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-ink">WhatsApp: +54 9 11 6638-2852</a></li>
                <li><a href="https://www.instagram.com/melody.labstudio/" target="_blank" rel="noopener noreferrer" onClick={trackClickInstagram} className="hover:text-ink">@melody.labstudio</a></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-5 md:px-8 mt-10 pt-6 border-t border-ink/10 text-[12px] text-ink-faint">
            Las canciones son generadas con el software profesional de música Google Lyria con marca de agua SynthID. No representan a artistas reales. © {new Date().getFullYear()} Melody Lab Studio.
          </div>
        </footer>
      </main>

      {/* BOTÓN FLOTANTE WHATSAPP */}
      <a href={WHATSAPP_URL} onClick={trackClickWhatsapp} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-50 flex items-center gap-2.5 rounded-full bg-[#25D366] text-white pl-4 pr-5 py-3 shadow-[0_6px_30px_-5px_rgba(37,211,102,0.5)] hover:bg-[#20BD5A] transition">
        <WhatsappIcon className="h-6 w-6" />
        <span className="hidden sm:inline text-[15px] font-medium">Hablar por WhatsApp</span>
      </a>

      {/* POP-UP DE PRUEBA SOCIAL RECIENTE */}
      <PopupPruebaSocial />
    </>
  );
}

/* ============ DATA ============ */

const reacciones = [
  { src: "/testimonios/grid_mabel.jpg", rot: "r-1", cita: '"HERMOSO ME HICISTE"', pie: "Mabel · Corrientes" },
  { src: "/testimonios/grid_dios.jpg", rot: "r-2", cita: '"Dios los bendiga"', pie: "Mariana · Tucumán" },
  { src: "/testimonios/grid_marcelo.jpg", rot: "r-3", cita: '"La verdad me emocioné"', pie: "Marcelo · Tucumán" },
  { src: "/testimonios/grid_rosita.jpg", rot: "r-4", cita: '"Quedaron re lindas"', pie: "Rosita · Santa Fe" },
  { src: "/testimonios/grid_nuria.jpg", rot: "r-5", cita: '"Muyy biennn!!!"', pie: "Nuria · Buenos Aires" },
  { src: "/testimonios/grid_abuela.jpg", rot: "r-6", cita: '"Hermoso, gracias"', pie: "Karina · Buenos Aires" },
  { src: "/testimonios/grid_modif.jpg", rot: "r-1", cita: '"Me encanta, gracias por la modificación"', pie: "Clienta · Mar del Plata" },
  { src: "/testimonios/grid_espectacular.jpg", rot: "r-3", cita: '"Espectacular, felicitaciones"', pie: "Cliente · Buenos Aires" },
];

const vuelven = [
  { src: "/testimonios/vuelve_hija.jpg", rot: "r-2", cita: '"Haces otra xfa"', pie: "Para el cumple de la hija" },
  { src: "/testimonios/vuelve_ahijada.jpg", rot: "r-4", cita: '"Quiero pagarte una más"', pie: "Para la ahijada" },
  { src: "/testimonios/vuelve_hermanos.jpg", rot: "r-1", cita: '"Una para mis hermanos"', pie: "Dedicatoria familiar" },
  { src: "/testimonios/vuelve_finmes.jpg", rot: "r-3", cita: '"El fin que cobro te pido otra"', pie: "Cliente volviendo" },
];

const ocasiones = [
  { titulo: "Aniversario", sub: "El día que se conocieron, cantado.", icon: <IconHeart /> },
  { titulo: "Cumpleaños", sub: "Con su nombre, no el genérico.", icon: <IconCake /> },
  { titulo: "Nacimiento", sub: "La primera canción de su vida.", icon: <IconStar /> },
  { titulo: "Boda", sub: "Su historia en tres minutos.", icon: <IconRing /> },
  { titulo: "Homenaje", sub: "Para recordar a quien ya no está.", icon: <IconMoon /> },
  { titulo: "Pedir perdón", sub: "Cuando las palabras no alcanzan.", icon: <IconHand /> },
  { titulo: "Amistad", sub: "Para esa amiga que es familia.", icon: <IconClink /> },
  { titulo: "Solo porque sí", sub: "El mejor motivo que existe.", icon: <IconSpark /> },
];

const faqs = [
  { q: "¿En cuánto tiempo llega?", a: "En menos de un minuto el sistema te genera el adelanto y te lo manda por email. La canción completa se desbloquea apenas pagás." },
  { q: "¿Cómo pago? ¿Es seguro?", a: "Pagás con Mercado Pago (tarjeta de crédito, débito o dinero en cuenta). No manejamos tus datos de tarjeta, los procesa Mercado Pago igual que cualquier compra en Argentina. Tu compra está protegida por el programa de comprador protegido de Mercado Pago. Factura electrónica a pedido." },
  { q: "¿Puedo elegir el estilo musical y la voz?", a: "Sí. Elegís entre 12 estilos (balada, bolero, tango, folklore, cumbia, mariachi, vals, salsa, pop, rock nacional, reggaeton, música religiosa) o escribís vos uno distinto. La voz puede ser femenina o masculina — podés pedir las dos y quedarte con la que más te guste." },
  { q: "¿Y si no me gusta cómo quedó?", a: "Antes de pagar escuchás un adelanto de 30 segundos. Si no te emociona, no pagás nada. Y una vez pagada, tenés 7 días de garantía de devolución del dinero." },
  { q: "¿Cómo la comparto después?", a: "Descargás el archivo MP3 y lo mandás por WhatsApp, por mail, o lo ponés a sonar en el momento desde el celular. También podés descargar la letra para imprimirla si querés acompañar el regalo." },
  { q: "¿Es cantada por un cantante real?", a: "No. La voz la compone un software profesional de música (Google Lyria, el mismo que se usa en estudios reales). Es por eso que podemos entregarla en menos de un minuto y a este precio. La canción es original y única: no imita a nadie famoso ni se parece a otra canción existente." },
  { q: "Tengo otra duda, ¿cómo los contacto?", a: "Escribinos por WhatsApp al +54 9 11 6638-2852 (botón verde que está siempre abajo a la derecha de esta página), o al email hola@melodylabstudio.site. Te contestamos nosotros, no un bot." },
];

// Datos reales (nombres de clientes anteriores) para rotar en el pop-up
const popupData = [
  { nombre: "Silvia", ciudad: "Mendoza", relacion: "su mamá" },
  { nombre: "Celina", ciudad: "Buenos Aires", relacion: "su marido" },
  { nombre: "Marcelo", ciudad: "Tucumán", relacion: "su hijo" },
  { nombre: "Rosita", ciudad: "Santa Fe", relacion: "su hermana" },
  { nombre: "Mariana", ciudad: "Tucumán", relacion: "su papá" },
  { nombre: "Alicia", ciudad: "Mendoza", relacion: "su ahijada" },
  { nombre: "Nuria", ciudad: "Buenos Aires", relacion: "su pareja" },
  { nombre: "Juanjo", ciudad: "La Plata", relacion: "su esposa" },
  { nombre: "Mabel", ciudad: "Corrientes", relacion: "su hija" },
  { nombre: "Fernando", ciudad: "Córdoba", relacion: "su abuela" },
];

/* ============ COMPONENTES ============ */

function Polaroid({ src, rot, cita, pie, big }: { src: string; rot: string; cita: string; pie: string; big?: boolean }) {
  return (
    <div className={`polaroid ${rot} ${big ? "mx-auto max-w-[320px]" : ""}`}>
      <img src={src} alt={`Captura de WhatsApp — ${pie}`} loading="lazy" />
      <div className="pie">{cita}<small>{pie}</small></div>
    </div>
  );
}

function Step({ n, titulo, body }: { n: string; titulo: string; body: string }) {
  return (
    <div>
      <div className="h-14 w-14 rounded-full bg-ink text-paper flex items-center justify-center mb-5 font-serif text-[22px]">{n}</div>
      <h3 className="font-serif text-[26px] md:text-[28px] text-ink leading-tight mb-3">{titulo}</h3>
      <p className="text-ink-soft text-[17px] leading-relaxed">{body}</p>
    </div>
  );
}

function Inicial({ letra, bg }: { letra: string; bg: string }) {
  return (
    <span className={`h-9 w-9 rounded-full ${bg} flex items-center justify-center font-serif text-ink text-[14px] border border-ink/15`}>{letra}</span>
  );
}

function PilarConfianza({ icon, titulo, body }: { icon: React.ReactNode; titulo: string; body: string }) {
  return (
    <div className="bg-paper/70 rounded-xl p-5 border border-ink/10">
      <div className="mb-3">{icon}</div>
      <p className="font-serif text-ink text-[18px] leading-tight mb-2">{titulo}</p>
      <p className="text-[14px] text-ink-dim leading-relaxed">{body}</p>
    </div>
  );
}

function PopupPruebaSocial() {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    // Si ya lo cerró en esta sesión, no mostrarlo
    if (typeof window !== "undefined" && sessionStorage.getItem("popup_cerrado") === "1") {
      setCerrado(true);
      return;
    }
    // Primera aparición a los 15 segundos
    const t1 = setTimeout(() => {
      setIdx(Math.floor(Math.random() * popupData.length));
      setVisible(true);
    }, 15000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (cerrado) return;
    // Si ya se mostró, cambiar cada 25 segundos
    if (visible) {
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setIdx((i) => (i + 1) % popupData.length);
          setVisible(true);
        }, 1200);
      }, 7000); // visible 7 segundos
      return () => clearTimeout(t);
    }
  }, [visible, cerrado]);

  function cerrar() {
    setVisible(false);
    setCerrado(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("popup_cerrado", "1");
    }
  }

  if (cerrado || !visible) return null;

  const d = popupData[idx];
  const minutos = 2 + Math.floor(Math.random() * 25);

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-[320px] popup-enter">
      <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(31,24,16,0.3)] border border-ink/10 p-4 pr-9 relative">
        <button onClick={cerrar} aria-label="Cerrar" className="absolute top-2 right-2 text-ink-faint hover:text-ink p-1">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l10 10M15 5l-10 10" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 font-serif text-ink text-[15px]">
            {d.nombre[0]}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] text-ink leading-snug">
              <strong className="font-medium">{d.nombre}</strong> de {d.ciudad} pidió una canción para {d.relacion}
            </p>
            <p className="text-[12px] text-ink-dim mt-0.5">hace {minutos} min</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerCassette() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [barras] = useState(() => Array.from({ length: 42 }, () => 20 + Math.random() * 70));

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) { setPlaying((p) => !p); return; }
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().catch(() => {}); setPlaying(true); }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnd = () => setPlaying(false);
    audio.addEventListener("ended", onEnd);
    return () => audio.removeEventListener("ended", onEnd);
  }, []);

  return (
    <div className="cassette rounded-[20px] p-6 md:p-7 border border-ink/10 shadow-[0_2px_0_rgba(31,24,16,0.08),0_30px_60px_-20px_rgba(31,24,16,0.25)]">
      <audio ref={audioRef} src="/demo-primavera.mp3" preload="metadata" />
      <div className="flex items-center justify-between text-[12px] text-ink-dim uppercase tracking-wider mb-4">
        <span>Lado A · adelanto</span>
        <span>0:30</span>
      </div>
      <div className="aspect-square relative mb-5">
        <div className={`absolute inset-0 rounded-full border border-ink/15 ${playing ? "animar-girar" : ""}`} style={{ background: "radial-gradient(circle at center, #1F1810 0%, #1F1810 32%, #B8863E 32.5%, #B8863E 33.5%, #1F1810 34%, #1F1810 46%, #2A2015 46.5%, #2A2015 100%)" }}>
          <div className="absolute inset-[6%] rounded-full border border-ink/10" />
          <div className="absolute inset-[18%] rounded-full border border-ink/10" />
          <div className="absolute inset-[32%] rounded-full border border-gold/40" />
          <div className="absolute inset-[36%] rounded-full flex items-center justify-center flex-col text-center" style={{ background: "linear-gradient(135deg, #F7F0DC, #EBDFC0)" }}>
            <span className="font-serif text-ink text-[11px] leading-tight px-2">Para mamá,<br />en sus 70</span>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <p className="font-serif text-ink text-[18px] leading-tight">Para mamá, en sus 70</p>
        <p className="text-[13px] text-ink-dim">Estilo bolero · voz femenina</p>
      </div>
      <div className="h-10 flex items-center gap-[3px] mb-4">
        {barras.map((h, i) => (
          <span key={i} className="flex-1 rounded-full barra-onda" style={{ height: `${h}%`, minHeight: "3px", background: i < barras.length * 0.35 ? "#B8863E" : "rgba(31,24,16,0.25)", animationDelay: `${i * 0.04}s`, animationPlayState: playing ? "running" : "paused" }} />
        ))}
      </div>
      <div className="flex items-center justify-between gap-4">
        <button onClick={togglePlay} className="flex items-center gap-2.5 rounded-full bg-ink text-paper px-5 py-2.5 text-[15px] font-medium hover:bg-ink-soft">
          {playing ? (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3h4v14H5zM11 3h4v14h-4z" /></svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3l12 7-12 7V3z" /></svg>
          )}
          <span>{playing ? "Pausar" : "Escuchar"}</span>
        </button>
        <span className="text-[12px] text-ink-dim">Es un adelanto. La completa la desbloqueás si te emociona.</span>
      </div>
    </div>
  );
}

function PlayerDemoSmall() {
  return (
    <div className="cassette rounded-2xl p-6 max-w-md border border-ink/10">
      <div className="flex items-center justify-between text-[11px] text-ink-dim uppercase tracking-wider mb-3">
        <span>Karina te amo.mp3</span>
        <span>2.4 MB</span>
      </div>
      <div className="aspect-video rounded-lg flex items-center justify-center relative overflow-hidden mb-4" style={{ background: "linear-gradient(135deg, #1F1810 0%, #2A2015 50%, #1F1810 100%)" }}>
        <button className="h-14 w-14 rounded-full bg-gold text-ink flex items-center justify-center hover:bg-gold-soft">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3l12 7-12 7V3z" /></svg>
        </button>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "repeating-radial-gradient(circle at center, transparent 0, transparent 4px, rgba(184,134,62,0.3) 4px, rgba(184,134,62,0.3) 5px)" }} />
      </div>
      <p className="font-serif text-ink text-[17px] leading-tight">Para Karina, en nuestro aniversario</p>
      <p className="text-[13px] text-ink-dim mt-1">Balada · voz masculina · 3:04</p>
    </div>
  );
}

/* ============ ICONOS ============ */

function WhatsappIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20 3.5A11.8 11.8 0 0 0 2.1 18.5L1 23l4.6-1.1A11.8 11.8 0 1 0 20 3.5zM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-2.7.7.7-2.6-.2-.3A9 9 0 1 1 12 21zm5.1-6.7c-.3-.1-1.7-.8-1.9-.9s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.6.1a7.3 7.3 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5s-.6-1.5-.8-2-.5-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.5 4c.6.3 1.1.5 1.5.6a3.7 3.7 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z" /></svg>;
}
function StarIcon() { return <svg className="h-4 w-4 text-gold" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 6 6.4.5-4.9 4.4 1.5 6.4L10 15l-5.6 3.3L5.9 12 1 7.5 7.4 7 10 1z" /></svg>; }
function InstagramIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>; }
function MPIcon() { return <svg className="h-7 w-7 text-[#009EE3]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6c0 5.5 3.4 10.4 8 11.5 4.6-1.1 8-6 8-11.5V5l-8-3zm3.5 10.5l-5 5-2.5-2.5 1.4-1.4 1.1 1.1 3.6-3.6 1.4 1.4z"/></svg>; }
function ClockIcon() { return <svg className="h-7 w-7 text-gold-deep" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ShieldIcon() { return <svg className="h-7 w-7 text-lacre" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" strokeLinejoin="round"/><path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconHeart() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function IconCake() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20h16M5 20V13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M12 11V6M9 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function IconStar() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5 9.5 9 12 3z" strokeLinejoin="round" /></svg>; }
function IconRing() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="15" r="6" /><path d="M9 6l3-3 3 3-3 3-3-3z" strokeLinejoin="round" /></svg>; }
function IconMoon() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 15.5A8 8 0 0 1 8.5 4a8 8 0 1 0 11.5 11.5z" strokeLinejoin="round" /></svg>; }
function IconHand() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 11V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V6a1.5 1.5 0 0 1 3 0v9a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-4a1.5 1.5 0 0 1 3 0" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function IconClink() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 4l3 9-3 6M18 4l-3 9 3 6M9 13h6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function IconSpark() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" strokeLinecap="round" /></svg>; }
