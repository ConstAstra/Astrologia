import { randomBytes } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  name: z.string().trim().min(1).max(100).optional(),
  ref: z.string().trim().min(1).max(20).optional(),
});

function generateReferralCode(): string {
  return randomBytes(5).toString("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
  }
  const { email, password, name, ref } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet e-mail." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const referrer = ref ? await prisma.user.findUnique({ where: { referralCode: ref } }) : null;

  // Collision de referralCode astronomiquement improbable (5 octets
  // aléatoires) mais on retente une fois proprement plutôt que de planter
  // l'inscription si ça arrivait.
  let user;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          referralCode: generateReferralCode(),
          referredByUserId: referrer?.id,
        },
      });
      break;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002" && attempt === 0) continue;
      throw err;
    }
  }
  if (!user) {
    return NextResponse.json({ error: "Une erreur est survenue, réessayez." }, { status: 500 });
  }

  await createSessionCookie(user.id);

  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
