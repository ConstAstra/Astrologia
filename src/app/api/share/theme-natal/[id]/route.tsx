import { readFileSync } from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeBigThree } from "@/lib/astro/dominance";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { SIGN_KEYWORD, SIGN_KEYWORD_EN } from "@/lib/astro/interpretations/chart-highlights";
import type { AvatarOverrides } from "@/components/avatar/avatarTraits";
import { renderAvatarDataUri } from "@/components/avatar/renderAvatarDataUri";

export const runtime = "nodejs";

const WIDTH = 1080;
const HEIGHT = 1350;

function serialFromId(id: string): string {
  return id.slice(-8).toUpperCase();
}

// Satori (moteur de next/og) ne sait pas retomber sur les fontes système :
// sans fonte fournie explicitement, les glyphes de signes (♈–♓, hors Latin
// de base) ne s'affichent pas. DejaVu Sans couvre largement l'un et
// l'autre — voir src/assets/fonts/DEJAVU-LICENSE.txt. Runtime Node (pas
// Edge) sur cette route : lecture disque directe plutôt que fetch(), qui ne
// gère pas les URL file:// sous Node.
let fontData: Buffer | null = null;
function loadFont(): Buffer {
  fontData ??= readFileSync(path.join(process.cwd(), "src/assets/fonts/DejaVuSans.ttf"));
  return fontData;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;

  const [profile, user] = await Promise.all([
    prisma.profile.findFirst({ where: { id, userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const locale: "fr" | "en" = user.locale === "en" ? "en" : "fr";
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const keywordMap = locale === "en" ? SIGN_KEYWORD_EN : SIGN_KEYWORD;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "astrologium.app").replace(/^https?:\/\//, "");

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

  const big3 = computeBigThree(chart.points, chart.hasReliableHouses);

  let overrides: AvatarOverrides | undefined;
  if (profile.avatarOverrides) {
    try {
      overrides = JSON.parse(profile.avatarOverrides) as AvatarOverrides;
    } catch {
      overrides = undefined;
    }
  }
  const avatarUri = renderAvatarDataUri(profile.id, big3.sun, 220, big3.moon, big3.ascendant ?? undefined, overrides);

  // Les 3 "caractéristiques" de la carte : un mot par point du Big 3, sans
  // aucun terme technique (pas de planète ni d'aspect) — lisible par
  // n'importe qui, contrairement au détail technique du thème complet.
  const traits = [
    {
      label: locale === "en" ? "Sun" : "Soleil",
      sign: signMap[big3.sun].name,
      symbol: signMap[big3.sun].symbol,
      keyword: keywordMap[big3.sun],
    },
    {
      label: locale === "en" ? "Moon" : "Lune",
      sign: signMap[big3.moon].name,
      symbol: signMap[big3.moon].symbol,
      keyword: keywordMap[big3.moon],
    },
    big3.ascendant
      ? {
          label: "Ascendant",
          sign: signMap[big3.ascendant].name,
          symbol: signMap[big3.ascendant].symbol,
          keyword: keywordMap[big3.ascendant],
        }
      : null,
  ].filter((t): t is { label: string; sign: string; symbol: string; keyword: string } => t !== null);

  const fieldLabel = locale === "en" ? "NAME" : "NOM";
  const dobLabel = locale === "en" ? "BORN" : "NÉ(E) LE";
  const cardTitle = locale === "en" ? "ASTRAL ID CARD" : "CARTE D'IDENTITÉ ASTRALE";
  const ctaLine = locale === "en" ? "Get yours, free" : "La tienne, gratuite";
  const legalLine = locale === "en" ? "No legal value" : "Sans valeur légale";

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
        {/* La carte elle-même : un objet posé sur le fond, pas le fond en entier — cadre visible, ombre, coins arrondis. */}
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
          {/* Glyphe géant du signe solaire en filigrane — emblème plutôt que
              texte, signature visuelle immédiatement reconnaissable même en
              miniature dans un fil ou une story. */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: -70,
              bottom: -60,
              fontSize: 420,
              color: "#ffffff0f",
              lineHeight: 1,
            }}
          >
            {signMap[big3.sun].symbol}
          </div>

          {/* Bandeau d'en-tête, façon carte officielle */}
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
              justifyContent: "space-around",
            }}
          >
            {/* Photo + champs, comme une vraie carte d'identité */}
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUri}
                width={220}
                height={220}
                alt=""
                style={{ borderRadius: 24, border: "2px solid #ffffff33" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", fontSize: 16, color: "#c9a8ad", letterSpacing: 2 }}>
                    {fieldLabel}
                  </div>
                  <div style={{ display: "flex", fontSize: 44 }}>{profile.label}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", fontSize: 16, color: "#c9a8ad", letterSpacing: 2 }}>{dobLabel}</div>
                  <div style={{ display: "flex", fontSize: 26, color: "#f2b799" }}>{profile.birthDate}</div>
                </div>
                <div style={{ display: "flex", fontSize: 18, color: "#71768e", letterSpacing: 1 }}>
                  N° {serialFromId(profile.id)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
              {traits.map((trait) => (
                <div
                  key={trait.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #ffffff22",
                    borderRadius: 20,
                    padding: "22px 32px",
                    background: "#ffffff0a",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", fontSize: 18, color: "#c9a8ad", letterSpacing: 1 }}>
                      {trait.label.toUpperCase()} · {trait.sign}
                    </div>
                    <div style={{ display: "flex", fontSize: 40, color: "#f2b799" }}>{trait.keyword}</div>
                  </div>
                  <div style={{ display: "flex", fontSize: 44, color: "#f2b79988" }}>{trait.symbol}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pied de carte à double rôle : lisible comme un mot de la
              personne qui partage ("j'ai fait la mienne, à toi de jouer"),
              et fonctionne comme une pub pour quiconque voit l'image sans
              connaître Astrologium — le lien est le seul élément doré. */}
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
