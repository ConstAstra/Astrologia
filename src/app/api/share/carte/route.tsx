import { readFileSync } from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import type { ZodiacSign, PlanetKey } from "@/lib/astro/types";
import { PLANET_KEYS } from "@/lib/astro/types";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { describeAstroCartoLine } from "@/lib/astro/interpretations/compose";
import type { LineTypeKey } from "@/lib/astro/interpretations/astrocartography-content";
import { MAJOR_COUNTRIES } from "@/components/map/majorCountries";
import { MAJOR_COUNTRIES_EN } from "@/components/map/majorCountries.en";
import { renderQrDataUri } from "@/lib/qr";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Route publique, sans authentification : carte de partage pour la carte
// d'astrocartographie anonyme (/carte, /en/map). Ne reçoit que des signes et
// des identifiants de pays/lignes déjà couverts par la liste publique —
// aucune donnée de naissance (heure, lieu) n'y transite ni n'y est stockée.
const carteShareLimiter = createRateLimiter({ max: 15, windowMs: 5 * 60_000 });

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

const PLANET_SET = new Set<string>(PLANET_KEYS);
const LINE_TYPE_SET = new Set(["MC", "IC", "AC", "DC"]);

function parseLines(raw: string | null): { planet: PlanetKey; type: LineTypeKey }[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((token) => {
      const [planet, type] = token.split("-");
      if (!PLANET_SET.has(planet) || !LINE_TYPE_SET.has(type)) return null;
      return { planet: planet as PlanetKey, type: type as LineTypeKey };
    })
    .filter((l): l is { planet: PlanetKey; type: LineTypeKey } => l !== null)
    .slice(0, 6);
}

function sanitizeName(raw: string | null, fallback: string): string {
  const trimmed = (raw ?? "").trim().replace(/[\r\n\t]/g, " ").slice(0, 24);
  return trimmed.length > 0 ? trimmed : fallback;
}

export async function GET(request: Request) {
  if (carteShareLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const url = new URL(request.url);
  const locale: "fr" | "en" = url.searchParams.get("locale") === "en" ? "en" : "fr";
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const countryList = locale === "en" ? MAJOR_COUNTRIES_EN : MAJOR_COUNTRIES;

  const sunParam = url.searchParams.get("sun");
  const moonParam = url.searchParams.get("moon");
  const ascParam = url.searchParams.get("ascendant");
  if (!isZodiacSign(sunParam) || !isZodiacSign(moonParam)) {
    return NextResponse.json({ error: "Signe invalide" }, { status: 400 });
  }
  const ascendant = isZodiacSign(ascParam) ? ascParam : null;

  const countryId = url.searchParams.get("countryId");
  const country = countryList.find((c) => c.id === countryId);
  if (!country) {
    return NextResponse.json({ error: "Pays invalide" }, { status: 400 });
  }

  const lines = parseLines(url.searchParams.get("lines"));
  const name = sanitizeName(url.searchParams.get("name"), locale === "en" ? "You" : "Toi");
  const format = url.searchParams.get("format") === "story" ? "story" : "post";
  const { width: WIDTH, height: HEIGHT } = DIMENSIONS[format];
  const isStory = format === "story";
  const s = <T,>(post: T, story: T): T => (isStory ? story : post);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "astrologium.app").replace(/^https?:\/\//, "");
  // Flux anonyme (pas de compte, pas de code de parrainage) : le QR renvoie
  // simplement vers l'outil public pour que quiconque scanne puisse faire
  // son propre calcul.
  const shareUrl = `${siteUrl}${locale === "en" ? "/en/map" : "/carte"}`;
  const qrDataUri = renderQrDataUri(`https://${shareUrl}`);

  const cardTitle = locale === "en" ? "ASTROCARTOGRAPHY" : "CARTOGRAPHIE ASTRALE";
  const ctaLine = locale === "en" ? "Calculate yours, free" : "Calcule la tienne, gratuite";
  const legalLine = locale === "en" ? "For fun, not a prediction" : "Pour le fun, pas une prédiction";
  const headline = locale === "en" ? `${name}'s lines cross` : `Les lignes de ${name} traversent`;
  const noLinesText = locale === "en" ? "No personal line crosses this country directly." : "Aucune ligne personnelle ne traverse directement ce pays.";

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
              gap: s(20, 36),
            }}
          >
            <div style={{ display: "flex", fontSize: s(20, 26), color: "#c9a8ad" }}>
              {signMap[sunParam].symbol} {signMap[sunParam].name} <span style={{ margin: "0 8px" }}>·</span>
              {signMap[moonParam].symbol} {signMap[moonParam].name}
              {ascendant && (
                <>
                  <span style={{ margin: "0 8px" }}>·</span> ASC {signMap[ascendant].symbol} {signMap[ascendant].name}
                </>
              )}
            </div>

            <div style={{ display: "flex", fontSize: s(28, 38), color: "#e6d9d1", textAlign: "center" }}>{headline}</div>

            <div style={{ display: "flex", fontSize: s(56, 78), color: "#f2b799", letterSpacing: 1, textAlign: "center" }}>
              📍 {country.name}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                width: "100%",
                maxWidth: s(760, 820),
                marginTop: 8,
              }}
            >
              {lines.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", fontSize: s(20, 26), color: "#c9a8ad" }}>
                  {noLinesText}
                </div>
              ) : (
                lines.slice(0, 4).map((l, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      fontSize: s(18, 24),
                      lineHeight: 1.4,
                      color: "#e6d9d1",
                      border: "1px solid #ffffff22",
                      borderRadius: 16,
                      padding: s("14px 20px", "18px 26px"),
                      background: "#ffffff0a",
                    }}
                  >
                    {describeAstroCartoLine(l.planet, l.type, locale)}
                  </div>
                ))
              )}
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
                <div style={{ display: "flex", fontSize: 17, color: "#f2b799", fontWeight: 700 }}>→ {shareUrl}</div>
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
