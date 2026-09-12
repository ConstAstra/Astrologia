import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/db";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Le jeton en clair n'est jamais stocké (seulement son hash), comme un mot
// de passe : il ne transite que dans l'e-mail envoyé et l'URL visitée.
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;

  // updateMany avec usedAt: null dans le WHERE plutôt qu'un update direct :
  // deux requêtes concurrentes avec le même jeton liraient toutes les deux
  // usedAt=null avant que l'une des deux ne committe, permettant au même
  // lien de réinitialisation de servir deux fois.
  const claimed = await prisma.passwordResetToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count === 0) return null;
  return record.userId;
}
