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

/* ============ CONFIG CONTACTO ============ */
// 🔧 CAMBIÁ ESTE NÚMERO POR EL TUYO (sin + ni espacios)
const WHATSAPP_NUM = "5491100000000";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(
  "Hola, tengo una duda antes de pedir mi canción"
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
            <Link href="/crear" onClick={trackClickCrear} className="inline-flex items-center gap-1.5 rounded-full bg-ink text-paper px-4 py-2.5 text-[14px] font-medium
