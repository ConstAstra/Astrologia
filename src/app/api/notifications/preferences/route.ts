import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";

const schema = z.object({
  dailyHoroscopeOptIn: z.boolean(),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { dailyHoroscopeOptIn: parsed.data.dailyHoroscopeOptIn },
  });

  return NextResponse.json({ ok: true });
}
