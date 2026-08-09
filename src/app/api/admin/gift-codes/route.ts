import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "3 caractères minimum")
      .max(40, "40 caractères maximum")
      .regex(/^[A-Za-z0-9-]+$/, "Lettres, chiffres et tirets uniquement"),
    label: z.string().trim().max(200).optional(),
    grantType: z.enum(["subscription", "credits"]),
    subscriptionPlan: z.enum(["monthly", "annual"]).optional(),
    // Vide = accès à vie (pas de date de fin posée à la rédemption).
    durationDays: z.coerce.number().int().positive().optional(),
    creditsAmount: z.coerce.number().int().positive().optional(),
    maxRedemptions: z.coerce.number().int().positive().default(1),
    expiresAt: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.grantType === "subscription" && !data.subscriptionPlan) {
      ctx.addIssue({ code: "custom", message: "Formule requise pour un cadeau d'abonnement", path: ["subscriptionPlan"] });
    }
    if (data.grantType === "credits" && !data.creditsAmount) {
      ctx.addIssue({ code: "custom", message: "Nombre de crédits requis", path: ["creditsAmount"] });
    }
  });

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide." }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const giftCode = await prisma.giftCode.create({
      data: {
        code: data.code.toUpperCase(),
        label: data.label || null,
        grantType: data.grantType,
        subscriptionPlan: data.grantType === "subscription" ? data.subscriptionPlan : null,
        durationDays: data.grantType === "subscription" ? (data.durationDays ?? null) : null,
        creditsAmount: data.grantType === "credits" ? data.creditsAmount : null,
        maxRedemptions: data.maxRedemptions,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    return NextResponse.json({ giftCode });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Ce code existe déjà." }, { status: 409 });
    }
    console.error("[admin:gift-codes:create]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
