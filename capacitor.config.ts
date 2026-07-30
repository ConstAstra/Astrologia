import type { CapacitorConfig } from "@capacitor/cli";

// L'app iOS charge le vrai site en ligne dans une coque native (le backend
// Next.js — comptes, calculs astrologiques, base de données — ne peut pas
// être "exporté" en statique). Seuls les achats intégrés (StoreKit) sont
// natifs ; tout le reste passe par le site web.
const config: CapacitorConfig = {
  appId: "com.astrologia.app",
  appName: "Astrologia",
  webDir: "public",
  server: {
    url: process.env.CAPACITOR_SERVER_URL ?? "https://app.astrologia.example",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
