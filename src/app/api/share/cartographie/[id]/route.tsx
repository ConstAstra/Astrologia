import { readFileSync } from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasFeatureAccess } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAstrocartography } from "@/lib/astro/astrocartography";
import { computeCountryLineMatches, rankHappiestCountries } from "@/lib/astro/astrocartography-countries";
import { getThemeTags, CATEGORY_LABELS } from "@/lib/astro/interpretations/astrocartography-categories";
import { MAJOR_COUNTRIES } from "@/components/map/majorCountries";
import { MAJOR_COUNTRIES_EN } from "@/components/map/majorCountries.en";
import { renderQrDataUri } from "@/lib/qr";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (shareCardLimiter.isLimited(userId)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") === "story" ? "story" : "post";
  const { width: WIDTH, height: HEIGHT } = DIMENSIONS[format];
  const isStory = format === "story";
  const s = <T,>(post: T, story: T): T => (isStory ? story : post);

  const [profile, user] = await Promise.all([
    prisma.profile.findFirst({ where: { id, userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  if (profile.timeUnknown) {
    return NextResponse.json({ error: "Heure de naissance inconnue : cartographie indisponible." }, { status: 422 });
  }

  // Même règle que la page cartographie elle-même : la carte postale n'est
  // accessible qu'une fois la cartographie débloquée pour ce profil.
  const access = await hasFeatureAccess(userId, { feature: "astrocartography", primaryProfileId: profile.id });
  if (!access) return NextResponse.json({ error: "Cartographie non débloquée" }, { status: 403 });

  const locale: "fr" | "en" = user.locale === "en" ? "en" : "fr";
  const countryList = locale === "en" ? MAJOR_COUNTRIES_EN : MAJOR_COUNTRIES;
  const countryName = (countryId: string) => countryList.find((c) => c.id === countryId)?.name ?? countryId;

  const chart = computeNatalChart(
    {
      date: profile.birthDate,
      time: profile.birthTime,
      tzName: profile.tzName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timeUnknown: profile.timeUnknown,
    },
    "placidus"
  );
  const lines = computeAstrocartography(chart);
  const countryMatches = computeCountryLineMatches(lines);
  const top3 = rankHappiestCountries(countryMatches).slice(0, 3);

  const categoryLabels = CATEGORY_LABELS[locale];
  const categoriesFor = (countryId: string) => {
    const categories = new Set<string>();
    for (const m of countryMatches[countryId] ?? []) {
      for (const tag of getThemeTags(m.planet, m.type)) {
        if (tag.valence === "positive") categories.add(categoryLabels[tag.category]);
      }
    }
    return Array.from(categories).slice(0, 2).join(" · ");
  };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "astrologium.app").replace(/^https?:\/\//, "");
  const shareUrl = `${siteUrl}/r/${user.referralCode}`;
  const qrDataUri = renderQrDataUri(`https://${shareUrl}`);

  const cardTitle = locale === "en" ? "ASTROCARTOGRAPHY" : "CARTOGRAPHIE ASTRALE";
  const heading = locale === "en" ? "3 places where I'm happiest" : "Mes 3 endroits les plus heureux";
  const subheading =
    locale === "en"
      ? "According to my real astrocartography lines"
      : "D'après mes vraies lignes d'astrocartographie";
  const ctaLine = locale === "en" ? "Calculate yours, free" : "Calcule les tiens, gratuit";
  const legalLine = locale === "en" ? "For fun, not a prediction" : "Pour le fun, pas une prédiction";
  const emptyText =
    locale === "en"
      ? "No standout happy place in this profile's line list yet."
      : "Aucun endroit ne ressort particulièrement dans ce thème pour l'instant.";

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
            background: "linear-gradient(160deg, #4a8f7a 0%, #55324e 45%, #1f1420 100%)",
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
              gap: s(16, 28),
            }}
          >
            <div style={{ display: "flex", fontSize: s(38, 52), textAlign: "center", maxWidth: s(760, 820) }}>
              {heading}
            </div>
            <div style={{ display: "flex", fontSize: s(16, 20), color: "#c9d3c5" }}>{subheading}</div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                width: "100%",
                maxWidth: s(760, 820),
                marginTop: 16,
              }}
            >
              {top3.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", fontSize: s(20, 26), color: "#c9a8ad" }}>
                  {emptyText}
                </div>
              ) : (
                top3.map((ranking, i) => (
                  <div
                    key={ranking.countryId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #ffffff22",
                      borderRadius: 20,
                      padding: s("18px 28px", "26px 34px"),
                      background: "#ffffff0a",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: s(16, 22) }}>
                      <div style={{ display: "flex", fontSize: s(36, 48), color: "#9fd6c6" }}>{i + 1}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", fontSize: s(28, 38) }}>{countryName(ranking.countryId)}</div>
                        <div style={{ display: "flex", fontSize: s(14, 18), color: "#c9a8ad" }}>{categoriesFor(ranking.countryId)}</div>
                      </div>
                    </div>
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
                <div style={{ display: "flex", fontSize: 17, color: "#9fd6c6", fontWeight: 700 }}>→ {shareUrl}</div>
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
