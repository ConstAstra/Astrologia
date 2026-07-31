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
    MC: "In practice, this is the kind of place where an opportunity to showcase your best work tends to appear more easily than elsewhere — a high-responsibility offer, media exposure, a project where you're asked to carry the vision. The flip side: the pressure of public perception is stronger here too, and the need to shine can tip into exhaustion if recognition takes its time.",
    IC: "In practice, people often settle here intending to found or anchor a lasting home, and it's common to become the central figure or pillar of one's family or close circle. The flip side: home can become a stage where you try to reign rather than simply rest, with a real risk of domestic power struggles.",
    AC: "In practice, you gain visibility from the first contact here: you're noticed, approached, put forward within a group more often, almost without seeking it. The flip side: the ego is more exposed than elsewhere, and setbacks or criticism land more personally.",
    DC: "In practice, the notable encounters here often involve assertive personalities, sometimes authority figures or highly visible partners themselves — marriages, high-profile professional partnerships. The flip side: the relationship can turn into a visibility contest if both egos are trying to shine at once.",
  },
  moon: {
    MC: "In practice, it's not unusual to build a career or reputation here around care, hosting the public, or a domestic activity made visible — but popularity here is as changeable as the Moon itself, prone to real ups and downs. The flip side: professional life takes on an unusual emotional vulnerability, where mood can affect reputation.",
    IC: "In practice, this is often the place where a sense of \"home\" arrives fastest, where starting a family or rebuilding a protective cocoon feels almost natural. The flip side: sensitivity runs close to the surface here, and even minor family tension is felt in amplified form.",
    AC: "In practice, you become more porous to the local atmosphere here: mood follows the surrounding social and emotional climate, sometimes day to day. The flip side: the need for emotional security can become overwhelming, making independence harder to hold onto than elsewhere.",
    DC: "In practice, encounters here often carry the tone of a chosen family or a fast-forming, merging bond — you attract partners who want to nurture or be nurtured. The flip side: mutual emotional dependence can set in faster than it gets questioned.",
  },
  mercury: {
    MC: "In practice, this line favors careers in writing, negotiation, teaching or commerce: opportunities to be read, heard or consulted for your opinion multiply here. The flip side: the elevated mental pace can make it hard to truly settle, and career direction stays prone to frequent shifts.",
    IC: "In practice, home becomes a place of constant exchange here — conversations, calls, projects run from the house — favorable for intellectual work done remotely. The flip side: mental activity can crowd out the space that's supposed to be a refuge, making truly quiet rest rarer.",
    AC: "In practice, you talk faster, learn faster, and notice last-minute opportunities here — solid ground for studying, negotiating, or traveling light. The flip side: mental scatter can take over from presence, and words can outrun thought.",
    DC: "In practice, you rack up intellectually stimulating encounters here — colleagues, networks, acquaintances who quickly become regular sparring partners. The flip side: the sheer volume of exchange can come at the expense of any one bond's depth.",
  },
  venus: {
    MC: "In practice, professional opportunities here are colored by aesthetics, charm or diplomacy: fashion, art, PR, mediation — public image gains grace almost effortlessly. The flip side: success can end up depending more on being liked than on demonstrated skill.",
    IC: "In practice, you easily create a beautiful, harmonious home here, a good place to host — often one of the best spots for a peaceful, aesthetically pleasing family life. The flip side: the comfort you're chasing can slide into avoiding necessary conflict.",
    AC: "In practice, you're perceived as more charming, more relaxed, more socially at ease from the first glance here — often cited as the best line for feeling good in your own skin day to day. The flip side: relational ease can mask a lack of assertiveness when a real disagreement shows up.",
    DC: "In practice, this is a classic line for a memorable romantic encounter or an especially harmonious partnership — bonds formed here often feel like they were meant to happen. The flip side: the wish to please at all costs can delay the moment of telling a partner an uncomfortable truth.",
  },
  mars: {
    MC: "In practice, this line pushes toward careers that demand nerve — entrepreneurship, competition, physically demanding fields — with opportunities that reward boldness. The flip side: friction with authority or coworkers is more frequent here, and impatience can carry a real professional cost.",
    IC: "In practice, you often take on renovations, moves or home projects that demand physical energy here — home becomes more of a work site than a cocoon. The flip side: family tension escalates faster here, with a genuine risk of domestic arguments.",
    AC: "In practice, you gain physical energy and reactivity here — good ground for launching into things, doing sport, acting without waiting. The flip side: impulsiveness and irritability are amplified too, at the expense of patience and diplomacy.",
    DC: "In practice, encounters here carry an immediate, intense, sometimes electric attraction — real terrain for passion. The flip side: partnerships formed here are prone to rivalry or open conflict, especially if both sides want the last word.",
  },
  jupiter: {
    MC: "In practice, considered one of the most reliable \"lucky\" lines: professional opportunities arrive here with unusual ease, often through a mentor or a network that opens up spontaneously. The flip side: excess confidence can lead to underestimating details or overpromising.",
    IC: "In practice, home tends to expand here — a growing family, a bigger house, a real sense of domestic abundance. The flip side: easy generosity can slide into overspending, or comfort into complacency.",
    AC: "In practice, you breathe a contagious optimism here from the moment you arrive, with a real sense of doors opening — one of the most sought-after lines in astrocartography. The flip side: overconfidence can lead to poorly calculated risks, carried by an optimism that misses the details.",
    DC: "In practice, the encounters here often have a positive snowball effect — partners who open doors, encourage, push you to think bigger. The flip side: early enthusiasm can mask a lack of discernment about who actually deserves that trust.",
  },
  saturn: {
    MC: "In practice, professional recognition here is built slowly, often after years of sustained effort and seriously carried responsibility — but it's also more durable than elsewhere once earned. The flip side: the weight can feel heavy before results become visible, with a real risk of discouragement along the way.",
    IC: "In practice, the relationship to home and family here demands serious investment, sometimes a duty to carry — caring for an aging parent, bearing a long-standing family responsibility. The flip side: lightness and play at home can be in short supply, replaced by a sense of permanent obligation.",
    AC: "In practice, you're perceived as more serious, more reserved, almost older than your actual age here — an identity that inspires trust but takes time to reveal warmth. The flip side: this line has a reputation for being hard to live day-to-day, with a persistent sense of constraint.",
    DC: "In practice, relationships formed here are serious, potentially deeply committed, but rarely quick to start — often partnerships built over time rather than through love at first sight. The flip side: a sense of loneliness or delayed encounters can set in before the solid relationship arrives.",
  },
  uranus: {
    MC: "In practice, the professional path takes turns you didn't see coming here — a sudden career change, an unexpected opportunity, a break from a conventional trajectory. The flip side: professional instability can become chronic if the need for freedom blocks any long-term commitment.",
    IC: "In practice, family life is prone to sudden change here — unplanned moves, quick breakups or reconciliations, an unusual need for independence from one's family of origin. The flip side: domestic stability can feel impossible to sustain over time.",
    AC: "In practice, you live through striking, unplanned events almost continuously here — surprise encounters, snap decisions that change a trajectory. The flip side: this stimulating unpredictability can also be exhausting if you're looking for even a minimum of routine to settle into.",
    DC: "In practice, encounters here are sudden, electric, sometimes very short-lived — love at first sight, unconventional relationships, breakups as fast as the beginnings. The flip side: difficulty committing for the long haul can leave a chronic sense of relational instability.",
  },
  neptune: {
    MC: "In practice, career here can lean toward art, care, spirituality or the imaginary, with a professional reputation that often stays hard to pin down clearly from the outside. The flip side: professional misunderstandings, unkept promises (yours or others') and contractual vagueness are more common here than elsewhere.",
    IC: "In practice, home takes on a dreamlike, idealized tone here — a good place for spiritual life, creativity, inner retreat. The flip side: concrete material foundations (finances, upkeep, practical decisions) are harder to stabilize here.",
    AC: "In practice, you develop a more porous, intuitive identity here, with a quiet charm that draws people in without always knowing why. The flip side: losing your bearings is a real risk, as is idealizing the surroundings or the people you meet here.",
    DC: "In practice, encounters here often carry strong chemistry, almost as if the bond had been written in advance. The flip side: that same chemistry can be pure idealization rather than real knowledge of the other person — magical if you keep a clear head, deceptive otherwise.",
  },
  pluto: {
    MC: "In practice, career here is often built after a real struggle — a tough sector to break into, a hierarchy to confront — but the success achieved is rarely superficial once earned. The flip side: professional power dynamics (rivalries, influence struggles) are more intense here than elsewhere.",
    IC: "In practice, the relationship to family roots becomes real transformative ground here — buried secrets resurfacing, family dynamics needing deep renegotiation. The flip side: this process can be stormy before it's liberating, with periods of genuine crisis inside the home.",
    AC: "In practice, you give off a magnetic, intense presence here, hard to ignore, that pushes others toward strong reactions (attraction or wariness). The flip side: life here is marked by deep, repeated transformation — rarely a restful line, more a place of shedding skins than a place of comfort.",
    DC: "In practice, relationships formed here reach a rare intensity, potentially transformative for both people involved. The flip side: that intensity often comes bundled with power struggles, jealousy or possessiveness that need to be consciously defused.",
  },
  northNode: {
    MC: "In practice, this is a good place to head toward a vocation still unknown or unexplored, in step with a direction of growth that requires stepping outside what's already mastered. The flip side: professional uncertainty can feel strong at first, before the new direction stabilizes.",
    IC: "In practice, this place invites you to revisit your relationship to roots and family from a fresh angle — sometimes by physically stepping away from it in order to understand it better. The flip side: the familiar comfort of the past can be sorely missed at first.",
    AC: "In practice, this context pushes you out of your comfort zone and toward embodying a version of yourself closer to what you're growing into — an identity to try on rather than simply inhabit. The flip side: the discomfort of not yet fully recognizing yourself in this version can be real, especially at first.",
    DC: "In practice, the encounters here seem \"made to help you grow\" — partners who push you beyond your usual relational comfort zone. The flip side: these bonds can be demanding precisely because they don't follow the familiar, reassuring relational pattern.",
  },
};
