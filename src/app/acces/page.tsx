import { Suspense } from "react";
import { AccessGateForm } from "@/components/AccessGateForm";

export const metadata = { robots: { index: false, follow: false } };

export default function AccesPage() {
  return (
    <Suspense fallback={null}>
      <AccessGateForm />
    </Suspense>
  );
}
