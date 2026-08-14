import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { SKIN_TONES, HAIR_COLORS, CLOTHING_COLORS, HAIR_MASKS } from "@/components/avatar/avatarTraits";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide");

// On accepte n'importe quelle couleur hex pour bg (pas de palette fermée, cf.
// ELEMENT_BG côté génération auto), mais on garde des palettes fermées pour
// peau/cheveux/tenue : ce sont les seules proposées par l'éditeur, et ça
// évite qu'une requête forgée injecte une couleur hors design system.
const schema = z.object({
  skin: z.enum(SKIN_TONES as [string, ...string[]]).optional(),
  hairColor: z.enum(HAIR_COLORS as [string, ...string[]]).optional(),
  hairMaskIndex: z
    .number()
    .int()
    .min(0)
    .max(HAIR_MASKS.length - 1)
    .optional(),
  clothing: z.enum(CLOTHING_COLORS as [string, ...string[]]).optional(),
  blush: z.boolean().optional(),
  smiling: z.boolean().optional(),
  raisedBrow: z.boolean().optional(),
  glasses: z.boolean().optional(),
  bg: hexColor.optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const profile = await prisma.profile.findFirst({ where: { id, userId, archivedAt: null } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
  }

  const updated = await prisma.profile.update({
    where: { id },
    data: { avatarOverrides: JSON.stringify(parsed.data) },
  });

  return NextResponse.json({ avatarOverrides: updated.avatarOverrides });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const profile = await prisma.profile.findFirst({ where: { id, userId, archivedAt: null } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  await prisma.profile.update({ where: { id }, data: { avatarOverrides: null } });
  return NextResponse.json({ ok: true });
}
