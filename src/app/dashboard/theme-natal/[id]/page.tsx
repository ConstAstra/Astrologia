import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAspects } from "@/lib/astro/aspects";
import { PLANET_KEYS } from "@/lib/astro/types";
import type { HouseSystem, PointKey } from "@/lib/astro/types";
import { signOf } from "@/lib/astro/signs";
import { formatLongitude } from "@/lib/astro/signs";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import {
  describeAspect,
  describeDegree,
  describeHouseSystem,
  describeLifeMission,
  describePlanetInHouse,
  describePlanetInSign,
} from "@/lib/astro/interpretations/compose";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { OverviewCard } from "@/components/chart/OverviewCard";
import { WidgetUrlCard } from "@/components/account/WidgetUrlCard";

const HOUSE_SYSTEMS: { id: HouseSystem; label: string }[] = [
  { id: "placidus", label: "Placidus" },
  { id: "whole-sign", label: "Signes entiers" },
  { id: "equal", label: "Maisons égales" },
  { id: "porphyry", label: "Porphyre" },
];

const DISPLAY_POINTS: PointKey[] = [...PLANET_KEYS, "asc", "mc"];

export default async function ThemeNatalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ maisons?: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const { maisons } = await searchParams;

  const profile = await prisma.profile.findFirst({ where: { id, userId } });
  if (!profile) notFound();

  const houseSystem: HouseSystem = (HOUSE_SYSTEMS.find((h) => h.id === maisons)?.id ?? "placidus");

  const chart = computeNatalChart(
    {
      date: profile.birthDate,
      time: profile.birthTime,
      tzName: profile.tzName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timeUnknown: profile.timeUnknown,
    },
    houseSystem
  );

  const aspectKeys: PointKey[] = chart.hasReliableHouses ? DISPLAY_POINTS : [...PLANET_KEYS];
  const aspects = computeAspects(chart.points, aspectKeys);

  const northNode = chart.points.northNode;
  const mission = describeLifeMission(signOf(northNode.longitude), chart.hasReliableHouses ? northNode.house : undefined);

  const wheelPoints = DISPLAY_POINTS.filter((k) => chart.points[k] && (chart.hasReliableHouses || PLANET_KEYS.includes(k as (typeof PLANET_KEYS)[number]))).map(
    (k) => ({ key: k, longitude: chart.points[k].longitude })
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Thème natal</Eyebrow>
          <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
          <p className="mt-1 text-sm text-muted">
            {profile.birthDate} {profile.timeUnknown ? "· heure inconnue" : `à ${profile.birthTime}`} ·{" "}
            {profile.locationName}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/transits/${profile.id}`}
              className="inline-block rounded-full border border-sage/40 px-3 py-1 text-xs text-sage hover:bg-sage/10"
            >
              ☾ Voir les transits du jour
            </Link>
            <a
              href={`/api/share/theme-natal/${profile.id}`}
              download={`${profile.label}-theme-astral.png`}
              className="inline-block rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-strong hover:bg-gold/10"
            >
              ⤓ Partager (image)
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {HOUSE_SYSTEMS.map((h) => (
            <Link
              key={h.id}
              href={`/dashboard/theme-natal/${profile.id}?maisons=${h.id}`}
              className={`rounded-full border px-3 py-1 ${
                houseSystem === h.id
                  ? "border-gold/50 bg-gold/10 text-gold-strong"
                  : "border-border-soft text-muted hover:text-foreground"
              }`}
            >
              {h.label}
            </Link>
          ))}
        </div>
      </div>

      {!chart.hasReliableHouses && (
        <Card className="mt-6 border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
          Heure de naissance inconnue : l&apos;Ascendant, le Milieu du Ciel et les maisons ne sont pas
          affichés, plutôt que d&apos;afficher une estimation trompeuse.
        </Card>
      )}
      {chart.houses.fellBackToWholeSign && (
        <Card className="mt-6 border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
          {describeHouseSystem(chart.houses)}
        </Card>
      )}

      <div className="mt-6">
        <OverviewCard points={chart.points} hasReliableHouses={chart.hasReliableHouses} />
      </div>

      <Card className="mt-6 p-5">
        <WidgetUrlCard
          widgetUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/widget/theme-natal/${profile.id}?token=${profile.widgetToken}`}
        />
      </Card>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[420px_1fr]">
        <Card className="p-4">
          <ChartWheel
            points={wheelPoints}
            ascendant={chart.hasReliableHouses ? chart.houses.ascendant : 0}
            houseCusps={chart.hasReliableHouses ? chart.houses.cusps : Array.from({ length: 12 }, (_, i) => i * 30)}
            aspects={aspects}
          />
          {chart.hasReliableHouses && (
            <p className="mt-3 text-center text-xs text-muted">{describeHouseSystem(chart.houses)}</p>
          )}
        </Card>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl">Positions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DISPLAY_POINTS.map((key) => {
                const point = chart.points[key];
                if (!point) return null;
                if (!chart.hasReliableHouses && (key === "asc" || key === "mc")) return null;
                const meta = PLANET_META[key];
                const sign = signOf(point.longitude);
                return (
                  <Card key={key} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {meta.symbol} {meta.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {point.retrograde && <Badge tone="terracotta">Rx</Badge>}
                        {point.house && <Badge>Maison {point.house}</Badge>}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gold-strong">
                      {formatLongitude(point.longitude)} {sign}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{describePlanetInSign(key, sign)}</p>
                    {point.house && (
                      <p className="mt-2 text-xs leading-relaxed text-muted">{describePlanetInHouse(key, point.house)}</p>
                    )}
                    <p className="mt-2 border-t border-border-soft pt-2 text-xs leading-relaxed text-muted/80">
                      <span className="text-gold-strong/90">Degré — </span>
                      {describeDegree(point.longitude)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">Mission de vie</h2>
            <p className="mt-1 text-xs text-muted">
              Lecture de l&apos;axe des Nœuds lunaires : le Nœud Nord comme direction d&apos;évolution à
              apprivoiser, le Nœud Sud comme terrain déjà acquis à ne pas surinvestir.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">☊ Nœud Nord</p>
                  <Badge tone="gold">
                    {SIGN_META[mission.northSign].name}
                    {mission.northHouse ? ` · Maison ${mission.northHouse}` : ""}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{mission.missionSignText}</p>
                {mission.missionHouseText && (
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.missionHouseText}</p>
                )}
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">☋ Nœud Sud</p>
                  <Badge>
                    {SIGN_META[mission.southSign].name}
                    {mission.southHouse ? ` · Maison ${mission.southHouse}` : ""}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{mission.comfortSignText}</p>
                {mission.comfortHouseText && (
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.comfortHouseText}</p>
                )}
              </Card>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">Aspects</h2>
            <div className="mt-4 space-y-3">
              {aspects.length === 0 && <p className="text-sm text-muted">Aucun aspect détecté dans les orbes retenues.</p>}
              {aspects.map((aspect, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">
                      {PLANET_META[aspect.a].symbol} {PLANET_META[aspect.a].name} {ASPECT_META[aspect.aspect].symbol}{" "}
                      {PLANET_META[aspect.b].symbol} {PLANET_META[aspect.b].name}
                    </p>
                    <Badge tone={ASPECT_META[aspect.aspect].tone === "harmonieux" ? "sage" : ASPECT_META[aspect.aspect].tone === "tendu" ? "terracotta" : "neutral"}>
                      {ASPECT_META[aspect.aspect].name}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{describeAspect(aspect)}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
