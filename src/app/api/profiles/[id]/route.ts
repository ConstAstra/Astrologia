import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;

  const profile = await prisma.profile.findFirst({ where: { id, userId } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  return NextResponse.json({ profile });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;

  const profile = await prisma.profile.findFirst({ where: { id, userId } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  await prisma.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
