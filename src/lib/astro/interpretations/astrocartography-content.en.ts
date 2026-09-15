import type { PlanetKey } from "../types";
import type { LineTypeKey } from "./astrocartography-content";

export const LINE_TYPE_META_EN: Record<LineTypeKey, { name: string; explanation: string }> = {
  MC: {
    name: "Midheaven line (MC)",
    explanation:
      "Where the planet was exactly culminating at the Midheaven at the moment of birth: it colors public life, vocation, and the social image of whoever settles there.",
  },
  IC: {
    name: "Imum Coeli line (IC)",
    explanation:
      "Where the planet was exactly at the Imum Coeli: it influences inner life, home, roots and intimacy for whoever settles there.",
  },
  AC: {
    name: "Ascendant line (AC)",
    explanation:
      "Where the planet was exactly rising on the eastern horizon: it strongly colors the personality on display and daily life for whoever settles there.",
  },
  DC: {
    name: "Descendant line (DC)",
    explanation:
      "Where the planet was exactly setting on the western horizon: it influences encounters and one-on-one relationships for whoever settles there.",
  },
};

export const ASTROCARTO_TEXT_EN: Record<PlanetKey, Partial<Record<LineTypeKey, string>>> = {
  sun: {
    MC: "Here, this is the kind of place where an opportunity to showcase your best work tends to appear more easily than elsewhere — a high-responsibility offer, media exposure, a project where you're asked to carry the vision. The flip side: the pressure of public perception is stronger here too, and the need to shine can tip into exhaustion if recognition takes its time.",
    IC: "In real terms, people often settle here intending to found or anchor a lasting home, and it's common to become the central figure or pillar of one's family or close circle. The other side of the coin: home can become a stage where you try to reign rather than simply rest, with a real risk of domestic power struggles.",
    AC: "On the ground, you gain visibility from the first contact here: you're noticed, approached, put forward within a group more often, almost without seeking it. The cost: the ego is more exposed than elsewhere, and setbacks or criticism land more personally.",
    DC: "What often plays out: the notable encounters here often involve assertive personalities, sometimes authority figures or highly visible partners themselves — marriages, high-profile professional partnerships. Worth watching: the relationship can turn into a visibility contest if both egos are trying to shine at once.",
  },
  moon: {
    MC: "Typically, it's not unusual to build a career or reputation here around care, hosting the public, or a domestic activity made visible — but popularity here is as changeable as the Moon itself, prone to real ups and downs. The less comfortable part: professional life takes on an unusual emotional vulnerability, where mood can affect reputation.",
    IC: "The day-to-day reality: this is often the place where a sense of \"home\" arrives fastest, where starting a family or rebuilding a protective cocoon feels almost natural. The point to watch: sensitivity runs close to the surface here, and even minor family tension is felt in amplified form.",
    AC: "Here, you become more porous to the local atmosphere: mood follows the surrounding social and emotional climate, sometimes day to day. The flip side: the need for emotional security can become overwhelming, making independence harder to hold onto than elsewhere.",
    DC: "The most common scenario: encounters here often carry the tone of a chosen family or a fast-forming, merging bond — you attract partners who want to nurture or be nurtured. The other side of the coin: mutual emotional dependence can set in faster than it gets questioned.",
  },
  mercury: {
    MC: "In practice, this line favors careers in writing, negotiation, teaching or commerce: opportunities to be read, heard or consulted for your opinion multiply here. The cost: the elevated mental pace can make it hard to truly settle, and career direction stays prone to frequent shifts.",
    IC: "What tends to happen: home becomes a place of constant exchange here — conversations, calls, projects run from the house — favorable for intellectual work done remotely. Worth watching: mental activity can crowd out the space that's supposed to be a refuge, making truly quiet rest rarer.",
    AC: "Here, you talk faster, learn faster, and notice last-minute opportunities — solid ground for studying, negotiating, or traveling light. The less comfortable part: mental scatter can take over from presence, and words can outrun thought.",
    DC: "In real terms, you rack up intellectually stimulating encounters here — colleagues, networks, acquaintances who quickly become regular sparring partners. The point to watch: the sheer volume of exchange can come at the expense of any one bond's depth.",
  },
  venus: {
    MC: "On the ground, professional opportunities here are colored by aesthetics, charm or diplomacy: fashion, art, PR, mediation — public image gains grace almost effortlessly. The flip side: success can end up depending more on being liked than on demonstrated skill.",
    IC: "What often plays out: you easily create a beautiful, harmonious home here, a good place to host — often one of the best spots for a peaceful, aesthetically pleasing family life. The other side of the coin: the comfort you're chasing can slide into avoiding necessary conflict.",
    AC: "Typically, you're perceived as more charming, more relaxed, more socially at ease from the first glance here — often cited as the best line for feeling good in your own skin day to day. The cost: relational ease can mask a lack of assertiveness when a real disagreement shows up.",
    DC: "The day-to-day reality: this is a classic line for a memorable romantic encounter or an especially harmonious partnership — bonds formed here often feel like they were meant to happen. Worth watching: the wish to please at all costs can delay the moment of telling a partner an uncomfortable truth.",
  },
  mars: {
    MC: "Typically, this line pushes toward careers that demand nerve — entrepreneurship, competition, physically demanding fields — with opportunities that reward boldness. The less comfortable part: friction with authority or coworkers is more frequent here, and impatience can carry a real professional cost.",
    IC: "The most common scenario: you often take on renovations, moves or home projects that demand physical energy here — home becomes more of a work site than a cocoon. The point to watch: family tension escalates faster here, with a genuine risk of domestic arguments.",
    AC: "In practice, you gain physical energy and reactivity here — good ground for launching into things, doing sport, acting without waiting. The flip side: impulsiveness and irritability are amplified too, at the expense of patience and diplomacy.",
    DC: "What tends to happen: encounters here carry an immediate, intense, sometimes electric attraction — real terrain for passion. The other side of the coin: partnerships formed here are prone to rivalry or open conflict, especially if both sides want the last word.",
  },
  jupiter: {
    MC: "Here, this line is considered one of the most reliable \"lucky\" lines in astrocartography: professional opportunities arrive with unusual ease, often through a mentor or a network that opens up spontaneously. The cost: excess confidence can lead to underestimating details or overpromising.",
    IC: "In real terms, home tends to expand here — a growing family, a bigger house, a real sense of domestic abundance. Worth watching: easy generosity can slide into overspending, or comfort into complacency.",
    AC: "On the ground, you breathe a contagious optimism here from the moment you arrive, with a real sense of doors opening — one of the most sought-after lines in astrocartography. The less comfortable part: overconfidence can lead to poorly calculated risks, carried by an optimism that misses the details.",
    DC: "What often plays out: the encounters here often have a positive snowball effect — partners who open doors, encourage, push you to think bigger. The point to watch: early enthusiasm can mask a lack of discernment about who actually deserves that trust.",
  },
  saturn: {
    MC: "Typically, professional recognition here is built slowly, often after years of sustained effort and seriously carried responsibility — but it's also more durable than elsewhere once earned. The flip side: the weight can feel heavy before results become visible, with a real risk of discouragement along the way.",
    IC: "The day-to-day reality: the relationship to home and family here demands serious investment, sometimes a duty to carry — caring for an aging parent, bearing a long-standing family responsibility. The other side of the coin: lightness and play at home can be in short supply, replaced by a sense of permanent obligation.",
    AC: "Here, you're perceived as more serious, more reserved, almost older than your actual age — an identity that inspires trust but takes time to reveal warmth. The cost: this line has a reputation for being hard to live day-to-day, with a persistent sense of constraint.",
    DC: "The most common scenario: relationships formed here are serious, potentially deeply committed, but rarely quick to start — often partnerships built over time rather than through love at first sight. Worth watching: a sense of loneliness or delayed encounters can set in before the solid relationship arrives.",
  },
  uranus: {
    MC: "In practice, the professional path takes turns you didn't see coming here — a sudden career change, an unexpected opportunity, a break from a conventional trajectory. The less comfortable part: professional instability can become chronic if the need for freedom blocks any long-term commitment.",
    IC: "What tends to happen: family life is prone to sudden change here — unplanned moves, quick breakups or reconciliations, an unusual need for independence from one's family of origin. The point to watch: domestic stability can feel impossible to sustain over time.",
    AC: "Here, you live through striking, unplanned events almost continuously — surprise encounters, snap decisions that change a trajectory. The flip side: this stimulating unpredictability can also be exhausting if you're looking for even a minimum of routine to settle into.",
    DC: "In real terms, encounters here are sudden, electric, sometimes very short-lived — love at first sight, unconventional relationships, breakups as fast as the beginnings. The other side of the coin: difficulty committing for the long haul can leave a chronic sense of relational instability.",
  },
  neptune: {
    MC: "On the ground, career here can lean toward art, care, spirituality or the imaginary, with a professional reputation that often stays hard to pin down clearly from the outside. The cost: professional misunderstandings, unkept promises (yours or others') and contractual vagueness are more common here than elsewhere.",
    IC: "What often plays out: home takes on a dreamlike, idealized tone here — a good place for spiritual life, creativity, inner retreat. Worth watching: concrete material foundations (finances, upkeep, practical decisions) are harder to stabilize here.",
    AC: "Typically, you develop a more porous, intuitive identity here, with a quiet charm that draws people in without always knowing why. The less comfortable part: losing your bearings is a real risk, as is idealizing the surroundings or the people you meet here.",
    DC: "The day-to-day reality: encounters here often carry strong chemistry, almost as if the bond had been written in advance. The point to watch: that same chemistry can be pure idealization rather than real knowledge of the other person — magical if you keep a clear head, deceptive otherwise.",
  },
  pluto: {
    MC: "Typically, career here is built after a real struggle — a tough sector to break into, a hierarchy to confront — but the success achieved is rarely superficial once earned. The flip side: professional power dynamics (rivalries, influence struggles) are more intense here than elsewhere.",
    IC: "The most common scenario: the relationship to family roots becomes real transformative ground here — buried secrets resurfacing, family dynamics needing deep renegotiation. The other side of the coin: this process can be stormy before it's liberating, with periods of genuine crisis inside the home.",
    AC: "In practice, you give off a magnetic, intense presence here, hard to ignore, that pushes others toward strong reactions (attraction or wariness). The cost: life here is marked by deep, repeated transformation — rarely a restful line, more a place of shedding skins than a place of comfort.",
    DC: "What tends to happen: relationships formed here reach a rare intensity, potentially transformative for both people involved. Worth watching: that intensity often comes bundled with power struggles, jealousy or possessiveness that need to be consciously defused.",
  },
  northNode: {
    MC: "Here, this is a good place to head toward a vocation still unknown or unexplored, in step with a direction of growth that requires stepping outside what's already mastered. The less comfortable part: professional uncertainty can feel strong at first, before the new direction stabilizes.",
    IC: "In real terms, this place invites you to revisit your relationship to roots and family from a fresh angle — sometimes by physically stepping away from it in order to understand it better. The point to watch: the familiar comfort of the past can be sorely missed at first.",
    AC: "On the ground, this context pushes you out of your comfort zone and toward embodying a version of yourself closer to what you're growing into — an identity to try on rather than simply inhabit. The flip side: the discomfort of not yet fully recognizing yourself in this version can be real, especially at first.",
    DC: "What often plays out: the encounters here seem \"made to help you grow\" — partners who push you beyond your usual relational comfort zone. The other side of the coin: these bonds can be demanding precisely because they don't follow the familiar, reassuring relational pattern.",
  },
};
