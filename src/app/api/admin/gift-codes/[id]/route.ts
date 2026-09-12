import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";

const schema = z.object({ active: z.boolean() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const giftCode = await prisma.giftCode.update({ where: { id }, data: { active: parsed.data.active } }).catch(() => null);
  if (!giftCode) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  return NextResponse.json({ giftCode });
}
