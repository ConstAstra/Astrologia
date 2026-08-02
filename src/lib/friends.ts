import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

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
 * ne fait rien) entre l'utilisateur qui a généré le lien et celui qui
 * l'accepte. Refuse qu'on s'ajoute soi-même en ami (lien ouvert dans un
 * nouvel onglet par l'auteur de l'invitation, par exemple).
 */
export async function acceptFriendInvite(token: string, acceptingUserId: string) {
  const invite = await prisma.friendInvite.findUnique({ where: { token } });
  if (!invite || invite.expiresAt < new Date()) return { ok: false as const, reason: "invalid" as const };
  if (invite.userId === acceptingUserId) return { ok: false as const, reason: "self" as const };

  const [userAId, userBId] = canonicalFriendPair(invite.userId, acceptingUserId);
  await prisma.friendship.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: { userAId, userBId },
    update: {},
  });

  return { ok: true as const, inviterUserId: invite.userId };
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
      userA: { select: { id: true, name: true, profiles: { where: { isSelf: true }, take: 1 } } },
      userB: { select: { id: true, name: true, profiles: { where: { isSelf: true }, take: 1 } } },
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
        },
      };
    })
    .filter((f): f is FriendSummary => f !== null);
}
