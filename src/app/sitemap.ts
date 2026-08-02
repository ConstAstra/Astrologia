import type { MetadataRoute } from "next";
import { ZODIAC_SIGNS } from "@/lib/astro/types";

const STATIC_ROUTES_FR = [
  "",
  "/methode",
  "/tarifs",
  "/connexion",
  "/inscription",
  "/compatibilite",
  "/mentions-legales",
  "/confidentialite",
  "/conditions-generales",
];
const STATIC_ROUTES_EN = [
  "/en",
  "/en/method",
  "/en/pricing",
  "/en/login",
  "/en/signup",
  "/en/compatibility",
  "/en/legal-notice",
  "/en/privacy",
  "/en/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticEntries: MetadataRoute.Sitemap = [...STATIC_ROUTES_FR, ...STATIC_ROUTES_EN].map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "monthly",
    priority: route === "" || route === "/en" ? 1 : 0.7,
  }));

  const compatibilityEntries: MetadataRoute.Sitemap = [];
  for (const a of ZODIAC_SIGNS) {
    for (const b of ZODIAC_SIGNS) {
      compatibilityEntries.push({
        url: `${siteUrl}/compatibilite/${a}-${b}`,
        changeFrequency: "yearly",
        priority: 0.5,
      });
      compatibilityEntries.push({
        url: `${siteUrl}/en/compatibility/${a}-${b}`,
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  }

  return [...staticEntries, ...compatibilityEntries];
}
