// Repères des pays les plus importants pour se situer sur la carte
// d'astrocartographie — coordonnées approximatives (capitale ou centroïde),
// suffisantes pour un repère visuel, pas pour une précision cartographique.
// `dx`/`dy` (en pixels, optionnels) permettent d'espacer à la main les
// libellés dans les zones denses (Europe de l'Ouest, Asie de l'Est) pour
// qu'ils restent lisibles malgré la petite taille de la carte.
export interface MajorCountry {
  /** Identifiant stable, indépendant de la langue (utilisé pour joindre FR/EN et pour le paramètre d'URL du sélecteur de pays). */
  id: string;
  name: string;
  lat: number;
  lon: number;
  dx?: number;
  dy?: number;
  /** Nom exact du pays dans les données topojson `world-atlas` (toujours en anglais) — sert à retrouver la géométrie réelle du pays pour le calcul des lignes d'astrocartographie qui le traversent. */
  topoName: string;
}

export const MAJOR_COUNTRIES: MajorCountry[] = [
  { id: "us", name: "États-Unis", lat: 39, lon: -98, topoName: "United States of America" },
  { id: "ca", name: "Canada", lat: 56, lon: -106, topoName: "Canada" },
  { id: "mx", name: "Mexique", lat: 23, lon: -102, topoName: "Mexico" },
  { id: "br", name: "Brésil", lat: -10, lon: -52, topoName: "Brazil" },
  { id: "ar", name: "Argentine", lat: -35, lon: -64, topoName: "Argentina" },
  { id: "fr", name: "France", lat: 47, lon: 2, dy: 6, topoName: "France" },
  { id: "gb", name: "Royaume-Uni", lat: 54, lon: -2, dy: -12, topoName: "United Kingdom" },
  { id: "es", name: "Espagne", lat: 40, lon: -3.7, dx: 20, dy: 18, topoName: "Spain" },
  { id: "pt", name: "Portugal", lat: 39.5, lon: -8, dx: -32, dy: 16, topoName: "Portugal" },
  { id: "de", name: "Allemagne", lat: 51, lon: 10, dx: 18, dy: -4, topoName: "Germany" },
  { id: "it", name: "Italie", lat: 42.5, lon: 12.5, dx: 16, dy: 20, topoName: "Italy" },
  { id: "ru", name: "Russie", lat: 61, lon: 60, topoName: "Russia" },
  { id: "ma", name: "Maroc", lat: 31.8, lon: -7, dy: 14, topoName: "Morocco" },
  { id: "eg", name: "Égypte", lat: 26.8, lon: 30.8, topoName: "Egypt" },
  { id: "ng", name: "Nigéria", lat: 9.1, lon: 8, topoName: "Nigeria" },
  { id: "za", name: "Afrique du Sud", lat: -29, lon: 24, topoName: "South Africa" },
  { id: "sa", name: "Arabie saoudite", lat: 24, lon: 45, dy: 8, topoName: "Saudi Arabia" },
  { id: "tr", name: "Turquie", lat: 39, lon: 35, dy: -10, topoName: "Turkey" },
  { id: "in", name: "Inde", lat: 22, lon: 79, topoName: "India" },
  { id: "cn", name: "Chine", lat: 35, lon: 103, dx: -10, topoName: "China" },
  { id: "jp", name: "Japon", lat: 36.5, lon: 138, dx: 10, dy: -12, topoName: "Japan" },
  { id: "kr", name: "Corée du Sud", lat: 36, lon: 127.8, dx: -6, dy: 12, topoName: "South Korea" },
  { id: "id", name: "Indonésie", lat: -2, lon: 118, topoName: "Indonesia" },
  { id: "au", name: "Australie", lat: -25, lon: 134, topoName: "Australia" },
];
