import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { GUIDES_EN } from "@/lib/content/guides.en";
import { GUIDE_ICONS } from "@/components/guides/guideIcons";
import { GUIDE_DIAGRAMS_EN } from "@/components/guides/GuideDiagrams";

export async function generateStaticParams() {
  return GUIDES_EN.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES_EN.find((g) => g.slug === slug);
  if (!guide) return {};
  return {
    title: `${guide.title} · Astrologium`,
    description: guide.description,
    alternates: { canonical: `/en/guides/${guide.slug}` },
  };
}

export default async function GuideArticlePageEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = GUIDES_EN.findIndex((g) => g.slug === slug);
  if (index === -1) notFound();
  const guide = GUIDES_EN[index];
  const next = GUIDES_EN[(index + 1) % GUIDES_EN.length];
  const dateLabel = new Date(guide.publishedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const Icon = GUIDE_ICONS[guide.slug];
  const Diagram = GUIDE_DIAGRAMS_EN[guide.slug];

  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <article className="mx-auto max-w-2xl px-6 pb-16 pt-16">
          <Link href="/en/guides" className="text-xs text-muted hover:text-foreground">
            ← All guides
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/5">
              {Icon && <Icon className="h-4 w-4 text-gold-strong" />}
            </span>
            <Eyebrow>Guide</Eyebrow>
          </div>
          <h1 className="font-display mt-3 text-3xl sm:text-4xl">{guide.title}</h1>
          <p className="mt-3 text-xs text-muted">
            {dateLabel} · {guide.readingMinutes} min read
          </p>
          <p className="mt-6 text-lg leading-relaxed text-foreground/90">{guide.intro}</p>
          {Diagram && <Diagram className="mt-8" />}

          <div className="mt-10 flex flex-col gap-8">
            {guide.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-xl text-gold-strong">{section.heading}</h2>
                <div className="mt-3 flex flex-col gap-4">
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-foreground/90">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Card className="mt-10 border-gold/30 bg-gold/5 p-6 text-center">
            <ButtonLink href={guide.relatedHref}>{guide.relatedLabel}</ButtonLink>
          </Card>

          <div className="mt-10 border-t border-border-soft pt-6">
            <p className="text-xs text-muted">Next guide</p>
            <Link href={`/en/guides/${next.slug}`} className="font-display mt-1 block text-lg hover:text-gold-strong">
              {next.title} →
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
