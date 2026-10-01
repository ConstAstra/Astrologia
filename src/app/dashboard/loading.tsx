import { CelestialSpinner } from "@/components/ui/CelestialSpinner";

// Affiché automatiquement par Next.js (streaming Suspense) pendant qu'une
// page du dashboard charge ses données côté serveur — évite un écran blanc
// le temps d'une requête un peu lente, sans avoir à le déclencher nous-mêmes.
export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <CelestialSpinner className="h-8 w-8" variant="sun" />
      <p className="text-sm">…</p>
    </div>
  );
}
