import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "FAQ — Astrologium",
  description:
    "Is Astrologium free? How is it different from a regular horoscope? Is my data private? Clear answers to the most common questions.",
};

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Is Astrologium really free?",
    answer:
      "The full natal chart — planets, houses, aspects, Ascendant — is free and unlimited, no card required. Some relationship features (synastry, composite chart) and advanced tools (astrocartography, life mission) need either a Premium subscription or a one-off credit.",
  },
  {
    question: "How is this different from a regular horoscope?",
    answer:
      "A magazine horoscope describes 12 boxes, one per Sun sign. Astrologium calculates a real chart from your actual birth date, time, and place: exact planetary positions, houses, aspects between planets. The full method, with its conventions and honest limits, is detailed on the Method page.",
  },
  {
    question: "Is astrology a science?",
    answer:
      "No, and Astrologium never claims otherwise. It's a tool for reflection and entertainment, with no established scientific validation, and it doesn't replace medical advice, psychological support, or any professional guidance.",
  },
  {
    question: "How much does Premium cost?",
    answer:
      "$12.99/month or $89/year (about 43% off the annual plan), with a 7-day free trial. For occasional use, one-off credits are also available, from $2.99 up to $24.99 for a pack of 12 unlocks.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your password is hashed and never stored in plain text, no data is ever sold to third parties, and your chart stays strictly personal. Full details — subprocessors, retention period, your rights — are in the privacy policy.",
  },
  {
    question: "Can I delete my account?",
    answer:
      "Yes, at any time, directly from your dashboard — deletion is immediate and permanent, no need to contact us.",
  },
  {
    question: "Does it work on mobile?",
    answer: "Yes, the site works normally from a mobile browser, nothing to install. An iOS app is also in the works.",
  },
  {
    question: "I don't know my exact birth time — what do I do?",
    answer:
      "Create your profile and check \"unknown time\": the Ascendant and houses are then disabled (they depend on a precise time), but the Sun, Moon, and other planets in sign stay accurate and are shown normally.",
  },
  {
    question: "How many profiles can I create for free?",
    answer:
      "3 free profiles — yours and two people close to you, for example to try a synastry. Beyond that, a Premium subscription lets you add more.",
  },
  {
    question: "How does the referral program work?",
    answer:
      "Every account has a personal referral link. As soon as the invited person makes their first real purchase (subscription or credits), 2 credits are granted to the referrer and 2 to the referred person.",
  },
  {
    question: "Is the site available in French?",
    answer: "Yes, the entire site and all calculations are available in both French and English.",
  },
];

export default function FaqEnPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Frequently asked questions</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">FAQ</h1>
          <p className="mt-5 text-muted">
            The most common questions before creating an account — for more depth,{" "}
            <Link href="/en/method" className="text-gold-strong underline">
              the method
            </Link>{" "}
            and the{" "}
            <Link href="/en/privacy" className="text-gold-strong underline">
              privacy policy
            </Link>{" "}
            go further into detail.
          </p>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-8 pb-16">
          <div className="space-y-3">
            {FAQ.map((item) => (
              <Card key={item.question} className="overflow-hidden p-0">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-display text-base marker:content-none">
                    {item.question}
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3 w-3 shrink-0 text-gold-strong transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 4.5 6 8l3.5-3.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>
                </details>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
