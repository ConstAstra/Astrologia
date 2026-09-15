// Échappement HTML minimal pour toute valeur utilisateur interpolée dans un
// template d'e-mail (contexte HTML, contrairement au corps des notifications
// push qui est du texte brut affiché par l'OS). Sans ça, un nom de compte
// contenant des balises serait injecté tel quel dans l'e-mail envoyé à un
// tiers (voir acceptFriendInvite dans friends.ts).
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
