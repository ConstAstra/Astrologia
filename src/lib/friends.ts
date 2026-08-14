import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { notifyFriendActivity } from "@/lib/notify";
import { escapeHtml } from "@/lib/html";

const ACCEPT_PUSH_TEXT = {
  fr: { title: "🔮 Nouvelle amitié", body: (name: string) => `${name} a accepté ton invitation sur Astrologium.` },
  en: { title: "🔮 New friend", body: (name: string) => `${name} accepted your invitation on Astrologium.` },
} as const;

const ACCEPT_EMAIL_TEXT = {
  fr: {
    subject: (name: string) => `${name} a accepté ton invitation sur Astrologium`,
    body: (name: string, siteUrl: string) => `
      <p>Bonne nouvelle : <strong>${name}</strong> a accepté ton invitation d'ami sur Astrologium.</p>
      <p>Vous avez maintenant chacun accès à la carte d'identité astrale de l'autre, et vous pouvez voir votre compatibilité sans ressaisir de date de naissance.</p>
      <p><a href="${siteUrl}/dashboard/amis">Voir mes amis</a></p>
    `,
  },
  en: {
    subject: (name: string) => `${name} accepted your invitation on Astrologium`,
    body: (name: string, siteUrl: string) => `
      <p>Good news: <strong>${name}</strong> accepted your friend invitation on Astrologium.</p>
      <p>You now each have access to the other's astral ID card, and can see your compatibility without re-entering a birth date.</p>
      <p><a href="${siteUrl}/dashboard/amis">See my friends</a></p>
    `,
  },
} as const;

const INVITE_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 jours

function generateToken(): string {
  return randomBytes(8).toString("hex");
}

/**
 * Renvoie le lien d'invitation actif de l'utilisateur (réutilisable, comme
 * un code de parrainage), ou en crée un nouveau si aucun n'est encore actif
 * ou si le précédent a expiré.
 */
export async function getOrCreateFriendInvite(userId: string) {
  const existing = await prisma.friendInvite.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  return prisma.friendInvite.create({
    data: { userId, token: generateToken(), expiresAt: new Date(Date.now() + INVITE_TTL_MS) },
  });
}

/** userA < userB toujours, même logique que canonicalPair() pour Unlock — évite qu'une paire existe deux fois en sens inverse. */
function canonicalFriendPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function areFriends(userIdA: string, userIdB: string): Promise<boolean> {
  const [userAId, userBId] = canonicalFriendPair(userIdA, userIdB);
  const friendship = await prisma.friendship.findUnique({ where: { userAId_userBId: { userAId, userBId } } });
  return friendship !== null;
}

/**
 * Accepte une invitation : crée l'amitié (idempotent — si elle existe déjà,
 * ne fait rien, et n'envoie pas de second e-mail) entre l'utilisateur qui a
 * généré le lien et celui qui l'accepte. Refuse qu'on s'ajoute soi-même en
 * ami (lien ouvert dans un nouvel onglet par l'auteur de l'invitation, par
 * exemple).
 */
export async function acceptFriendInvite(token: string, acceptingUserId: string) {
  const invite = await prisma.friendInvite.findUnique({ where: { token } });
  if (!invite || invite.expiresAt < new Date()) return { ok: false as const, reason: "invalid" as const };
  if (invite.userId === acceptingUserId) return { ok: false as const, reason: "self" as const };

  const [userAId, userBId] = canonicalFriendPair(invite.userId, acceptingUserId);
  const alreadyExisted = (await prisma.friendship.findUnique({ where: { userAId_userBId: { userAId, userBId } } })) !== null;

  await prisma.friendship.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: { userAId, userBId },
    update: {},
  });

  if (!alreadyExisted) {
    const [inviter, accepter] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: invite.userId } }),
      prisma.user.findUniqueOrThrow({ where: { id: acceptingUserId } }),
    ]);
    const locale = inviter.locale === "en" ? "en" : "fr";
    const t = ACCEPT_EMAIL_TEXT[locale];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const accepterName = accepter.name?.trim() || accepter.email;
    // Ne bloque jamais l'acceptation elle-même si l'envoi échoue (fournisseur
    // indisponible, etc.) — l'amitié est déjà actée à ce stade. Le nom est
    // choisi librement par l'accepteur et envoyé dans le corps HTML d'un
    // e-mail à UN TIERS (l'inviteur) : échappement obligatoire pour ce corps,
    // pas pour le sujet (texte brut) ni pour la notification push (idem).
    await sendEmail({
      to: inviter.email,
      subject: t.subject(accepterName),
      html: t.body(escapeHtml(accepterName), siteUrl),
    }).catch(() => {});

    const pushT = ACCEPT_PUSH_TEXT[locale];
    await notifyFriendActivity(invite.userId, {
      title: pushT.title,
      body: pushT.body(accepterName),
      url: "/dashboard/amis",
    }).catch(() => {});
  }

  return { ok: true as const, inviterUserId: invite.userId };
}

/** Retire une amitié — dans un sens comme dans l'autre, aucune notion de "propriétaire" du lien une fois l'amitié actée. */
export async function removeFriendship(userIdA: string, userIdB: string): Promise<void> {
  const [userAId, userBId] = canonicalFriendPair(userIdA, userIdB);
  await prisma.friendship.deleteMany({ where: { userAId, userBId } });
}

export interface FriendSelfProfile {
  id: string;
  label: string;
  birthDate: string;
  birthTime: string | null;
  timeUnknown: boolean;
  latitude: number;
  longitude: number;
  tzName: string;
  avatarOverrides: string | null;
  shareWithFriends: boolean;
}

/**
 * Un ami accepté peut consulter le thème natal et les transits complets
 * d'un profil s'il s'agit du profil "soi" de son ami ET que celui-ci a
 * explicitement activé le partage (shareWithFriends) — jamais implicite,
 * jamais pour un profil de tiers (mère, ex...) même si isSelf a été mal
 * coché par erreur ailleurs dans l'app.
 */
export async function canViewProfile(
  viewerId: string,
  profile: { userId: string; isSelf: boolean; shareWithFriends: boolean }
): Promise<boolean> {
  if (profile.userId === viewerId) return true;
  if (!profile.isSelf || !profile.shareWithFriends) return false;
  return areFriends(viewerId, profile.userId);
}

export interface FriendSummary {
  userId: string;
  name: string | null;
  profile: FriendSelfProfile;
}

/** Les profils "soi" (isSelf) de tous les amis acceptés — jamais leurs autres profils enregistrés (mère, ex, etc.), qui restent privés. */
export async function listFriendSelfProfiles(userId: string): Promise<FriendSummary[]> {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      userA: { select: { id: true, name: true, profiles: { where: { isSelf: true, archivedAt: null }, take: 1 } } },
      userB: { select: { id: true, name: true, profiles: { where: { isSelf: true, archivedAt: null }, take: 1 } } },
    },
  });

  return friendships
    .map((f): FriendSummary | null => {
      const friend = f.userAId === userId ? f.userB : f.userA;
      const p = friend.profiles[0];
      if (!p) return null;
      return {
        userId: friend.id,
        name: friend.name,
        profile: {
          id: p.id,
          label: p.label,
          birthDate: p.birthDate,
          birthTime: p.birthTime,
          timeUnknown: p.timeUnknown,
          latitude: p.latitude,
          longitude: p.longitude,
          tzName: p.tzName,
          avatarOverrides: p.avatarOverrides,
          shareWithFriends: p.shareWithFriends,
        },
      };
    })
    .filter((f): f is FriendSummary => f !== null);
}
