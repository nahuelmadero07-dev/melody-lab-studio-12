import type { Metadata } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import Script from "next/script";
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

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Melody Lab Studio — Su historia, hecha canción.",
  description:
    "Una canción compuesta especialmente para esa persona, con su nombre, su historia y sus recuerdos. Escuchás un adelanto gratis y pagás solo si te emociona.",
  openGraph: {
    title: "Melody Lab Studio — Su historia, hecha canción.",
    description:
      "Un regalo pensado, grabado y entregado en menos de un minuto. Escuchás un adelanto gratis, pagás solo si te emociona.",
    type: "website",
    url: "https://www.melodylabstudio.site",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} ${caveat.variable}`}
    >
      <body className="font-sans antialiased selection:bg-gold/30 selection:text-ink">
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1423641575865360');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=1423641575865360&ev=PageView&noscript=1" alt="" />
        </noscript>
        {children}
      </body>
    </html>
  );
}
