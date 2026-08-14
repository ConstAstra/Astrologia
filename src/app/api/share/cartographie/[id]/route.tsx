import { readFileSync } from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasFeatureAccess, isAvatarGlowing } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAstrocartography } from "@/lib/astro/astrocartography";
import { computeCountryLineMatches, rankHappiestCountries } from "@/lib/astro/astrocartography-countries";
import { getThemeTags, CATEGORY_LABELS } from "@/lib/astro/interpretations/astrocartography-categories";
import { computeBigThree } from "@/lib/astro/dominance";
import { renderAvatarDataUri } from "@/components/avatar/renderAvatarDataUri";
import type { AvatarOverrides } from "@/components/avatar/avatarTraits";
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

// Trois polices : DejaVu pour le petit texte imprimé (et filet de secours
// pour tout glyphe accentué manquant ailleurs), Unbounded pour l'en-tête façon
// tampon/logo (même police que le site), Caveat pour le mot manuscrit — le
// contraste écriture/imprimé est ce qui fait passer la carte de "capture
// d'écran" à "vraie carte postale".
const FONT_FILES = {
  dejaVu: "DejaVuSans.ttf",
  unbounded: "Unbounded-Bold.ttf",
  caveat: "Caveat-Bold.ttf",
} as const;

const fontCache = new Map<string, Buffer>();
function loadFont(key: keyof typeof FONT_FILES): Buffer {
  const cached = fontCache.get(key);
  if (cached) return cached;
  const data = readFileSync(path.join(process.cwd(), "src/assets/fonts", FONT_FILES[key]));
  fontCache.set(key, data);
  return data;
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
    prisma.profile.findFirst({ where: { id, userId, archivedAt: null } }),
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

  const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
  const avatarOverrides = profile.avatarOverrides ? (JSON.parse(profile.avatarOverrides) as AvatarOverrides) : undefined;
  const avatarDataUri = renderAvatarDataUri(
    profile.id,
    big3.sun,
    112,
    big3.moon,
    big3.ascendant ?? undefined,
    avatarOverrides,
    isAvatarGlowing(user)
  );

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

  const postmarkDate = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date())
    .toUpperCase()
    .replace(/\.$/, "");

  const salutation = locale === "en" ? "Dear you," : "Cher toi,";
  const intro =
    locale === "en"
      ? "Here's where I'd be happiest, according to my real astrocartography lines:"
      : "Voici, d'après mes vraies lignes d'astrocartographie, les endroits où je serais le plus heureux·se :";
  const stampLabel = locale === "en" ? "1 CHART" : "1 THÈME";
  const postmarkCity = locale === "en" ? "ASTROLOGIUM" : "ASTROLOGIUM";
  const addressToLabel = locale === "en" ? "To" : "À";
  const addressToValue = locale === "en" ? "You" : "Toi";
  const addressFromLabel = locale === "en" ? "Sent via" : "Envoyée via";
  const ctaLine = locale === "en" ? "Calculate yours, free" : "Calcule les tiens, gratuit";
  const legalLine = locale === "en" ? "For fun, not a prediction" : "Pour le fun, pas une prédiction";
  const emptyText =
    locale === "en"
      ? "No standout happy place in this profile's line list yet."
      : "Aucun endroit ne ressort particulièrement dans ce thème pour l'instant.";

  const INK = "#4a3524";
  const INK_SOFT = "#7a5c40";
  const PAPER_LINE = "#c9a876";

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
        {/* Cadre à chevrons façon enveloppe "par avion" — le détail qui fait */}
        {/* reconnaître une carte postale au premier coup d'œil. */}
        <div
          style={{
            display: "flex",
            padding: 14,
            borderRadius: 24,
            boxShadow: "0 40px 100px -30px #00000090",
            background:
              "repeating-linear-gradient(45deg, #b23a48 0px, #b23a48 16px, #f7eeda 16px, #f7eeda 24px, #23345c 24px, #23345c 40px, #f7eeda 40px, #f7eeda 48px)",
          }}
        >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            width: WIDTH - 168,
            height: HEIGHT - 168,
            borderRadius: 16,
            overflow: "hidden",
            border: `2px solid ${PAPER_LINE}`,
            background: "linear-gradient(155deg, #f7eeda 0%, #efe0bf 55%, #e5d0a3 100%)",
            color: INK,
          }}
        >
          {/* En-tête façon lettre à motifs : logo + mention "carte postale" */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "30px 44px",
              borderBottom: `2px dashed ${PAPER_LINE}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: "linear-gradient(135deg, #4a8f7a, #2f5c4d)",
                  transform: "rotate(45deg)",
                }}
              />
              <div style={{ display: "flex", fontFamily: "Unbounded", fontSize: 22, color: INK }}>Astrologium</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", fontSize: 15, color: INK_SOFT, letterSpacing: 4 }}>CARTE POSTALE</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarDataUri}
                width={56}
                height={56}
                alt=""
                style={{ borderRadius: 14, border: `2px solid ${INK}` }}
              />
            </div>
          </div>

          {/* Corps façon dos de carte postale : message manuscrit à gauche, timbre + tampon + adresse à droite */}
          <div style={{ display: "flex", flex: 1, padding: s("36px 40px", "44px 40px") }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 58%",
                paddingRight: 28,
                borderRight: `2px dashed ${PAPER_LINE}`,
              }}
            >
              <div style={{ display: "flex", fontFamily: "Caveat", fontSize: s(46, 58), color: "#6b3a2b" }}>
                {salutation}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Caveat",
                  fontSize: s(28, 34),
                  color: "#6b3a2b",
                  marginTop: 10,
                  lineHeight: 1.3,
                }}
              >
                {intro}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: s(18, 26), marginTop: s(22, 32) }}>
                {top3.length === 0 ? (
                  <div style={{ display: "flex", fontFamily: "Caveat", fontSize: s(30, 36), color: "#6b3a2b" }}>
                    {emptyText}
                  </div>
                ) : (
                  top3.map((ranking, i) => (
                    <div key={ranking.countryId} style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <div style={{ display: "flex", fontFamily: "Caveat", fontSize: s(34, 42), color: "#2f5c4d" }}>
                          {i + 1}.
                        </div>
                        <div style={{ display: "flex", fontFamily: "Caveat", fontSize: s(38, 46), color: INK }}>
                          {countryName(ranking.countryId)}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          fontSize: s(13, 16),
                          color: INK_SOFT,
                          letterSpacing: 1,
                          marginLeft: 30,
                        }}
                      >
                        {categoriesFor(ranking.countryId).toUpperCase()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: "1 1 42%", paddingLeft: 28 }}>
              {/* Bloc timbre + tampon, superposés comme sur une vraie enveloppe */}
              <div style={{ display: "flex", position: "relative", height: s(150, 180), justifyContent: "flex-end" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    width: s(108, 128),
                    height: s(136, 160),
                    background: "linear-gradient(160deg, #4a8f7a 0%, #2f5c4d 100%)",
                    border: "4px dashed #f7eeda",
                    color: "#f7eeda",
                    transform: "rotate(4deg)",
                  }}
                >
                  <div style={{ display: "flex", fontSize: s(22, 26) }}>✦</div>
                  <div style={{ display: "flex", fontFamily: "Unbounded", fontSize: s(11, 13), letterSpacing: 1 }}>
                    ASTRO
                  </div>
                  <div style={{ display: "flex", fontSize: s(10, 12), letterSpacing: 1, color: "#cfe9df" }}>
                    {stampLabel}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    width: s(120, 142),
                    height: s(120, 142),
                    borderRadius: "50%",
                    border: `3px dashed ${INK}aa`,
                    transform: "rotate(-12deg)",
                  }}
                >
                  <div style={{ display: "flex", fontSize: s(11, 13), letterSpacing: 2, color: INK }}>
                    {postmarkCity}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: s(70, 86),
                      height: 0,
                      borderTop: `1px solid ${INK}`,
                    }}
                  />
                  <div style={{ display: "flex", fontSize: s(12, 14), letterSpacing: 1, color: INK }}>
                    {postmarkDate}
                  </div>
                </div>

                {/* Traits d'oblitération à l'encre, comme un vrai cachet de la poste */}
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    left: s(6, 8),
                    top: s(28, 34),
                    width: s(96, 116),
                    height: 0,
                    borderTop: `2px solid ${INK}66`,
                    transform: "rotate(-14deg)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    left: s(6, 8),
                    top: s(46, 56),
                    width: s(96, 116),
                    height: 0,
                    borderTop: `2px solid ${INK}66`,
                    transform: "rotate(-14deg)",
                  }}
                />
              </div>

              {/* Bloc adresse, façon lignes pointillées imprimées */}
              <div style={{ display: "flex", flexDirection: "column", gap: s(14, 20), marginTop: s(28, 44) }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", fontSize: s(11, 13), color: INK_SOFT, letterSpacing: 2 }}>
                    {addressToLabel.toUpperCase()}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontFamily: "Caveat",
                      fontSize: s(30, 36),
                      color: INK,
                      borderBottom: `1px dashed ${PAPER_LINE}`,
                      paddingBottom: 4,
                    }}
                  >
                    {addressToValue}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", fontSize: s(11, 13), color: INK_SOFT, letterSpacing: 2 }}>
                    {addressFromLabel.toUpperCase()}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: s(15, 18),
                      color: INK,
                      borderBottom: `1px dashed ${PAPER_LINE}`,
                      paddingBottom: 4,
                    }}
                  >
                    astrologium.app
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "22px 44px 30px",
              borderTop: `2px dashed ${PAPER_LINE}`,
            }}
          >
            <div style={{ display: "flex", fontSize: 14, color: INK_SOFT, letterSpacing: 1 }}>{legalLine}</div>
            <div style={{ display: "flex", alignItems: "center", gap: s(14, 18) }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ display: "flex", fontSize: 16, color: INK }}>{ctaLine}</div>
                <div style={{ display: "flex", fontSize: 16, color: "#2f5c4d", fontWeight: 700 }}>→ {shareUrl}</div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUri}
                width={s(60, 76)}
                height={s(60, 76)}
                alt=""
                style={{ borderRadius: 8, border: `3px solid ${INK}` }}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "DejaVu Sans", data: loadFont("dejaVu"), style: "normal" },
        { name: "Unbounded", data: loadFont("unbounded"), style: "normal", weight: 700 },
        { name: "Caveat", data: loadFont("caveat"), style: "normal", weight: 700 },
      ],
    }
  );
}
