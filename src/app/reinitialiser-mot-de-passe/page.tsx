import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe — Astrologia" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="font-display text-3xl">Nouveau mot de passe</h1>
          {token ? (
            <>
              <p className="mt-2 text-sm text-muted">Choisissez un nouveau mot de passe pour votre compte.</p>
              <div className="mt-6">
                <ResetPasswordForm token={token} />
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-terracotta">
              Lien invalide. Demandez un nouveau lien depuis la page{" "}
              <Link href="/mot-de-passe-oublie" className="text-gold-strong hover:underline">
                mot de passe oublié
              </Link>
              .
            </p>
          )}
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
