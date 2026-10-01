import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Connexion — Astrologium" };

export default function ConnexionPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="font-display text-3xl">Connexion</h1>
          <p className="mt-2 text-sm text-muted">Retrouvez vos profils et vos thèmes.</p>
          <div className="mt-6">
            <Suspense>
              <AuthForm mode="login" />
            </Suspense>
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            <Link href="/mot-de-passe-oublie" className="text-gold-strong hover:underline">
              Mot de passe oublié ?
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-gold-strong hover:underline">
              Créer un compte
            </Link>
          </p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
