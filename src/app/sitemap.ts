import type { MetadataRoute } from "next";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import { GUIDES } from "@/lib/content/guides";

const STATIC_ROUTES_FR = [
  "",
  "/methode",
  "/tarifs",
  "/connexion",
  "/inscription",
  "/compatibilite",
  "/duo",
  "/carte",
  "/horoscope",
  "/guides",
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
  "/en/duo",
  "/en/map",
  "/en/horoscope",
  "/en/guides",
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

  const horoscopeEntries: MetadataRoute.Sitemap = [];
  for (const sign of ZODIAC_SIGNS) {
    horoscopeEntries.push({ url: `${siteUrl}/horoscope/${sign}`, changeFrequency: "daily", priority: 0.6 });
    horoscopeEntries.push({ url: `${siteUrl}/en/horoscope/${sign}`, changeFrequency: "daily", priority: 0.6 });
  }

  const guideEntries: MetadataRoute.Sitemap = [];
  for (const guide of GUIDES) {
    guideEntries.push({ url: `${siteUrl}/guides/${guide.slug}`, changeFrequency: "yearly", priority: 0.6 });
    guideEntries.push({ url: `${siteUrl}/en/guides/${guide.slug}`, changeFrequency: "yearly", priority: 0.6 });
  }

  return [...staticEntries, ...compatibilityEntries, ...horoscopeEntries, ...guideEntries];
}
