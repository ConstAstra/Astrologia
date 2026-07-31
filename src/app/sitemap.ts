import type { MetadataRoute } from "next";
import { ZODIAC_SIGNS } from "@/lib/astro/types";

const STATIC_ROUTES = ["", "/methode", "/tarifs", "/connexion", "/inscription", "/compatibilite"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const compatibilityEntries: MetadataRoute.Sitemap = [];
  for (const a of ZODIAC_SIGNS) {
    for (const b of ZODIAC_SIGNS) {
      compatibilityEntries.push({
        url: `${siteUrl}/compatibilite/${a}-${b}`,
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  }

  return [...staticEntries, ...compatibilityEntries];
}
