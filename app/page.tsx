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
    <div className="home-dark min-h-screen">
      {/* NAV */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-md border-b border-cream/5"
        style={{
          background: "rgba(14,10,12,0.85)",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
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
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] text-cream-dim hover:text-cream px-3 py-1.5 rounded-full border border-cream/10"
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

      <main id="top">
        {/* HERO */}
        <section className="px-4 md:px-8 pt-6 md:pt-10 pb-8 md:pb-16">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-5 gap-10 lg:gap-14 items-center">
            {/* CASSETTE PLAYER - va primero en mobile */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              <PlayerCassette />
            </div>

            {/* TEXTO HERO */}
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
              <p className="mt-6 text-[17px] md:text-[18px] text-cream/80 leading-relaxed max-w-xl">
                Contanos quién es y qué los une. Nuestra IA compone una canción única con su nombre cantado adentro y los recuerdos que le pertenecen solo a ustedes dos.
              </p>

              {/* CTA principal */}
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

              {/* Mini garantías */}
              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-cream-dim">
                <span className="inline-flex items-center gap-1.5">
                  <MPIcon small />
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

        {/* FRANJA PRUEBA SOCIAL */}
        <section
          className="border-y py-4 md:py-5"
          style={{ background: "#150E11", borderColor: "rgba(245,232,207,0.08)" }}
        >
          <div className="mx-auto max-w-6xl px-4 md:px-8 flex items-center justify-center sm:justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <Inicial letra="R" style={{ background: "#D4A74A", border: "2px solid #0E0A0C", color: "#0E0A0C" }} />
                <Inicial letra="M" style={{ background: "#F0416C", border: "2px solid #0E0A0C", color: "#fff" }} />
                <Inicial letra="N" style={{ background: "#231A1E", border: "2px solid #0E0A0C", color: "#F5E8CF" }} />
                <Inicial letra="J" style={{ background: "#F5E8CF", border: "2px solid #0E0A0C", color: "#0E0A0C" }} />
              </div>
              <p className="text-[13px] text-cream-dim leading-tight">
                <strong className="text-cream font-medium">Rosita, Marta, Nuria y Juanjo</strong>
                <br />
                <span className="text-[12px]">regalaron la suya este mes</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-cream-dim">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              {/* 🔧 CAMBIÁ EL NÚMERO POR TU TOTAL REAL */}
              <span>
                Más de <strong className="text-cream">500 personas</strong> ya la regalaron
              </span>
            </div>
          </div>
        </section>

        {/* REACCIÓN REAL — captura grande de WhatsApp */}
        <section id="escuchar" className="py-16 md:py-24 px-4 md:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
              Lo que pasa cuando la escuchan
            </p>
            <h2 className="h-section text-[32px] md:text-[44px] mb-8 max-w-2xl text-cream">
              Juanjo se la mandó a Karina.<br />
              Esto fue lo que le respondió.
            </h2>

            <div className="grid md:grid-cols-5 gap-8 md:gap-10 items-center">
              {/* Captura real de WhatsApp */}
              <div className="md:col-span-3">
                <div className="rounded-2xl overflow-hidden shadow-2xl bg-ebony-card">
                  <img
                    src="/testimonios/hero_juanjo.jpg"
                    alt="Captura real de WhatsApp — Karina respondiendo a Juanjo"
                    className="block w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Testimonio al lado */}
              <div className="md:col-span-2">
                <p className="font-hand text-rose text-[26px] leading-tight mb-4">
                  &ldquo;Me hicieron saltar de felicidad a&nbsp;ambos.&rdquo;
                </p>
                <p className="text-[15px] text-cream-dim leading-relaxed mb-5">
                  Juanjo quería sorprender a Karina en su aniversario. Nos contó cómo se conocieron, el apodo que ella le pone, los momentos que lo definen. Eligió balada romántica, voz masculina. En menos de un minuto le llegó el adelanto. La pagó, se la mandó.
                </p>
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-cream flex items-center justify-center font-serif text-ebony">
                    J
                  </span>
                  <div>
                    <p className="text-[14px] text-cream font-medium">Juanjo</p>
                    <p className="text-[12px] text-cream-faint">Buenos Aires · agosto 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section
          id="como"
          className="py-16 md:py-24 px-4 md:px-8 border-y"
          style={{ background: "#150E11", borderColor: "rgba(245,232,207,0.08)" }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 md:mb-16 max-w-xl">
              <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
                Cómo funciona
              </p>
              <h2 className="h-section text-[32px] md:text-[48px] text-cream">
                Tres pantallas,<br />
                un minuto,<br />
                y ya la tenés.
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
                titulo="La compone el estudio"
                body="Google Lyria genera dos versiones distintas de la canción, cada una con la letra personalizada y su nombre cantado adentro. Menos de un minuto."
              />
              <Paso
                n="3"
                titulo="Escuchás y decidís"
                body={
                  <>
                    Te llega un adelanto de 30 segundos a tu email. Si te emociona, desbloqueás la canción completa por{" "}
                    <strong className="text-cream">{PRECIO_LABEL}</strong> y la descargás en MP3 para mandar por WhatsApp.
                  </>
                }
              />
            </div>

            <div className="mt-14 text-center">
              <Link
                href="/crear"
                onClick={trackClickCrear}
                className="inline-flex items-center gap-2 bg-rose hover:bg-rose-deep text-white font-semibold text-[16px] px-7 py-3.5 rounded-full transition"
              >
                Empezar sin pagar nada
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* REACCIONES REALES (grid de capturas) */}
        <section id="reacciones" className="py-16 md:py-24 px-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 md:mb-14 max-w-xl">
              <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
                Lo que nos escriben
              </p>
              <h2 className="h-section text-[32px] md:text-[48px] text-cream">
                Reacciones reales, por WhatsApp.
              </h2>
              <p className="mt-5 text-[16px] text-cream-dim">
                Son los mensajes tal cual nos llegaron. Sin editar, sin filtrar, con permiso de cada cliente. Tapamos solo el número.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {reacciones.map((r) => (
                <CapturaReaccion key={r.src} {...r} />
              ))}
            </div>

            {/* VUELVEN A PEDIR */}
            <div className="mt-16">
              <div className="mb-10 max-w-xl">
                <p className="font-hand text-rose text-[22px] mb-2">la prueba más honesta</p>
                <h3 className="h-section text-[26px] md:text-[36px] text-cream">
                  Casi todos vuelven a pedirnos otra, para alguien más de la familia.
                </h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {vuelven.map((r) => (
                  <CapturaReaccion key={r.src} {...r} compact />
                ))}
              </div>
            </div>

            {/* COMPARTIR + IG */}
            <div className="mt-14 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 bg-ebony-card border border-cream/10">
              <div>
                <p className="font-serif text-[20px] md:text-[22px] text-cream leading-tight">
                  ¿Conocés a alguien a quien esto le haría bien?
                </p>
                <p className="text-[14px] text-cream-dim mt-1">
                  Mandale el link por WhatsApp.
                </p>
              </div>
              <a
                href={COMPARTIR_URL}
                onClick={trackClickCompartir}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-wa text-white px-5 py-3 text-[14px] font-medium hover:brightness-110 whitespace-nowrap"
              >
                <WhatsappIcon className="h-5 w-5" />
                Compartir por WhatsApp
              </a>
            </div>

            <div className="mt-8 text-center">
              <a
                href="https://www.instagram.com/melody.labstudio/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackClickInstagram}
                className="inline-flex items-center gap-2 text-[14px] text-cream-dim hover:text-cream"
              >
                Mirá más reacciones en Instagram
                <InstagramIcon />
              </a>
            </div>
          </div>
        </section>

        {/* PRECIO - ANCLAJE DE VALOR */}
        <section
          className="py-16 md:py-24 px-4 md:px-8 border-y"
          style={{ background: "#150E11", borderColor: "rgba(245,232,207,0.08)" }}
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
              Lo que vale
            </p>
            <h2 className="h-section text-[32px] md:text-[48px] mb-10 text-cream">
              Menos que un ramo.<br />
              Dura toda la vida.
            </h2>

            <div className="grid grid-cols-3 gap-3 md:gap-5 mb-10 max-w-3xl mx-auto">
              <div className="rounded-xl p-4 md:p-5 opacity-60 bg-ebony-card border border-cream/10">
                <p className="text-[11px] text-cream-faint uppercase tracking-wider mb-2">
                  Un ramo
                </p>
                <p className="font-serif text-[22px] md:text-[32px] text-cream mb-1">$15.000</p>
                <p className="text-[11px] md:text-[12px] text-cream-faint">Dura 4 días</p>
              </div>
              <div className="rounded-xl p-4 md:p-5 opacity-60 bg-ebony-card border border-cream/10">
                <p className="text-[11px] text-cream-faint uppercase tracking-wider mb-2">
                  Chocolates
                </p>
                <p className="font-serif text-[22px] md:text-[32px] text-cream mb-1">$12.000</p>
                <p className="text-[11px] md:text-[12px] text-cream-faint">Dura 1 tarde</p>
              </div>
              <div
                className="rounded-xl p-5 md:p-6 relative"
                style={{ background: "linear-gradient(135deg, #F0416C 0%, #C32B52 100%)" }}
              >
                <p className="text-[11px] text-white/80 uppercase tracking-wider mb-2">
                  Esta canción
                </p>
                <p className="font-serif text-[26px] md:text-[36px] text-white mb-1 font-medium">
                  {PRECIO_LABEL}
                </p>
                <p className="text-[11px] md:text-[12px] text-white/90">Dura para siempre</p>
              </div>
            </div>

            <p className="text-[16px] text-cream-dim max-w-xl mx-auto leading-relaxed">
              La van a escuchar en el cumple. Al año siguiente. Cuando los extrañen. Cuando esté el nieto. Un ramo no hace eso.
            </p>

            <Link
              href="/crear"
              onClick={trackClickCrear}
              className="mt-9 inline-flex items-center gap-2 bg-rose hover:bg-rose-deep text-white font-semibold text-[16px] px-7 py-4 rounded-full transition"
            >
              Hacé la de esa persona ahora
              <ArrowRight />
            </Link>
          </div>
        </section>

        {/* GARANTÍAS */}
        <section className="py-16 md:py-24 px-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl mx-auto text-center">
              <p className="text-[12px] text-gold2 uppercase tracking-widest mb-4">
                Por qué podés confiar
              </p>
              <h2 className="h-section text-[32px] md:text-[44px] mb-5 text-cream">
                Si no te emociona cuando la escuchás,<br />
                no pagás nada.
              </h2>
              <p className="text-[16px] text-cream-dim">
                Primero el adelanto gratis. Después vos decidís.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <PilarConfianza
                icon={<MPIcon />}
                titulo="Mercado Pago"
                body="Pagás como en Mercado Libre. Comprador protegido."
              />
              <PilarConfianza
                icon={<ClockIcon />}
                titulo="1 minuto o devolución"
                body="Si pasa un minuto y no te llega, te devolvemos todo."
              />
              <PilarConfianza
                icon={<ShieldIcon />}
                titulo="7 días de garantía"
                body="Después de pagar, si no te gusta, te devolvemos el dinero."
              />
              <PilarConfianza
                icon={<WhatsappIcon className="h-7 w-7 text-wa" />}
                titulo="Hablás con alguien"
                body="Al WhatsApp te contestamos nosotros, no un bot."
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="preguntas"
          className="py-16 md:py-24 px-4 md:px-8 border-t"
          style={{ borderColor: "rgba(245,232,207,0.08)" }}
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="h-section text-[32px] md:text-[44px] mb-10 text-cream">
              Las dudas que nos escriben.
            </h2>
            <div className="divide-y divide-cream/10">
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-[16px] md:text-[17px] text-cream list-none">
                    {f.q}
                    <span className="text-rose transition-transform group-open:rotate-45 shrink-0">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] text-cream-dim leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section
          className="py-20 md:py-28 px-4 md:px-8 relative overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0E0A0C 0%, #231A1E 100%)" }}
        >
          <div className="mx-auto max-w-3xl text-center relative">
            <p className="font-hand text-gold2 text-[24px] mb-5">la última cosa</p>
            <h2 className="h-display text-[36px] md:text-[56px] mb-6 text-cream">
              Esa persona merece<br />
              que, por una vez,<br />
              le regales algo<br />
              que no se olvide.
            </h2>
            <p className="text-[16px] text-cream-dim max-w-lg mx-auto mb-10">
              Dos minutos armando el pedido. Un minuto esperando. Una canción con su nombre que va a escuchar mil veces.
            </p>
            <Link
              href="/crear"
              onClick={trackClickCrear}
              className="inline-flex items-center gap-2 bg-rose hover:bg-rose-deep text-white font-semibold text-[18px] px-8 py-4 rounded-full transition"
            >
              Empezar mi canción gratis
              <ArrowRight />
            </Link>
            <p className="mt-4 text-[13px] text-cream-faint">
              Adelanto gratis · {PRECIO_LABEL} solo si te emociona
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className="py-12 px-4 md:px-8 border-t"
          style={{ background: "#0A0708", borderColor: "rgba(245,232,207,0.08)" }}
        >
          <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-8 text-[13px] text-cream-dim">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block h-6 w-6 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 35%, #D4A74A 0%, #D4A74A 30%, #0E0A0C 32%, #0E0A0C 46%, #231A1E 48%, #231A1E 100%)",
                  }}
                />
                <span className="font-serif text-[16px] text-cream">Melody Lab Studio</span>
              </div>
              <p className="leading-relaxed max-w-xs">
                Canciones compuestas especialmente para esa persona. Un regalo pensado, grabado y entregado en 1 minuto.
              </p>
            </div>
            <div>
              <p className="text-cream font-medium mb-3 text-[13px]">Navegación</p>
              <ul className="space-y-1.5">
                <li><a href="#escuchar" className="hover:text-cream">Escuchar ejemplo</a></li>
                <li><a href="#como" className="hover:text-cream">Cómo funciona</a></li>
                <li><a href="#reacciones" className="hover:text-cream">Reacciones</a></li>
                <li><a href="#preguntas" className="hover:text-cream">Preguntas</a></li>
              </ul>
            </div>
            <div>
              <p className="text-cream font-medium mb-3 text-[13px]">Contacto</p>
              <ul className="space-y-1.5">
                <li><a href="mailto:hola@melodylabstudio.site" className="hover:text-cream">hola@melodylabstudio.site</a></li>
                <li>
                  <a href={WHATSAPP_URL} onClick={trackClickWhatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                    WhatsApp: +54 9 11 6638-2852
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/melody.labstudio/" target="_blank" rel="noopener noreferrer" onClick={trackClickInstagram} className="hover:text-cream">
                    @melody.labstudio
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div
            className="mx-auto max-w-6xl mt-8 pt-6 border-t text-[11px] text-cream-faint"
            style={{ borderColor: "rgba(245,232,207,0.05)" }}
          >
            Las canciones son generadas con Google Lyria y llevan marca de agua SynthID. No representan a artistas reales. © {new Date().getFullYear()} Melody Lab Studio.
          </div>
        </footer>
      </main>

      {/* BOTÓN FLOTANTE WHATSAPP */}
      <a
        href={WHATSAPP_URL}
        onClick={trackClickWhatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatear por WhatsApp"
        className="wa-float ping"
      >
        <svg className="h-7 w-7 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.58-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
        </svg>
        <span className="hidden sm:inline text-[14px] font-medium whitespace-nowrap">
          WhatsApp
        </span>
      </a>
    </div>
  );
}

/* ============ DATA ============ */

const reacciones = [
  { src: "/testimonios/grid_mabel.jpg", nombre: "Mabel", ciudad: "Corrientes" },
  { src: "/testimonios/grid_dios.jpg", nombre: "Mariana", ciudad: "Tucumán" },
  { src: "/testimonios/grid_marcelo.jpg", nombre: "Marcelo", ciudad: "Tucumán" },
  { src: "/testimonios/grid_rosita.jpg", nombre: "Rosita", ciudad: "Santa Fe" },
  { src: "/testimonios/grid_nuria.jpg", nombre: "Nuria", ciudad: "Buenos Aires" },
  { src: "/testimonios/grid_abuela.jpg", nombre: "Karina", ciudad: "Buenos Aires" },
];

const vuelven = [
  { src: "/testimonios/vuelve_hija.jpg", nombre: "Para el cumple de la hija", ciudad: "" },
  { src: "/testimonios/vuelve_ahijada.jpg", nombre: "Para la ahijada", ciudad: "" },
  { src: "/testimonios/vuelve_hermanos.jpg", nombre: "Dedicatoria familiar", ciudad: "" },
  { src: "/testimonios/vuelve_finmes.jpg", nombre: "Cliente volviendo", ciudad: "" },
];

const faqs = [
  {
    q: "¿Es cantada por un cantante real?",
    a: "No. La voz la compone Google Lyria, el software de música cantada más avanzado que existe. Es por eso que podemos entregarla en 1 minuto por el precio que ves, en lugar de 2 semanas por $80.000. La canción es original y única — no imita a nadie famoso.",
  },
  {
    q: "¿Y si no me gusta cómo quedó?",
    a: "Antes de pagar escuchás un adelanto de 30 segundos. Si no te emociona, no pagás. Y una vez pagada, tenés 7 días para pedirnos la devolución del dinero.",
  },
  {
    q: "¿Cómo pago? ¿Es seguro?",
    a: "Pagás con Mercado Pago (tarjeta, débito o dinero en cuenta). Los datos los procesa Mercado Pago, no nosotros. Tu compra está protegida por el programa de comprador protegido. Factura electrónica a pedido.",
  },
  {
    q: "¿Qué estilos y voces hay?",
    a: "12 estilos: balada, bolero, tango, folklore, cumbia, mariachi, vals, salsa, pop, rock nacional, reggaeton, religiosa. O escribís vos uno distinto. Voz femenina o masculina — podés pedir las dos.",
  },
  {
    q: "¿En cuánto tiempo llega?",
    a: "En menos de un minuto el sistema te genera el adelanto y te lo manda por email. La canción completa se desbloquea apenas pagás.",
  },
  {
    q: "¿Cómo la comparto después?",
    a: "Descargás el MP3 y lo mandás por WhatsApp, email, o lo ponés a sonar desde el celular. También podés descargar la letra para imprimirla si querés acompañar el regalo.",
  },
  {
    q: "Tengo otra duda, ¿cómo los contacto?",
    a: "WhatsApp al +54 9 11 6638-2852 o email a hola@melodylabstudio.site. Te contestamos nosotros, no un bot.",
  },
];

/* ============ COMPONENTES ============ */

function PlayerCassette() {
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [barras] = useState(() => Array.from({ length: 32 }, () => 15 + Math.random() * 85));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnd = () => { setPlaying(false); setSeconds(0); };
    const onTime = () => setSeconds(Math.floor(audio.currentTime));
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("timeupdate", onTime);
    return () => {
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  }

  function format(s: number) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  }

  return (
    <div className="relative mx-auto max-w-sm">
      <audio ref={audioRef} src="/demo-primavera.mp3" preload="metadata" />

      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="h-px w-6 bg-gold2" />
        <span className="font-hand text-gold2 text-[20px]">↓ dale play, es un ejemplo real</span>
      </div>

      <div
        className="rounded-[20px] p-5 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #231A1E 0%, #1A1216 50%, #231A1E 100%)",
          border: "1px solid rgba(212,167,74,0.2)",
        }}
      >
        {/* Header del cassette */}
        <div className="flex items-center justify-between mb-4 text-[10px] tracking-[0.2em] uppercase text-cream-dim">
          <span>Mixtape · 001</span>
          <span className="font-mono">A ⟷ B</span>
        </div>

        {/* Reels */}
        <div
          className="relative rounded-lg p-4 mb-4"
          style={{ background: "#0E0A0C", border: "1px solid rgba(212,167,74,0.1)" }}
        >
          <div
            className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[3px]"
            style={{ background: "#2a1f22", borderTop: "1px solid rgba(212,167,74,0.2)" }}
          />
          <div className="flex items-center justify-between relative">
            <Reel playing={playing} />
            <Reel playing={playing} />
          </div>
        </div>

        {/* Etiqueta de la canción */}
        <div className="rounded-md px-4 py-3 mb-4" style={{ background: "#F5E8CF", color: "#0E0A0C" }}>
          <p className="font-hand text-[22px] leading-tight">Para mamá, en sus 70</p>
          <p className="text-[11px] mt-0.5 opacity-70">Bolero · voz femenina · 3:04</p>
        </div>

        {/* Waveform */}
        <div className="h-10 flex items-end gap-[3px] mb-4 text-rose">
          {barras.map((h, i) => (
            <span
              key={i}
              className={`wave-bar flex-1 ${playing ? "playing" : ""}`}
              style={{
                height: `${h}%`,
                minHeight: "3px",
                width: "3px",
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={togglePlay}
            className="flex-1 flex items-center justify-center gap-2 bg-cream text-ebony font-medium text-[15px] py-3 rounded-full hover:bg-white transition"
          >
            {playing ? (
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3h4v14H5zM11 3h4v14h-4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3l12 7-12 7V3z" />
              </svg>
            )}
            <span>{playing ? "Pausar" : "Escuchar"}</span>
          </button>
          <span className="text-[12px] text-cream-dim font-mono">
            {format(seconds)} / 0:30
          </span>
        </div>
      </div>

      <p className="text-[12px] text-cream-faint text-center mt-3 italic">
        Lado A · adelanto gratis. La completa se desbloquea después.
      </p>
    </div>
  );
}

function Reel({ playing }: { playing: boolean }) {
  return (
    <div
      className={`reel h-20 w-20 rounded-full flex items-center justify-center ${playing ? "playing" : ""}`}
      style={{
        background:
          "radial-gradient(circle at center, #D4A74A 0%, #D4A74A 15%, #1A1216 16%, #1A1216 100%)",
        border: "1px solid rgba(212,167,74,0.3)",
      }}
    >
      <div
        className="h-6 w-6 rounded-full"
        style={{ background: "#0E0A0C", border: "1px solid rgba(212,167,74,0.4)" }}
      />
    </div>
  );
}

function Paso({ n, titulo, body }: { n: string; titulo: string; body: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="h-10 w-10 rounded-full bg-rose text-white font-serif text-[18px] flex items-center justify-center">
          {n}
        </span>
        <span className="h-px flex-1 bg-cream/10" />
      </div>
      <h3 className="font-serif text-[22px] font-medium mb-3 text-cream">{titulo}</h3>
      <p className="text-[15px] text-cream-dim leading-relaxed">{body}</p>
    </div>
  );
}

function CapturaReaccion({
  src,
  nombre,
  ciudad,
  compact,
}: {
  src: string;
  nombre: string;
  ciudad: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl overflow-hidden bg-ebony-card border border-cream/10 hover:border-rose/40 transition">
      <img
        src={src}
        alt={`Reacción real por WhatsApp — ${nombre}${ciudad ? `, ${ciudad}` : ""}`}
        className="block w-full h-auto"
        loading="lazy"
      />
      <div className={`px-4 ${compact ? "py-2.5" : "py-3"} border-t border-cream/5`}>
        <p className="text-[13px] text-cream font-medium leading-tight">{nombre}</p>
        {ciudad && <p className="text-[11px] text-cream-faint mt-0.5">{ciudad}</p>}
      </div>
    </div>
  );
}

function PilarConfianza({
  icon,
  titulo,
  body,
}: {
  icon: React.ReactNode;
  titulo: string;
  body: string;
}) {
  return (
    <div className="rounded-xl p-5 bg-ebony-card border border-cream/10">
      <div className="mb-3">{icon}</div>
      <p className="font-serif text-[16px] font-medium text-cream mb-2">{titulo}</p>
      <p className="text-[13px] text-cream-dim leading-relaxed">{body}</p>
    </div>
  );
}

function Inicial({ letra, style }: { letra: string; style?: React.CSSProperties }) {
  return (
    <span
      className="h-9 w-9 rounded-full flex items-center justify-center font-serif text-[14px]"
      style={style}
    >
      {letra}
    </span>
  );
}

/* ============ ICONOS ============ */

function ArrowRight() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="h-4 w-4 text-gold2" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1l2.6 6 6.4.5-4.9 4.4 1.5 6.4L10 15l-5.6 3.3L5.9 12 1 7.5 7.4 7 10 1z" />
    </svg>
  );
}
function MPIcon({ small }: { small?: boolean }) {
  return (
    <svg
      className={small ? "h-4 w-4" : "h-7 w-7"}
      style={{ color: "#009EE3" }}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2L4 5v6c0 5.5 3.4 10.4 8 11.5 4.6-1.1 8-6 8-11.5V5l-8-3zm3.5 10.5l-5 5-2.5-2.5 1.4-1.4 1.1 1.1 3.6-3.6 1.4 1.4z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="h-7 w-7 text-gold2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="h-7 w-7 text-rose" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" strokeLinejoin="round" />
      <path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WhatsappIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 3.5A11.8 11.8 0 0 0 2.1 18.5L1 23l4.6-1.1A11.8 11.8 0 1 0 20 3.5zM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-2.7.7.7-2.6-.2-.3A9 9 0 1 1 12 21zm5.1-6.7c-.3-.1-1.7-.8-1.9-.9s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.6.1a7.3 7.3 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5s-.6-1.5-.8-2-.5-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.5 4c.6.3 1.1.5 1.5.6a3.7 3.7 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
