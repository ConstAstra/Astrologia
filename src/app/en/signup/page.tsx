import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create an account — Astrologium" };

export default function SignupEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="font-display text-3xl">Create my account</h1>
          <p className="mt-2 text-sm text-muted">Free. Your full natal chart is waiting for you.</p>
          <div className="mt-6">
            <Suspense>
              <AuthForm mode="register" locale="en" />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/en/login" className="text-gold-strong hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
