import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeBigThree } from "@/lib/astro/dominance";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { renderAvatarDataUri } from "@/components/avatar/renderAvatarDataUri";

export const runtime = "nodejs";

const WIDTH = 1080;
const HEIGHT = 1350;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;

  const profile = await prisma.profile.findFirst({ where: { id, userId } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

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
  const avatarUri = renderAvatarDataUri(profile.id, big3.sun, 340);

  const rows = [
    { label: "Soleil", sign: SIGN_META[big3.sun].name },
    { label: "Lune", sign: SIGN_META[big3.moon].name },
    { label: "Ascendant", sign: big3.ascendant ? SIGN_META[big3.ascendant].name : "Heure inconnue" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 64px",
          background: "linear-gradient(160deg, #05060d 0%, #0d1020 55%, #1a1633 100%)",
          fontFamily: "serif",
          color: "#f4f2ea",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 14,
              height: 14,
              background: "linear-gradient(135deg, #e9cd9c, #8c7fdb)",
              transform: "rotate(45deg)",
            }}
          />
          <div style={{ display: "flex", fontSize: 34, letterSpacing: 2 }}>
            <span>Astrolog</span>
            <span style={{ color: "#e9cd9c" }}>ia</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUri} width={340} height={340} alt="" />
          <div style={{ display: "flex", fontSize: 52 }}>{profile.label}</div>
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                border: "1px solid #ffffff22",
                borderRadius: 24,
                padding: "24px 28px",
                background: "#ffffff0a",
                minWidth: 220,
              }}
            >
              <div style={{ display: "flex", fontSize: 22, color: "#a9acc4", letterSpacing: 1 }}>
                {row.label.toUpperCase()}
              </div>
              <div style={{ display: "flex", fontSize: 34, color: "#e9cd9c" }}>{row.sign}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#71768e", letterSpacing: 1 }}>
          Thème astral calculé sur astrologia
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
