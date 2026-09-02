import Link from "next/link";
import { Logo } from "./Logo";
import type { Locale } from "./SiteHeader";

const TEXT: Record<
  Locale,
  {
    tagline: string;
    productHeading: string;
    legalHeading: string;
    horoscope: string;
    guides: string;
    method: string;
    news: string;
    compatibility: string;
    pricing: string;
    signup: string;
    legalNotice: string;
    privacy: string;
    terms: string;
    copyright: string;
  }
> = {
  fr: {
    tagline:
      "Thème astral, synastrie, thème composite et cartographie, expliqués clairement. Un outil de réflexion et d'introspection, pas une prédiction.",
    productHeading: "Produit",
    legalHeading: "Légal",
    horoscope: "Horoscope du jour",
    guides: "Guides",
    method: "La méthode",
    news: "Actualités",
    compatibility: "Compatibilité",
    pricing: "Tarifs",
    signup: "Créer un compte",
    legalNotice: "Mentions légales",
    privacy: "Confidentialité",
    terms: "CGV / CGU",
    copyright: "Contenus à visée d'introspection et de divertissement, sans valeur prédictive garantie.",
  },
  en: {
    tagline:
      "Natal chart, synastry, composite chart and astrocartography, clearly explained. A tool for reflection and introspection, not a prediction.",
    productHeading: "Product",
    legalHeading: "Legal",
    horoscope: "Daily horoscope",
    guides: "Guides",
    method: "Our method",
    news: "News",
    compatibility: "Compatibility",
    pricing: "Pricing",
    signup: "Create an account",
    legalNotice: "Legal notice",
    privacy: "Privacy",
    terms: "Terms",
    copyright: "Content for reflection and entertainment purposes, no guaranteed predictive value.",
  },
};

export function SiteFooter({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const base = locale === "en" ? "/en" : "";

  return (
    <footer className="border-t border-border-soft">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted">{t.tagline}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 font-medium text-foreground">{t.productHeading}</p>
              <ul className="space-y-2 text-muted">
                <li><Link href={`${base}/horoscope`} className="hover:text-foreground">{t.horoscope}</Link></li>
                <li><Link href={`${base}/guides`} className="hover:text-foreground">{t.guides}</Link></li>
                <li><Link href={`${base}/${locale === "en" ? "method" : "methode"}`} className="hover:text-foreground">{t.method}</Link></li>
                <li><Link href={`${base}/${locale === "en" ? "news" : "actualites"}`} className="hover:text-foreground">{t.news}</Link></li>
                <li><Link href={`${base}/${locale === "en" ? "compatibility" : "compatibilite"}`} className="hover:text-foreground">{t.compatibility}</Link></li>
                <li><Link href={`${base}/${locale === "en" ? "pricing" : "tarifs"}`} className="hover:text-foreground">{t.pricing}</Link></li>
                <li><Link href={`${base}/${locale === "en" ? "signup" : "inscription"}`} className="hover:text-foreground">{t.signup}</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium text-foreground">{t.legalHeading}</p>
              <ul className="space-y-2 text-muted">
                <li><Link href={`${base}/${locale === "en" ? "legal-notice" : "mentions-legales"}`} className="hover:text-foreground">{t.legalNotice}</Link></li>
                <li><Link href={`${base}/${locale === "en" ? "privacy" : "confidentialite"}`} className="hover:text-foreground">{t.privacy}</Link></li>
                <li><Link href={`${base}/${locale === "en" ? "terms" : "conditions-generales"}`} className="hover:text-foreground">{t.terms}</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted/70">
          © {new Date().getFullYear()} Astrologium. {t.copyright}
        </p>
      </div>
    </footer>
  );
}
