// Clé sessionStorage utilisée pour transporter les informations de naissance
// saisies anonymement sur /theme-astral (NatalChartTeaserForm) jusqu'à la
// page /dashboard/profils/reclamer (ClaimDraftProfile), qui finalise la
// création du profil juste après l'inscription. Jamais persisté nulle part
// côté serveur avant que la personne n'ait explicitement choisi de créer un
// compte.
export const DRAFT_STORAGE_KEY = "astrologium:pendingProfileDraft";
