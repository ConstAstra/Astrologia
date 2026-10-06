import { readFileSync } from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { composeSignCompatibility } from "@/lib/astro/interpretations/sign-compatibility";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import type { ZodiacSign } from "@/lib/astro/types";
import { renderAvatarDataUri } from "@/components/avatar/renderAvatarDataUri";
import { renderQrDataUri } from "@/lib/qr";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Route publique, sans authentification : point d'entrée "sans compte" de la
// viralité — n'importe qui peut générer une carte en 10 secondes sans jamais
// créer de profil. Aucune donnée de naissance réelle (heure, lieu) n'est
// demandée ni stockée : uniquement deux prénoms et deux signes solaires,
// choisis à la main. Débit par IP plutôt que par utilisateur, faute de
// session — plus strict que les cartes authentifiées car sans le
// garde-fou d'un compte associé.
const duoLimiter = createRateLimiter({ max: 15, windowMs: 5 * 60_000 });

const DIMENSIONS = {
  post: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
} as const;

let fontData: Buffer | null = null;
function loadFont(): Buffer {
  fontData ??= readFileSync(path.join(process.cwd(), "src/assets/fonts/DejaVuSans.ttf"));
  return fontData;
}

const SIGN_SET = new Set<string>(ZODIAC_SIGNS);
function isZodiacSign(value: string | null): value is ZodiacSign {
  return !!value && SIGN_SET.has(value);
}

function sanitizeName(raw: string | null, fallback: string): string {
  const trimmed = (raw ?? "").trim().replace(/[\r\n\t]/g, " ").slice(0, 24);
  return trimmed.length > 0 ? trimmed : fallback;
}

const TEASER_TIERS: { score: number; fr: string; en: string; color: string }[] = [
  { score: 5, fr: "Alchimie rare", en: "Rare chemistry", color: "#f2b799" },
  { score: 4, fr: "Belle complicité", en: "Great vibe", color: "#f2b799" },
  { score: 3, fr: "Équilibre à construire", en: "Balance to build", color: "#9fc0a3" },
  { score: 2, fr: "Ça demande du travail", en: "Takes real work", color: "#c96b4a" },
  { score: 1, fr: "Univers différents", en: "Different worlds", color: "#c96b4a" },
];

export async function GET(request: Request) {
  if (duoLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const url = new URL(request.url);
  const signAParam = url.searchParams.get("signA");
  const signBParam = url.searchParams.get("signB");
  if (!isZodiacSign(signAParam) || !isZodiacSign(signBParam)) {
    return NextResponse.json({ error: "Signe invalide" }, { status: 400 });
  }
  const signA = signAParam;
  const signB = signBParam;

  // Compteur pour le "X cartes générées cette semaine" affiché sur /duo —
  // jamais bloquant : un raté d'écriture ne doit jamais empêcher la
  // génération de la carte elle-même, qui reste le seul but de la route.
  prisma.duoGeneration.create({ data: {} }).catch(() => {});

  const locale: "fr" | "en" = url.searchParams.get("locale") === "en" ? "en" : "fr";
  const nameA = sanitizeName(url.searchParams.get("nameA"), locale === "en" ? "You" : "Toi");
  const nameB = sanitizeName(url.searchParams.get("nameB"), locale === "en" ? "Them" : "Iel");

  const format = url.searchParams.get("format") === "story" ? "story" : "post";
  const { width: WIDTH, height: HEIGHT } = DIMENSIONS[format];
  const isStory = format === "story";
  const s = <T,>(post: T, story: T): T => (isStory ? story : post);

  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "astrologium.app").replace(/^https?:\/\//, "");
  // Pas de compte ici (flux anonyme) donc pas de code de parrainage : le QR
  // renvoie simplement vers /duo pour que quiconque scanne puisse faire le
  // test à son tour.
  const qrDataUri = renderQrDataUri(`https://${siteUrl}${locale === "en" ? "/en/duo" : "/duo"}`);

  const { score } = composeSignCompatibility(signA, signB);
  const tier = TEASER_TIERS.find((t) => t.score === score) ?? TEASER_TIERS[TEASER_TIERS.length - 1];
  const punchline = locale === "en" ? tier.en : tier.fr;
  const stars = "★".repeat(score) + "☆".repeat(5 - score);

  const avatarA = renderAvatarDataUri(`duo-${nameA}-${signA}`, signA, s(140, 200));
  const avatarB = renderAvatarDataUri(`duo-${nameB}-${signB}`, signB, s(140, 200));

  const cardTitle = locale === "en" ? "COMPATIBILITY TEST" : "TEST DE COMPATIBILITÉ";
  const ctaLine = locale === "en" ? "Try it free" : "Fais le vrai test, gratuit";
  const legalLine = locale === "en" ? "Sun signs only, for fun" : "Signes solaires uniquement, pour le fun";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#150e17",
          fontFamily: "DejaVu Sans",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            width: WIDTH - 140,
            height: HEIGHT - 140,
            borderRadius: 40,
            overflow: "hidden",
            border: "2px solid #e8935f55",
            boxShadow: "0 40px 100px -30px #00000090",
            background: "linear-gradient(160deg, #7a5024 0%, #55324e 45%, #1f1420 100%)",
            color: "#f7ece2",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "30px 44px",
              background: "#1f1420cc",
              borderBottom: "1px solid #e8935f33",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: "linear-gradient(135deg, #f2b799, #c77b8a)",
                  transform: "rotate(45deg)",
                }}
              />
              <div style={{ display: "flex", fontSize: 26, letterSpacing: 1 }}>Astrologium</div>
            </div>
            <div style={{ display: "flex", fontSize: 16, color: "#c9a8ad", letterSpacing: 3 }}>{cardTitle}</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "48px 44px",
              alignItems: "center",
              justifyContent: "center",
              gap: s(28, 60),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: s(24, 36) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarA} width={s(140, 200)} height={s(140, 200)} alt="" style={{ borderRadius: s(26, 38) }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarB} width={s(140, 200)} height={s(140, 200)} alt="" style={{ borderRadius: s(26, 38) }} />
            </div>

            <div style={{ display: "flex", fontSize: s(60, 88), color: tier.color, letterSpacing: 4 }}>{stars}</div>

            <div
              style={{
                display: "flex",
                fontSize: s(30, 48),
                color: tier.color,
                letterSpacing: 1,
                textAlign: "center",
                maxWidth: s(760, 820),
                justifyContent: "center",
              }}
            >
              {punchline}
            </div>

            <div style={{ display: "flex", fontSize: s(36, 54), textAlign: "center" }}>
              {nameA} <span style={{ color: "#f2b799", margin: "0 12px" }}>&amp;</span> {nameB}
            </div>

            <div style={{ display: "flex", fontSize: s(18, 26), color: "#c9a8ad" }}>
              {signMap[signA].symbol} {signMap[signA].name} <span style={{ margin: "0 10px" }}>·</span>{" "}
              {signMap[signB].symbol} {signMap[signB].name}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "22px 44px 30px",
              borderTop: "1px solid #ffffff1a",
            }}
          >
            <div style={{ display: "flex", fontSize: 15, color: "#71768e", letterSpacing: 1 }}>{legalLine}</div>
            <div style={{ display: "flex", alignItems: "center", gap: s(14, 18) }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ display: "flex", fontSize: 17, color: "#e6d9d1" }}>{ctaLine}</div>
                <div style={{ display: "flex", fontSize: 17, color: "#f2b799", fontWeight: 700 }}>→ {siteUrl}</div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUri}
                width={s(60, 76)}
                height={s(60, 76)}
                alt=""
                style={{ borderRadius: 8, border: "3px solid #f7ece2" }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: [{ name: "DejaVu Sans", data: loadFont(), style: "normal" }] }
  );
}
