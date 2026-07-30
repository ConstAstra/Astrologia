// Repères des pays les plus importants pour se situer sur la carte
// d'astrocartographie — coordonnées approximatives (capitale ou centroïde),
// suffisantes pour un repère visuel, pas pour une précision cartographique.
// `dx`/`dy` (en pixels, optionnels) permettent d'espacer à la main les
// libellés dans les zones denses (Europe de l'Ouest, Asie de l'Est) pour
// qu'ils restent lisibles malgré la petite taille de la carte.
export interface MajorCountry {
  name: string;
  lat: number;
  lon: number;
  dx?: number;
  dy?: number;
}

export const MAJOR_COUNTRIES: MajorCountry[] = [
  { name: "États-Unis", lat: 39, lon: -98 },
  { name: "Canada", lat: 56, lon: -106 },
  { name: "Mexique", lat: 23, lon: -102 },
  { name: "Brésil", lat: -10, lon: -52 },
  { name: "Argentine", lat: -35, lon: -64 },
  { name: "France", lat: 47, lon: 2, dy: 6 },
  { name: "Royaume-Uni", lat: 54, lon: -2, dy: -12 },
  { name: "Espagne", lat: 40, lon: -3.7, dx: 20, dy: 18 },
  { name: "Portugal", lat: 39.5, lon: -8, dx: -32, dy: 16 },
  { name: "Allemagne", lat: 51, lon: 10, dx: 18, dy: -4 },
  { name: "Italie", lat: 42.5, lon: 12.5, dx: 16, dy: 20 },
  { name: "Russie", lat: 61, lon: 60 },
  { name: "Maroc", lat: 31.8, lon: -7, dy: 14 },
  { name: "Égypte", lat: 26.8, lon: 30.8 },
  { name: "Nigéria", lat: 9.1, lon: 8 },
  { name: "Afrique du Sud", lat: -29, lon: 24 },
  { name: "Arabie saoudite", lat: 24, lon: 45, dy: 8 },
  { name: "Turquie", lat: 39, lon: 35, dy: -10 },
  { name: "Inde", lat: 22, lon: 79 },
  { name: "Chine", lat: 35, lon: 103, dx: -10 },
  { name: "Japon", lat: 36.5, lon: 138, dx: 10, dy: -12 },
  { name: "Corée du Sud", lat: 36, lon: 127.8, dx: -6, dy: 12 },
  { name: "Indonésie", lat: -2, lon: 118 },
  { name: "Australie", lat: -25, lon: 134 },
];
