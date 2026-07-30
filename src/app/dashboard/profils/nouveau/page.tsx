import { Card, Eyebrow } from "@/components/ui/Card";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default function NouveauProfilPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Eyebrow>Nouveau profil</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">Date, heure et lieu de naissance</h1>
      <p className="mt-2 text-sm text-muted">
        Plus l&apos;heure est précise, plus l&apos;Ascendant et les maisons seront fiables : une erreur de
        quelques minutes peut suffire à changer de signe ascendant en fin de degré.
      </p>
      <Card className="mt-6 p-6">
        <ProfileForm />
      </Card>
    </div>
  );
}
