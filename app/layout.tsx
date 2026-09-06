import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Melody Lab Studio — Convertí su historia en una canción",
  description:
    "Contás la historia. Nuestra IA la convierte en una canción única con su nombre. Escuchás un adelanto gratis y pagás solo si te emociona.",
  openGraph: {
    title: "Melody Lab Studio — Convertí su historia en una canción",
    description:
      "Un regalo hecho a medida en 3 minutos. Escuchás un adelanto gratis, pagás solo si te gusta.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased selection:bg-gold/30 selection:text-parchment">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
