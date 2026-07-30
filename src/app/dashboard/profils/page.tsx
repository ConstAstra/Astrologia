import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { FREE_PROFILE_LIMIT } from "@/lib/billing/entitlements";
import { DeleteProfileButton } from "@/components/dashboard/DeleteProfileButton";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import { quickSunSign } from "@/lib/astro/quick";
import { SIGN_META } from "@/lib/astro/interpretations/signs";

export default async function ProfilsPage() {
  const userId = await requireUserId();
  const profiles = await prisma.profile.findMany({
    where: { userId },
    orderBy: [{ isSelf: "desc" }, { createdAt: "asc" }],
  });

  const withSigns = profiles.map((profile) => ({
    profile,
    sunSign: quickSunSign({
      date: profile.birthDate,
      time: profile.birthTime,
      tzName: profile.tzName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timeUnknown: profile.timeUnknown,
    }),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>Vos profils</Eyebrow>
          <h1 className="font-display mt-2 text-3xl">Thèmes enregistrés</h1>
          <p className="mt-1 text-sm text-muted">
            {`${profiles.length} / ${FREE_PROFILE_LIMIT} profils sur l'offre gratuite.`}
          </p>
        </div>
        <ButtonLink href="/dashboard/profils/nouveau">+ Ajouter un profil</ButtonLink>
      </div>

      {profiles.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <p className="text-muted">
            Aucun profil pour le moment. Ajoutez votre date, heure et lieu de naissance pour révéler votre
            thème astral.
          </p>
          <div className="mt-5">
            <ButtonLink href="/dashboard/profils/nouveau">Créer mon premier thème</ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withSigns.map(({ profile, sunSign }) => (
            <Card key={profile.id} className="flex flex-col p-6">
              <div className="flex items-center gap-4">
                <PixelAvatar seed={profile.id} sunSign={sunSign} size={64} />
                <div>
                  <p className="font-display text-xl">{profile.label}</p>
                  <p className="text-xs text-gold-strong">{SIGN_META[sunSign].name}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">
                {profile.birthDate}
                {profile.timeUnknown ? " · heure inconnue" : ` · ${profile.birthTime}`}
              </p>
              <p className="text-sm text-muted">{profile.locationName}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/dashboard/theme-natal/${profile.id}`}
                  className="rounded-full border border-gold/40 px-3 py-1 text-gold-strong hover:bg-gold/10"
                >
                  Thème natal
                </Link>
                <Link
                  href={`/dashboard/cartographie/${profile.id}`}
                  className="rounded-full border border-border-soft px-3 py-1 text-muted hover:text-foreground"
                >
                  Cartographie
                </Link>
                <DeleteProfileButton profileId={profile.id} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {profiles.length >= 2 && (
        <Card className="mt-8 p-6">
          <p className="font-display text-xl">Comparer deux profils</p>
          <p className="mt-1 text-sm text-muted">Choisissez deux avatars pour lancer une synastrie ou un thème composite.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/synastrie" variant="secondary">
              Synastrie
            </ButtonLink>
            <ButtonLink href="/dashboard/composite" variant="secondary">
              Thème composite
            </ButtonLink>
          </div>
        </Card>
      )}
    </div>
  );
}
