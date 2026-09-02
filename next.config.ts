import type { NextConfig } from "next";

// CSP volontairement stricte : aucun script/style/image/police externe n'est
// chargé nulle part dans l'app (next/font auto-héberge les polices, Stripe
// est utilisé en redirection serveur, jamais via son SDK client, il n'y a ni
// analytics ni carte à tuiles externes) — seule 'unsafe-inline' sur
// script-src reste nécessaire pour le petit script inline de layout.tsx qui
// pose le thème jour/nuit avant hydratation (voir ce fichier). connect-src
// 'self' bloque déjà l'exfiltration vers un domaine tiers en cas d'injection.
// 'unsafe-eval' n'est nécessaire qu'en dev (React/Turbopack Fast Refresh
// l'utilisent pour reconstruire les stack traces) — jamais en production, où
// React ne l'appelle jamais.
const scriptSrc = process.env.NODE_ENV === "production" ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // HSTS n'a d'effet que servi sur une réponse déjà en HTTPS (le navigateur
  // ignore l'en-tête sur HTTP) — sans risque de casser le dev local.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
