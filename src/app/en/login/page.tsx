import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Log in — Astrologia" };

export default function LoginEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="font-display text-3xl">Log in</h1>
          <p className="mt-2 text-sm text-muted">Find your profiles and your charts.</p>
          <div className="mt-6">
            <Suspense>
              <AuthForm mode="login" locale="en" />
            </Suspense>
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            <Link href="/en/forgot-password" className="text-gold-strong hover:underline">
              Forgot password?
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted">
            No account yet?{" "}
            <Link href="/en/signup" className="text-gold-strong hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
