import type { Metadata } from "next";
import { Unbounded, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SkyScroll } from "@/components/SkyScroll";
import { PageTransition } from "@/components/PageTransition";
import { PageViewBeacon } from "@/components/PageViewBeacon";

const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Astrologium — Thème astral, synastrie, composite & cartographie",
  description:
    "Créez votre thème astral, votre synastrie, votre thème composite et votre cartographie astrologique. Calculs précis, méthode expliquée, lecture en français.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          // Posé avant l'hydratation pour éviter un flash au chargement :
          // le mode jour (Bloom) reste la valeur par défaut tant que rien
          // n'est enregistré.
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('astrologium-theme');if(t==='night')document.documentElement.dataset.theme='night';}catch(e){}",
          }}
        />
        <SkyScroll />
        <div className="starfield" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <PageViewBeacon />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
