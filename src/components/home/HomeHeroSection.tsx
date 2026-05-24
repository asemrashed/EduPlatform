"use client";

import Image from "next/image";
import type { ResolvedHomeHero } from "@/lib/resolveHomeHeroContent";

type HomeHeroSectionProps = {
  content: ResolvedHomeHero;
};

/** Renders *italic* segments in hero copy strings. */
function EmphasisText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function SerifParagraph({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <p className={`font-serif-display ${className ?? ""}`}>
      <EmphasisText text={text} />
    </p>
  );
}

function BioParagraph({ text }: { text: string }) {
  return (
    <p className="font-sans text-[15px] leading-[1.8] text-foreground/75 md:text-base">
      <EmphasisText text={text} />
    </p>
  );
}

export function HomeHeroSection({ content }: HomeHeroSectionProps) {
  const {
    tagline,
    brandName,
    badge,
    headlineBefore,
    headlineAccent,
    introParagraphs,
    bioLeft,
    bioRight,
    portraitSrc,
    statValue,
    statLabel,
  } = content;

  const brandDisplay = brandName.trim().toUpperCase();
  const hasBio = bioLeft.length > 0 || bioRight.length > 0;

  return (
    <section className="bg-white text-foreground">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 md:gap-14 md:px-10 md:py-20 lg:grid-cols-2 lg:gap-20 lg:px-16 lg:py-24">
        {/* Left — DM Serif for brand, headline, and body */}
        <div className="max-w-xl">
          <p className="font-sans text-sm font-medium tracking-wide text-muted-foreground md:text-base">
            {tagline}
          </p>

          <h1 className="font-serif-display mt-2 text-6xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.25rem]">
            {brandDisplay}
          </h1>

          <span className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 font-sans text-xs font-semibold text-primary md:text-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            {badge}
          </span>

          <h2 className="font-serif-display mt-8 text-[2rem] font-bold leading-[1.2] tracking-tight text-foreground sm:text-4xl md:text-[2.65rem] lg:text-5xl">
            {headlineBefore}
            <span className="italic text-primary">{headlineAccent}</span>
          </h2>

          <div className="mt-8 space-y-5">
            {introParagraphs.map((paragraph) => (
              <SerifParagraph
                key={paragraph.slice(0, 48)}
                text={paragraph}
                className="text-base leading-[1.75] text-muted-foreground md:text-[17px]"
              />
            ))}
          </div>
        </div>

        {/* Right — portrait; stat overlaps into bio band */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:justify-self-end">
          <div className="relative aspect-[493/506] w-full">
            <Image
              src={portraitSrc}
              alt="Instructor portrait"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 520px"
              className="object-contain object-bottom"
            />
          </div>
          <div
            className={`absolute left-0 z-20 rounded-xl bg-foreground px-5 py-4 text-on-primary shadow-editorial ${
              hasBio
                ? "bottom-0 translate-y-1/2 md:left-4"
                : "bottom-8 md:bottom-12 md:left-4"
            }`}
          >
            <p className="font-serif-display text-3xl font-bold leading-none md:text-4xl">
              {statValue}
            </p>
            <p className="mt-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-on-primary/90">
              {statLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom band — two-column story (beige) */}
      {hasBio && (
        <div className="border-t border-outline-variant/20 bg-[#f0ebe3] px-6 pb-16 pt-20 md:px-10 md:pb-20 md:pt-24 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
            <div className="space-y-5">
              {bioLeft.map((paragraph) => (
                <BioParagraph key={paragraph.slice(0, 48)} text={paragraph} />
              ))}
            </div>
            <div className="space-y-5">
              {bioRight.map((paragraph) => (
                <BioParagraph key={paragraph.slice(0, 48)} text={paragraph} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
