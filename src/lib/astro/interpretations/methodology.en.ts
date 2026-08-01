import type { MethodologySection } from "./methodology";

export const METHODOLOGY_EN: MethodologySection[] = [
  {
    title: "The zodiac used: tropical, geocentric",
    body: [
      "Astrologium uses the tropical (Western) zodiac, anchored to the seasons: 0° Aries always corresponds to the spring equinox, regardless of where the constellations actually sit in the sky. This is the system used by the vast majority of Western astrology (as opposed to the sidereal zodiac used in Vedic/Indian astrology).",
      "Positions are geocentric: calculated from the center of the Earth, as astrological tradition requires, rather than from the surface (topocentric) — the difference is negligible anyway for anything other than the Moon.",
      "Longitudes are apparent (they account for light travel time and aberration), in line with standard practice in serious ephemeris software.",
    ],
  },
  {
    title: "The ephemeris engine",
    body: [
      "Planetary positions are calculated with Astronomy Engine, an open source library based on the VSOP87/ELP2000 models for the positions of the Sun, Moon and planets — accuracy on the order of an arcsecond over the historical period the app covers, more than enough for astrological use.",
      "The North Node used is the mean Node (Meeus formula), which smooths out the true Node's short-term oscillations — the most common convention in Western astrology.",
      "Chiron and other centaurs/asteroids aren't offered yet: they require specific ephemerides we want to validate before adding, rather than approximating them.",
    ],
  },
  {
    title: "Astrological houses: which system, and why",
    body: [
      "Four house systems are offered: whole sign (the oldest, each house is a full sign), equal houses (12 sectors of 30° from the Ascendant), Porphyry (each quadrant divided into three equal parts in degrees), and Placidus (the most widely used in continental Europe, which divides time — not space — that each degree of the ecliptic takes to rise).",
      "Placidus is calculated by iteratively solving the semi-diurnal arcs, as its original definition requires. This system becomes mathematically undefined very close to the polar circles (beyond roughly 66° latitude on certain dates): in that specific case, the app automatically falls back to whole sign houses and tells you so, rather than displaying a wrong result.",
      "No house system has absolute consensus among astrologers: we always clearly display which one is in use, so you can compare if you'd like.",
    ],
  },
  {
    title: "Exact degree interpretation",
    body: [
      "Beyond the sign, every point is read at its precise degree through three classic markers, all calculated (never copied from a third-party text): the decan, the phase within the sign, and special degrees.",
      "The decan divides each 30° sign into three 10° slices, each ruled by a planet following the Chaldean order (Mars, Sun, Venus, Mercury, Moon, Saturn, Jupiter), which repeats in a loop across all 36 decans of the zodiac — the most widespread decan system in Western astrology, distinct from \"Sabian symbols\" (which we don't offer, since we can't guarantee the fidelity of a century-old source text).",
      "The early (0-9°), middle (10-19°) or late (20-29°) phase nuances the intensity and maturity with which the sign expresses itself.",
      "The 29th degree of each sign (the \"anaretic degree\") is traditionally read as a point of tension before the change of sign; we precisely indicate how many degrees and minutes remain before that change. So-called \"critical\" degrees (0°/13°/26° for cardinal signs, 8°/21° for fixed signs, 4°/17° for mutable signs) are an additional traditional marker: rather than an exact-degree match, we treat them as \"active\" within a 1° radius and show the exact gap to the nearest marker — to be read as a nuance, never as proof.",
    ],
  },
  {
    title: "Aspects and orbs",
    body: [
      "Major aspects (conjunction, opposition, square, trine, sextile) are calculated with orbs of 5 to 8° depending on the aspect; minor aspects (quincunx, semi-sextile, semi-square, sesquiquadrate) with tighter orbs of 2 to 3°, in line with common practice in modern Western astrology.",
      "An aspect is called \"applying\" when the gap to exactness decreases over time (the two bodies are moving toward the perfect aspect), and \"separating\" otherwise — a classic nuance, shown whenever it can be calculated.",
    ],
  },
  {
    title: "Synastry",
    body: [
      "Synastry overlays two natal charts and calculates the aspects between one person's planets and the other's, as well as which house of the first person's chart the second person's planets fall into (and vice versa) — the technique known as the \"transparency\" or house overlay method.",
      "It is neither a score nor a verdict: a synastry rich in tense aspects isn't inherently \"bad\" — it points to friction to work through consciously; a very harmonious synastry can also lack driving tension. The reading remains an aid to understanding, not an oracle.",
    ],
  },
  {
    title: "Composite chart",
    body: [
      "The composite chart is calculated using the midpoint method (popularized by Robert Hand): each composite planet is the circular midpoint (shortest arc) of the two people's positions; the composite Ascendant and Midheaven are themselves the midpoints of the two people's Ascendants and Midheavens.",
      "Since this chart doesn't correspond to any real geographic location, the intermediate houses are laid out as equal houses from the composite Ascendant — the most common convention for this type of chart, in the absence of a real latitude to apply Placidus to.",
      "There's another approach, Davison's \"relationship chart,\" which recalculates a real chart for the couple's averaged time and location: it isn't offered yet, but it's on our roadmap.",
    ],
  },
  {
    title: "Astrocartography",
    body: [
      "Each planet is projected onto a world map as four lines: Midheaven (MC) and Imum Coeli (IC), which are meridians (vertical lines), and Ascendant (AC)/Descendant (DC), which are curves — because where a planet rises or sets on the horizon depends on latitude, unlike culmination.",
      "The principle: at the moment of your birth, each planet occupied a precise right ascension and declination in the sky. The map shows, for every point on the globe, where that planet would have exactly been at one of the four angles (Ascendant, Midheaven, Descendant, Imum Coeli) — not where you should live, but which planetary energies are \"activated\" in that place.",
      "Some lines don't appear at every latitude: when a planet never rises or sets at a given latitude (it's circumpolar there), its Ascendant or Descendant line simply isn't defined there.",
      "What astrocartography does not do: it doesn't predict events, doesn't replace a well-considered move, and should be read alongside the natal chart — not in isolation.",
    ],
  },
  {
    title: "Honest limits",
    body: [
      "Astrology is not a science in the sense modern scientific method requires (no identified causal mechanism, no controlled reproducibility); we offer it as a tool for reflection, introspection and symbolic language, inherited from a multi-millennia tradition of observation — not as a certain prediction.",
      "The exact birth time radically changes the Ascendant, Midheaven and houses. An error of a few minutes can be enough to shift the rising sign at the start or end of a degree: provide the most precise time possible (birth certificate, health record), and failing that, use \"unknown time\" mode, which honestly disables angles and houses rather than inventing a precision that doesn't exist.",
    ],
  },
];
