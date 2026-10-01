import qrcode from "qrcode-generator";

/**
 * QR code sous forme de data URI SVG — même approche que
 * renderAvatarDataUri (chaîne construite puis encodée en data URI) plutôt
 * qu'un rendu image binaire, pour rester utilisable aussi bien côté serveur
 * (routes next/og) que côté client (canvas de l'export vidéo), sans aucune
 * dépendance à Buffer (absent des navigateurs) ni au DOM.
 *
 * Existe pour que le lien de parrainage affiché sur les cartes/vidéos
 * exportées soit réellement actionnable une fois republié sur les réseaux :
 * un ?ref= ou même un lien court en texte ne sont pas cliquables une fois
 * republiés en pixels, un QR code si.
 */
export function renderQrDataUri(text: string, cellSize = 4): string {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  // La marge (en modules, pas en pixels) n'est pas cosmétique : sans zone
  // "silencieuse" autour du motif, la plupart des lecteurs — y compris de
  // vrais téléphones, pas seulement les tests — échouent à détecter les
  // motifs de repérage aux coins. 4 modules est le minimum recommandé par
  // la spec QR.
  const svg = qr.createSvgTag(cellSize, 4);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
