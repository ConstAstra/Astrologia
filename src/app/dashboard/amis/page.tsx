import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { getOrCreateFriendInvite, listFriendSelfProfiles } from "@/lib/friends";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeBigThree } from "@/lib/astro/dominance";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { SIGN_KEYWORD, SIGN_KEYWORD_EN } from "@/lib/astro/interpretations/chart-highlights";
import type { AvatarOverrides } from "@/components/avatar/avatarTraits";
import { Card, Eyebrow } from "@/components/ui/Card";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import { InviteFriendCard } from "@/components/account/InviteFriendCard";
import { CompatInviteCard } from "@/components/account/CompatInviteCard";
import { RemoveFriendButton } from "@/components/account/RemoveFriendButton";
import type { Locale } from "@/lib/astro/interpretations/compose";

const TEXT: Record<
  Locale,
  {
    title: string;
    inviteFriendTitle: string;
    compatInviteTitle: string;
    empty: string;
    emptyBody: string;
    sunOf: (sign: string) => string;
    seeCompatibility: string;
    seeFullChart: string;
  }
> = {
  fr: {
    title: "Mes amis",
    inviteFriendTitle: "Devenir amis",
    compatInviteTitle: "Partager un test rapide",
    empty: "Pas encore d'ami sur Astrologium.",
    emptyBody: "Partage ton lien ci-dessus — dès qu'un ami l'accepte, sa carte apparaît ici.",
    sunOf: (sign) => `Soleil en ${sign}`,
    seeCompatibility: "Voir la compatibilité",
    seeFullChart: "Voir son thème complet",
  },
  en: {
    title: "My friends",
    inviteFriendTitle: "Become friends",
    compatInviteTitle: "Share a quick test",
    empty: "No friends on Astrologium yet.",
    emptyBody: "Share your link above — as soon as a friend accepts, their card shows up here.",
    sunOf: (sign) => `Sun in ${sign}`,
    seeCompatibility: "See compatibility",
    seeFullChart: "See their full chart",
  },
};

export default async function AmisPage() {
  const userId = await requireUserId();
  const [user, invite, friends, myProfiles] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    getOrCreateFriendInvite(userId),
    listFriendSelfProfiles(userId),
    prisma.profile.findMany({ where: { userId, isSelf: true, archivedAt: null }, take: 1 }),
  ]);

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const keywordMap = locale === "en" ? SIGN_KEYWORD_EN : SIGN_KEYWORD;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const inviteUrl = `${siteUrl}/amis/${invite.token}`;
  const compatInviteUrl = `${siteUrl}/c/${user.referralCode}`;
  const myself = myProfiles[0];

  const cards = friends.map((friend) => {
    const chart = computeNatalChart(
      {
        date: friend.profile.birthDate,
        time: friend.profile.birthTime,
        tzName: friend.profile.tzName,
        latitude: friend.profile.latitude,
        longitude: friend.profile.longitude,
        timeUnknown: friend.profile.timeUnknown,
      },
      "placidus"
    );
    const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
    const overrides = friend.profile.avatarOverrides
      ? (JSON.parse(friend.profile.avatarOverrides) as AvatarOverrides)
      : undefined;
    return {
      userId: friend.userId,
      profileId: friend.profile.id,
      displayName: friend.name?.trim() || friend.profile.label,
      sunSign: signMap[big3.sun].name,
      sunKeyword: keywordMap[big3.sun],
      moonSign: big3.moon,
      ascSign: big3.ascendant ?? undefined,
      sharesFullChart: friend.profile.shareWithFriends,
      avatarProps: {
        seed: friend.profile.id,
        sunSign: big3.sun,
        moonSign: big3.moon,
        ascSign: big3.ascendant ?? undefined,
        overrides,
      },
    };
  });

  return (
    <div>
      <Eyebrow>{t.title}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{t.title}</h1>

      <Card className="mt-6 p-6">
        <p className="mb-3 text-sm font-medium">{t.inviteFriendTitle}</p>
        <InviteFriendCard inviteUrl={inviteUrl} locale={locale} />
      </Card>

      <Card className="mt-4 p-6">
        <p className="mb-3 text-sm font-medium">{t.compatInviteTitle}</p>
        <CompatInviteCard inviteUrl={compatInviteUrl} locale={locale} />
      </Card>

      {cards.length === 0 ? (
        <Card className="mt-6 p-8 text-center">
          <p className="text-muted">{t.empty}</p>
          <p className="mt-2 text-sm text-muted/70">{t.emptyBody}</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {cards.map((f) => (
            <Card key={f.userId} className="flex items-start gap-4 p-5">
              <PixelAvatar {...f.avatarProps} size={72} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display truncate text-xl">{f.displayName}</p>
                  <RemoveFriendButton friendUserId={f.userId} locale={locale} />
                </div>
                <p className="text-sm text-gold-strong">{t.sunOf(f.sunSign)}</p>
                <p className="mt-0.5 text-xs text-muted">{f.sunKeyword}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {myself && (
                    <Link
                      href={`/dashboard/synastrie?a=${myself.id}&b=${f.profileId}`}
                      className="text-xs text-gold-strong underline"
                    >
                      {t.seeCompatibility}
                    </Link>
                  )}
                  {f.sharesFullChart && (
                    <Link href={`/dashboard/theme-natal/${f.profileId}`} className="text-xs text-sage underline">
                      {t.seeFullChart}
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
