import { readFileSync } from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { canonicalPair, hasFeatureAccess } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeSynastry } from "@/lib/astro/synastry";
import { computeCompatibilityScore, compatibilityPunchline } from "@/lib/astro/compatibility-score";
import { computeBigThree } from "@/lib/astro/dominance";
import type { AvatarOverrides } from "@/components/avatar/avatarTraits";
import { renderAvatarDataUri } from "@/components/avatar/renderAvatarDataUri";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Même logique de mise à l'échelle post/story que la carte d'identité —
// voir src/app/api/share/theme-natal/[id]/route.tsx pour le raisonnement.
const DIMENSIONS = {
  post: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
} as const;

const shareCardLimiter = createRateLimiter({ max: 30, windowMs: 5 * 60_000 });

let fontData: Buffer | null = null;
function loadFont(): Buffer {
  fontData ??= readFileSync(path.join(process.cwd(), "src/assets/fonts/DejaVuSans.ttf"));
  return fontData;
}

function parseOverrides(raw: string | null): AvatarOverrides | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as AvatarOverrides;
  } catch {
    return undefined;
  }
}

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (shareCardLimiter.isLimited(userId)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const url = new URL(request.url);
  const a = url.searchParams.get("a");
  const b = url.searchParams.get("b");
  if (!a || !b) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const format = url.searchParams.get("format") === "story" ? "story" : "post";
  const { width: WIDTH, height: HEIGHT } = DIMENSIONS[format];
  const isStory = format === "story";
  const s = <T,>(post: T, story: T): T => (isStory ? story : post);

  const [profileA, profileB, user] = await Promise.all([
    prisma.profile.findUnique({ where: { id: a } }),
    prisma.profile.findUnique({ where: { id: b } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profileA || !profileB) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  // Il faut être l'un des deux comptes de la paire — pas de génération de
  // carte pour des profils qui n'ont aucun lien avec le compte appelant.
  if (profileA.userId !== userId && profileB.userId !== userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // La carte n'est accessible qu'une fois la synastrie déjà débloquée pour
  // cette paire (abonnement ou crédit) — même règle que la page elle-même,
  // pour ne pas offrir un accès gratuit au score par un autre chemin.
  const [primaryProfileId, secondaryProfileId] = canonicalPair(a, b);
  const access = await hasFeatureAccess(userId, {
    feature: "synastry",
    primaryProfileId,
    secondaryProfileId,
  });
  if (!access) return NextResponse.json({ error: "Synastrie non débloquée" }, { status: 403 });

  const locale: "fr" | "en" = user.locale === "en" ? "en" : "fr";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "astrologium.app").replace(/^https?:\/\//, "");

  const chartA = computeNatalChart(
    {
      date: profileA.birthDate,
      time: profileA.birthTime,
      tzName: profileA.tzName,
      latitude: profileA.latitude,
      longitude: profileA.longitude,
      timeUnknown: profileA.timeUnknown,
    },
    "placidus"
  );
  const chartB = computeNatalChart(
    {
      date: profileB.birthDate,
      time: profileB.birthTime,
      tzName: profileB.tzName,
      latitude: profileB.latitude,
      longitude: profileB.longitude,
      timeUnknown: profileB.timeUnknown,
    },
    "placidus"
  );

  const synastry = computeSynastry(chartA, chartB);
  const { percentage } = computeCompatibilityScore(synastry.aspects);
  const { text: punchline, color: punchlineColor } = compatibilityPunchline(percentage, locale);

  const big3A = computeBigThree(chartA.points, chartA.hasReliableHouses);
  const big3B = computeBigThree(chartB.points, chartB.hasReliableHouses);
  const avatarA = renderAvatarDataUri(
    profileA.id,
    big3A.sun,
    s(140, 260),
    big3A.moon,
    big3A.ascendant ?? undefined,
    parseOverrides(profileA.avatarOverrides)
  );
  const avatarB = renderAvatarDataUri(
    profileB.id,
    big3B.sun,
    s(140, 260),
    big3B.moon,
    big3B.ascendant ?? undefined,
    parseOverrides(profileB.avatarOverrides)
  );

  const cardTitle = locale === "en" ? "COMPATIBILITY TEST" : "TEST DE COMPATIBILITÉ";
  const ctaLine = locale === "en" ? "Try it with your pair" : "Fais le test avec ta paire";
  const legalLine = locale === "en" ? "For fun, not a prediction" : "Pour le fun, pas une prédiction";

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
              <img
                src={avatarA}
                width={s(140, 200)}
                height={s(140, 200)}
                alt=""
                style={{ borderRadius: s(26, 38) }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarB}
                width={s(140, 200)}
                height={s(140, 200)}
                alt=""
                style={{ borderRadius: s(26, 38) }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: s(10, 22),
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: s(120, 190),
                  fontWeight: 700,
                  color: punchlineColor,
                  lineHeight: 1,
                }}
              >
                {percentage}%
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: s(30, 48),
                  color: punchlineColor,
                  letterSpacing: 1,
                }}
              >
                {punchline}
              </div>
            </div>

            <div style={{ display: "flex", fontSize: s(36, 54), textAlign: "center" }}>
              {profileA.label} <span style={{ color: "#f2b799", margin: "0 12px" }}>&amp;</span> {profileB.label}
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", fontSize: 17, color: "#e6d9d1" }}>{ctaLine}</div>
              <div style={{ display: "flex", fontSize: 17, color: "#f2b799", fontWeight: 700 }}>→ {siteUrl}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: [{ name: "DejaVu Sans", data: loadFont(), style: "normal" }] }
  );
}
