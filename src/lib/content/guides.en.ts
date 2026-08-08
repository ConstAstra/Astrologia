import type { Guide } from "./guides";

// Traduction anglaise de guides.ts — voir ce fichier pour le contexte
// éditorial. Les slugs restent identiques entre les deux langues pour
// garder des URLs symétriques (/guides/[slug] et /en/guides/[slug]).
export const GUIDES_EN: Guide[] = [
  {
    slug: "mercure-retrograde",
    title: "Mercury Retrograde: What's Actually Happening",
    description:
      "Mercury never truly moves backward — we untangle the optical illusion, what it actually affects, and why retrograde's reputation far outpaces its real effects.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "Three or four times a year, warnings circulate to back up your files and re-read your emails twice: Mercury is supposedly retrograde. It's the best-known astrological phenomenon among the general public, and also the most misunderstood. Here's what's actually happening, without mysticism and without dismissing it outright either.",
    sections: [
      {
        heading: "An optical illusion, not a real reversal",
        paragraphs: [
          "Mercury never stops and never actually reverses on its orbit — no planet does. What we observe from Earth is a perspective effect: Mercury orbits faster and closer to the Sun than Earth does, so at regular intervals it \"laps\" Earth on an inner track. Seen from our own moving vantage point, it appears to slow down, stop, and drift backward across the sky before resuming its normal motion — exactly like a faster car overtaking you on the highway can appear to move backward relative to the landscape if you only track its motion relative to you.",
          "It's a purely geometric phenomenon, entirely predictable centuries in advance through calculation — this site's engine uses the same ephemerides to determine, for any date, whether Mercury (or any other planet) is in apparent retrograde motion.",
        ],
      },
      {
        heading: "What astrological tradition makes of it",
        paragraphs: [
          "In astrology, each planet is associated with a domain: Mercury governs communication, information exchange, short trips, logic, contracts. The traditional reading holds that a retrograde planet \"works backward\" or slows down the normal expression of what it represents — hence the association with misunderstandings, delayed mail, technical glitches, deals falling through.",
          "That reading deserves to be taken for what it is: a convenient symbolic entry point, not a physical law. The real usefulness, if you choose to engage with it, is less \"everything goes wrong for three weeks\" and more \"this is a good stretch to review, re-read, and rephrase rather than launch something new\" — retrogrades recur regularly throughout the year, which makes them natural, useful pauses for exactly that kind of task, independent of any belief system.",
        ],
      },
      {
        heading: "What actually matters: your natal chart",
        paragraphs: [
          "A nuance popular culture almost always misses: if Mercury was already retrograde at the moment you were born, that's not a bad omen — it's simply one natal placement among others, traditionally associated with a more introspective kind of thinking, one that matures before it's expressed rather than bursting out spontaneously. Neither better nor worse than a direct natal Mercury: just a different way of functioning.",
          "What carries more concrete weight than this week's retrograde is where your natal Mercury sits (its sign, house, and aspects): that's what durably describes your communication style, not the apparent motion the planet happens to be going through this week for everyone at once.",
        ],
      },
    ],
    relatedHref: "/en/method",
    relatedLabel: "See how the site calculates planetary positions →",
  },
  {
    slug: "les-12-maisons",
    title: "The 12 Astrological Houses, Explained",
    description:
      "If signs describe the how and planets the what, houses describe the where: the 12 life areas a natal chart runs through, explained one by one.",
    readingMinutes: 8,
    publishedAt: "2026-08-08",
    intro:
      "A natal chart layers three languages: planets (what — which energy), signs (how — which flavor) and houses (where — in which area of life). Houses are often the hardest concept to grasp when starting out, because unlike your sun sign, they depend on an exact birth time — they don't improvise. Here's what each of the twelve corresponds to.",
    sections: [
      {
        heading: "Why houses need a birth time",
        paragraphs: [
          "Houses divide up the sky exactly as it appeared above the birthplace at the precise moment of birth — it's Earth's rotation on its own axis over 24 hours that cycles through the twelve houses, not planetary motion (which takes months or years). A few minutes' error on birth time can be enough to shift the Ascendant (the start of House I) and, by extension, every planet's house — which is why this site always honestly flags when a birth time is unknown rather than inventing an unreliable house system.",
          "There are also several mathematical conventions for dividing houses (Placidus, equal houses, whole sign, Porphyry...) which give slightly different boundaries without changing the broad principles below — see the method page for details on each system.",
        ],
      },
      {
        heading: "The angular houses (I, IV, VII, X) — the skeleton",
        paragraphs: [
          "These are the chart's four pillars: House I (identity, the image shown to the world), House IV (roots, home, family of origin), House VII (relationships, partnerships, the \"face-to-face\") and House X (vocation, social status, what's built publicly). A planet landing in one of these four houses traditionally gains weight and visibility in the person's life.",
        ],
      },
      {
        heading: "The succedent houses (II, V, VIII, XI) — what gets built",
        paragraphs: [
          "House II (resources, values, material security), House V (creativity, pleasure, playful love, children), House VIII (transformation, what's shared at depth, endings and rebirths) and House XI (network, friends, collective projects, ideals). They extend and stabilize the momentum set by the angular house preceding each of them.",
        ],
      },
      {
        heading: "The cadent houses (III, VI, IX, XII) — learning and transition",
        paragraphs: [
          "House III (communication, close circle, everyday learning), House VI (concrete work, health, routines), House IX (horizons, meaning, higher education, long journeys) and House XII (inner life, the unconscious, what escapes control). These are transitional houses, often associated with inner work rather than immediate outward action.",
        ],
      },
      {
        heading: "How to read them in practice",
        paragraphs: [
          "In practice, a planet in a house answers the question \"in which area of life does this planetary energy express itself most naturally?\". A Mercury in House X, for example, tends to put communication (Mercury) in the service of career and social status (House X) — the person might naturally write, negotiate, or teach in a visible professional setting. It's this layering of planet + sign + house, repeated for every point in the chart, that makes each natal chart unique rather than reducible to a single sign.",
        ],
      },
    ],
    relatedHref: "/en/discover",
    relatedLabel: "See your chart with your real houses, no account →",
  },
  {
    slug: "ascendant",
    title: "The Ascendant: Why It Matters as Much as the Sun",
    description:
      "Your sun sign gives a general identity. The Ascendant describes how you approach the world on first contact — and it changes roughly every two hours.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "\"I'm a Leo\" only tells part of the story. In serious Western astrology, the Big 3 — Sun, Moon, Ascendant — forms the foundation of a chart, and the Ascendant is often its most determining piece day to day, even though it's the one most often ignored by pop astrology.",
    sections: [
      {
        heading: "What the Ascendant actually is",
        paragraphs: [
          "The Ascendant is the sign that was rising on the eastern horizon, precisely at the moment and place of birth. Unlike the Sun (which stays in the same sign for about a month) or the Moon (about two and a half days), the Ascendant changes sign roughly every two hours — two people born on the same day, a few hours apart, can have a completely different Ascendant even while sharing the same Sun and often the same Moon.",
          "This extreme sensitivity to exact birth time is exactly why this site refuses to invent an Ascendant when birth time is unknown: a thirty-minute error can be enough to tip into the neighboring sign, throwing off the entire reading.",
        ],
      },
      {
        heading: "The social mask, not a lie",
        paragraphs: [
          "The classic image is that the Ascendant is a \"social mask\": the spontaneous way of approaching a new situation, the first impression given, the reflexes that fire before conscious thought kicks in. It's not a mask in the sense of a false front — it's more of an entry point, the default mode, while the Sun describes more what you lean toward at depth once trust is established.",
          "A person with Sun in Pisces and Ascendant in Aries, for instance, might come across as blunt and direct at first (Ascendant Aries), while remaining more dreamy and empathetic once you get to know them better (Sun Pisces). That's not a contradiction — it's the normal coexistence of several layers within one chart.",
        ],
      },
      {
        heading: "The Ascendant also anchors House I — and everything else",
        paragraphs: [
          "Beyond the sign itself, the Ascendant marks the start of House I and anchors the whole whole-sign house system of the chart (see the dedicated guide to the 12 houses). Changing the Ascendant can therefore shift the house of every planet in the chart — another reason it carries as much weight as the Sun in a serious reading, despite receiving so little attention in pop culture.",
        ],
      },
    ],
    relatedHref: "/en/discover",
    relatedLabel: "Calculate your real Ascendant, no account →",
  },
  {
    slug: "lire-son-theme-natal",
    title: "Natal Chart: Where to Start as a Beginner",
    description:
      "A full natal chart shows dozens of positions and aspects at once. Here's a reasonable reading order so you don't drown on your first look.",
    readingMinutes: 7,
    publishedAt: "2026-08-08",
    intro:
      "The first time you open your full natal chart, the impression is usually the same: too much information, in no clear order, with no idea where to start. This guide offers a progressive reading order — not the only method, but one that avoids getting lost.",
    sections: [
      {
        heading: "1. Big 3 first, nothing else",
        paragraphs: [
          "Before the aspects, before the secondary houses, before the slow planets: start with the Sun, the Moon and the Ascendant. Together, these three already give a readable structure — conscious identity (Sun), emotional needs and inner reflexes (Moon), how you approach the world (Ascendant). That's enough for a coherent first impression, without drowning in the rest.",
        ],
      },
      {
        heading: "2. The personal planets (Mercury, Venus, Mars)",
        paragraphs: [
          "Once the Big 3 is set, widen out to the three remaining personal planets: Mercury (how you think and communicate), Venus (how you love and what you find beautiful) and Mars (how you act and defend your boundaries). They move fairly fast (a few weeks to a few months per sign) and refine personality in very concrete, everyday ways.",
        ],
      },
      {
        heading: "3. Houses: where it plays out",
        paragraphs: [
          "With a reliable birth time, next look at which houses these first six points fall into. This is the step that turns \"I have this energy\" into \"this energy mostly plays out in this concrete area of life\" — see the dedicated guide to the 12 houses for details on each.",
        ],
      },
      {
        heading: "4. Aspects: the dialogues between planets",
        paragraphs: [
          "Aspects (conjunction, trine, square, opposition, sextile...) describe how the chart's planets interact with each other — tension, flow, reinforcement. This is the richest step but also the densest one: better to explore it once the basics are in place, starting with aspects involving the Sun and Moon rather than dozens of secondary aspects all at once. See the dedicated guide to learn how to read them.",
        ],
      },
      {
        heading: "5. Slow planets last",
        paragraphs: [
          "Jupiter and Saturn (a few years per sign), then Uranus, Neptune and Pluto (several years, sometimes over a decade per sign) close out the reading. Their sign position mostly marks an entire generation rather than a strictly personal trait — what's truly yours shows up mainly through their house and aspects, not the sign alone.",
        ],
      },
    ],
    relatedHref: "/en/discover",
    relatedLabel: "See your Big 3 in 10 seconds to get started →",
  },
  {
    slug: "synastrie-vs-composite",
    title: "Synastry or Composite Chart: What's the Difference?",
    description:
      "The two most-used tools in relationship astrology don't answer the same question. Here's how to tell them apart and which to check first.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "When exploring astrological compatibility between two people, two methods come up constantly: synastry and the composite chart. They're often confused even though they answer two different questions.",
    sections: [
      {
        heading: "Synastry: how we each see the other",
        paragraphs: [
          "Synastry overlays both natal charts as they are and looks at the aspects that form between person A's planets and person B's — person A's Venus in aspect with person B's Mars, for instance. It's a tool that describes the dynamic of mutual perception: how each person reacts to the other, what attracts, what rubs, where natural friction points sit.",
          "It's usually the most intuitive entry point for a reading between a couple, friends, or collaborators, because it stays grounded in the two individual personalities rather than creating a third one.",
        ],
      },
      {
        heading: "The composite chart: a third entity",
        paragraphs: [
          "The composite chart, by contrast, calculates the midpoints between the positions in both natal charts (the midpoint method) to build an entirely new chart — that of the relationship itself, as if the couple or partnership were its own entity with its own Sun, its own Moon, its own Ascendant.",
          "It's a more abstract tool but often more revealing over time: it doesn't say \"how A perceives B\", but \"what this relationship becomes once formed\", independent of the two original personalities — useful for understanding the standalone identity of an established couple, a professional partnership, or a shared project.",
        ],
      },
      {
        heading: "Which one to check first?",
        paragraphs: [
          "In practice, synastry answers \"why does this click (or grate) between us?\" better, while the composite chart answers \"what is this relationship becoming?\" better. The two complement each other rather than replace one another — a serious relationship reading generally looks at both, never just one in isolation.",
        ],
      },
    ],
    relatedHref: "/en/method",
    relatedLabel: "See how the site calculates synastry and composite charts →",
  },
  {
    slug: "lire-un-aspect",
    title: "How to Read an Astrological Aspect",
    description:
      "Conjunction, square, trine, opposition, sextile: aspects are the language linking planets to each other. Here's how to decode them without reducing them to \"good\" or \"bad\".",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "An aspect is the geometric angle two planets form on the zodiac circle at the moment of birth. That angle determines whether the two planetary energies reinforce, strain against, or simply ignore each other — it's the finest-grained vocabulary of a natal chart, once the basics (signs, houses) are in place.",
    sections: [
      {
        heading: "The five major aspects",
        paragraphs: [
          "The conjunction (0°) fuses the two energies into a single impulse, hard to pull apart. The sextile (60°) creates an opportunity for collaboration, one that needs a bit of initiative to materialize. The square (90°) generates dynamic tension, often felt as friction or an inner obstacle — the most formative aspect of the zodiac when worked with rather than avoided. The trine (120°) offers a smooth, natural flow, an almost-given talent, with the risk of never developing it for lack of resistance. The opposition (180°) places the two energies face to face, each pulling toward a different pole — a balance to find rather than a side to pick.",
        ],
      },
      {
        heading: "Orb: a tolerance, not a strict boundary",
        paragraphs: [
          "An aspect doesn't need to be exact to the degree to count: each aspect type has an \"orb\", a tolerance margin in degrees, generally wider for major aspects involving the Sun or Moon, tighter for minor aspects. The smaller the gap to exact, the more powerful the aspect is considered — which is why this site's readings always display that gap rather than settling for a plain yes/no.",
        ],
      },
      {
        heading: "Neither good nor bad: dynamic and stakes",
        paragraphs: [
          "The most common temptation is to sort aspects into \"easy\" (trine, sextile) and \"hard\" (square, opposition) — a simplification that misses the point. A trine that's too easy can remain a talent never put to use, for lack of friction to activate it. A square, conversely, often forces real growth precisely because it resists. The real question to ask in front of an aspect isn't \"is this good or bad\", but \"what dialogue does this set up between these two energies, and what does that dialogue ask me to do consciously?\"",
        ],
      },
    ],
    relatedHref: "/en/discover",
    relatedLabel: "See the aspects of your own chart, no account →",
  },
  {
    slug: "retour-de-saturne",
    title: "The Saturn Return: Why 29 Is a Turning Point",
    description:
      "Around age 29, Saturn returns to exactly where it was at your birth. A classic milestone for stock-taking and restructuring — what it actually means, without the doom and gloom.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "\"I had my Saturn return and everything fell apart\" comes up a lot online. The reality is more nuanced: a real milestone, predictable by calculation, but not a fatality.",
    sections: [
      {
        heading: "A calculation, not a legend",
        paragraphs: [
          "Saturn takes about 29 years to travel the entire zodiac and return exactly to its birth position — a \"planetary return\" in the strict sense: the transiting planet forms a near-exact conjunction with itself in the natal chart. This site detects it directly (see the daily horoscope, which flags this kind of return when it happens). Unlike Jupiter (a return every 12 years, lighter in tone), Saturn's cycle coincides with life stages already loaded with meaning in Western culture — end of studies, first real professional or personal commitments — which feeds its reputation.",
        ],
      },
      {
        heading: "What Saturn represents in the chart",
        paragraphs: [
          "Saturn is the planet of structure, long time frames, responsibility and realistic limits — as opposed to Jupiter's boundless expansion. Its return traditionally marks the end of a first life structure built more or less under outside influence (family expectations, circumstance) and the start of a more consciously chosen one.",
          "That's not a negative signal in itself: it's a moment when whatever rested on fragile foundations tends to surface, precisely so it can be rebuilt sturdier. What was already built on sincere foundations generally goes through this period without drama.",
        ],
      },
      {
        heading: "The second and third return",
        paragraphs: [
          "Saturn returns a second time around age 58-59, then (more rarely lived through) a third time around 88 — each marking a structural stock-taking suited to that life stage. The first return stays the most talked-about because it coincides with fully stepping into adulthood, but the mechanism is identical every time: a passage point, not a guillotine.",
        ],
      },
    ],
    relatedHref: "/en/discover",
    relatedLabel: "See if your Saturn return is approaching →",
  },
  {
    slug: "noeuds-lunaires",
    title: "The Lunar Nodes: North Node and South Node",
    description:
      "An axis that isn't a real celestial body at all, but a geometric intersection — and yet one of the most used reference points for talking about \"life mission\" in astrology.",
    readingMinutes: 5,
    publishedAt: "2026-08-08",
    intro:
      "Unlike planets, the lunar nodes aren't physical objects: they're the two points where the Moon's orbit crosses the plane of Earth's orbit around the Sun. A purely geometric axis, yet loaded with meaning in astrology.",
    sections: [
      {
        heading: "One axis, two points always opposite",
        paragraphs: [
          "The North Node and South Node are always 180° apart — exactly in the opposite sign and house in the chart. They move slowly and backward relative to the usual direction of planetary motion (almost permanently retrograde), traveling the whole zodiac in about 18 and a half years.",
        ],
      },
      {
        heading: "South Node: the terrain already earned",
        paragraphs: [
          "The South Node describes familiar territory, reflexes that take no effort — sometimes read as baggage already there from the start. The risk isn't drawing on it (that's a real resource), but hiding there indefinitely out of ease, to the point of never exploring anything else.",
        ],
      },
      {
        heading: "North Node: the direction to grow into",
        paragraphs: [
          "The North Node, opposite, points to a less natural learning curve, often uncomfortable at first because it's unfamiliar — a direction of growth rather than an already-acquired trait. The traditional reading calls it a \"mission\": not what you already are, but what you gain by consciously leaning into, at your own pace.",
          "This site applies that reading in the full natal chart (see your chart page): the North Node's sign is presented as a direction, never as a box to check — the South Node isn't a flaw or a weakness, just a starting point.",
        ],
      },
    ],
    relatedHref: "/en/discover",
    relatedLabel: "See your lunar node axis, no account →",
  },
  {
    slug: "retrogrades-au-dela-de-mercure",
    title: "Retrogrades: Not Just Mercury",
    description:
      "Venus, Mars, Jupiter, Saturn and the outer planets go retrograde too — with very different durations and stakes than Mercury's much more publicized retrograde.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "Mercury retrograde grabs all the attention (see the dedicated guide), but it isn't the only planet involved. Every planet has its own rhythm of apparent retrograde motion, with a different frequency and meaning.",
    sections: [
      {
        heading: "Same mechanism, different rhythms",
        paragraphs: [
          "The principle stays the same for every planet (see the Mercury retrograde guide for the geometric detail): a perspective effect from a moving Earth, never a true reversal along the orbit. But the frequency varies a lot depending on the planet's distance: Mercury goes retrograde about 3 to 4 times a year over a few weeks, Venus about every 18 months over roughly 6 weeks, Mars about every 2 years over 2 to 3 months, and the outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto) each go retrograde roughly once a year, for several months at a stretch.",
        ],
      },
      {
        heading: "Venus retrograde: relationships and values",
        paragraphs: [
          "Since Venus governs love, aesthetics and personal values, its retrograde is traditionally associated with a time of review rather than launch in those areas: redefining what you find beautiful, what you truly desire, sometimes the unexpected return of a person or a topic from the past asking to be resolved rather than ignored.",
        ],
      },
      {
        heading: "Mars retrograde: action slowed down",
        paragraphs: [
          "Since Mars governs direct action and assertiveness, its retrograde (rarer, roughly every two years) is associated with a frustrated drive: energy struggles to deploy normally outward, which traditionally pushes toward rethinking strategy rather than charging ahead.",
        ],
      },
      {
        heading: "The outer planets: more a pause than an event",
        paragraphs: [
          "Jupiter, Saturn, Uranus, Neptune and Pluto spend a good chunk of every year in retrograde (several consecutive months) — to the point that it's almost never an isolated event but a normal, recurring state of the current chart of the moment. Their retrograde reads mostly at the collective or generational level, rarely as a strong personal signal.",
        ],
      },
    ],
    relatedHref: "/en/discover",
    relatedLabel: "See the current retrogrades on your chart →",
  },
  {
    slug: "astrologie-humaniste-vs-predictive",
    title: "Humanistic vs. Predictive Astrology: Two Schools, Not One Truth",
    description:
      "\"Astrology says...\" actually hides very different schools of thought, sometimes flatly disagreeing with each other. Understanding the split avoids a lot of misunderstandings.",
    readingMinutes: 5,
    publishedAt: "2026-08-08",
    intro:
      "Two people can look at the same natal chart with opposite expectations: one wants to understand themselves, the other wants to know what's going to happen. These aren't two shades of the same practice — they're two distinct schools, with different origins and methods.",
    sections: [
      {
        heading: "Predictive astrology: announcing events",
        paragraphs: [
          "The oldest approach, dominant until the 20th century: the chart and its transits are read as indicators of upcoming events (marriage, money, health...), in a logic close to divination. This tradition is what fuels tabloid astrology (\"watch out for financial scams this week\").",
        ],
      },
      {
        heading: "Humanistic astrology: understanding rather than predicting",
        paragraphs: [
          "Popularized notably by astrologer Dane Rudhyar in the 20th century, this school draws on psychology (Jung in particular) and shifts the goal: the chart predicts nothing, it describes psychological dynamics, tensions to integrate, potentials to consciously develop. A \"difficult\" aspect doesn't announce a negative event — it points to a possible piece of inner work.",
          "This is explicitly the philosophy behind this site (see the method page): a tool for reflection and introspection, not a prediction. This site's texts — on planets, houses, aspects — are written in that humanistic tradition, even when they lean on calculation techniques inherited from the predictive tradition (houses, orbs, and transits themselves are much older than Rudhyar).",
        ],
      },
      {
        heading: "Why the distinction matters",
        paragraphs: [
          "Much of the skepticism toward astrology actually targets its predictive branch (\"how could a planetary alignment announce a specific event?\") — a legitimate critique the humanistic school doesn't even try to refute, since it doesn't make that kind of promise. Knowing which school you're dealing with avoids judging the whole practice based on just one of its branches.",
        ],
      },
    ],
    relatedHref: "/en/method",
    relatedLabel: "See this site's philosophy in detail →",
  },
  {
    slug: "composite-vs-davison",
    title: "Composite Chart or Davison Chart: Two Ways to Calculate \"the Relationship Chart\"",
    description:
      "The composite chart (offered on this site) and the Davison chart answer the same intuition — a chart \"of the relationship\" — with two different calculation methods.",
    readingMinutes: 5,
    publishedAt: "2026-08-08",
    intro:
      "Beyond synastry (see the dedicated guide), the chart \"of the relationship\" itself exists in two variants that often get confused: the composite, calculated via midpoints, and the Davison chart, calculated differently. Here's the difference.",
    sections: [
      {
        heading: "The composite chart: a geometric average",
        paragraphs: [
          "The composite (see the \"Synastry or composite chart\" guide) calculates the midpoint between each planet in both natal charts — the geometric average of the positions, with no link to a real moment or place. It's a pure mathematical construction that doesn't exist on any calendar date or real location: neither natal chart, but a third, abstract chart representing the relationship.",
        ],
      },
      {
        heading: "The Davison chart: a real average moment and place",
        paragraphs: [
          "The Davison chart, named after British astrologer Ronald Davison who formalized it in the 1970s, takes a different route: it calculates the average date and location between the two births (literally the midpoint in time and space), then builds a real natal chart for that exact moment and place, as if it were an actual birth.",
          "The difference isn't trivial: the composite has no \"real\" houses in the strict sense (see the method page on the convention used), while the Davison chart does, since it corresponds to an actual geographic location and an actual calendar moment — with real planetary risings and settings at that exact spot.",
        ],
      },
      {
        heading: "What this site offers",
        paragraphs: [
          "This site currently calculates the composite chart (midpoint method) but not yet the Davison chart, which is on the roadmap. If you come across the term \"Davison\" elsewhere while researching astrological compatibility, you now know what it refers to and how it differs from the composite already available here.",
        ],
      },
    ],
    relatedHref: "/en/discover",
    relatedLabel: "Start with your chart, no account →",
  },
  {
    slug: "choisir-systeme-maisons",
    title: "Placidus, Whole Sign, Equal Houses, Porphyry: Which One to Choose?",
    description:
      "There's no single universally \"true\" way to calculate houses — just different conventions, each with its own logic and edge cases.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "Switching house systems can move some planets from one house to another without touching either the signs or the aspects. Many beginners don't realize this, even though the choice directly shapes how life areas get read.",
    sections: [
      {
        heading: "Whole sign: the oldest",
        paragraphs: [
          "The oldest system (used in Hellenistic astrology): each house corresponds exactly to one whole sign, House I starting right at the beginning of the sign where the Ascendant sits. Simple, robust, works at any latitude with no exceptions — it's also the system this site uses for horoscopes by sign (see the dedicated guide), precisely for its simplicity and universal reliability.",
        ],
      },
      {
        heading: "Equal houses: simple and predictable",
        paragraphs: [
          "Twelve sectors of exactly 30°, starting from the Ascendant's exact degree (which isn't necessarily at 0° of a sign, unlike whole sign). A house can therefore straddle two signs. A system of intermediate complexity, also reliable at every latitude.",
        ],
      },
      {
        heading: "Porphyry: splitting each quadrant into three",
        paragraphs: [
          "An ancient system too (3rd century), which divides each quadrant (between two angles: Ascendant, IC, Descendant, Midheaven) into three equal parts by degree. A compromise between the simplicity of equal houses and the geographic sensitivity of Placidus.",
        ],
      },
      {
        heading: "Placidus: the most widespread, but with a limit",
        paragraphs: [
          "The most-used system today in French-speaking Europe: it doesn't divide space but the time each degree of the ecliptic takes to rise above the birthplace's horizon. That sensitivity to time and place makes it mathematically undefined very close to the polar circles — this site automatically falls back to whole sign there instead of showing a wrong result (see the method page for details).",
        ],
      },
      {
        heading: "Which one to pick, in practice",
        paragraphs: [
          "There's no universal consensus even among astrologers themselves — it's a genuine matter of tradition and preference, not a question with one right answer. Placidus remains the most common default in contemporary Western astrology; whole sign appeals to a movement returning to historical Hellenistic methods. This site lets you choose freely on each chart rather than imposing one system as \"the correct one\".",
        ],
      },
    ],
    relatedHref: "/en/method",
    relatedLabel: "See the detail of each house system →",
  },
];
