import Link from "next/link";
import {
  defaultWebsiteContent,
  type WebsiteContent,
} from "@/lib/websiteContentDefaults";
import type { FooterLink } from "@/lib/websiteContentTypes";

type SiteFooterProps = {
  cmsData?: WebsiteContent | null;
};

function resolveFooterLinks(
  links: FooterLink[] | undefined,
  fallback: FooterLink[],
): FooterLink[] {
  const resolved = links?.filter((link) => link.label?.trim());
  if (resolved && resolved.length > 0) {
    return resolved.map((link) => ({
      label: link.label.trim(),
      href: link.href?.trim() || "#",
    }));
  }
  return fallback;
}

function resolveFooterContent(cmsData?: WebsiteContent | null) {
  const footer = cmsData?.footer;
  const defaults = defaultWebsiteContent.footer;

  return {
    branding: {
      logoText:
        footer?.branding?.logoText?.trim() || defaults.branding.logoText,
      description:
        footer?.branding?.description?.trim() || defaults.branding.description,
    },
    companyLinks: resolveFooterLinks(
      footer?.companyLinks,
      defaults.companyLinks,
    ),
    quickLinks: resolveFooterLinks(footer?.quickLinks, defaults.quickLinks),
    newsletter: {
      title: footer?.newsletter?.title?.trim() || defaults.newsletter.title,
      emailPlaceholder:
        footer?.newsletter?.emailPlaceholder?.trim() ||
        defaults.newsletter.emailPlaceholder,
    },
    copyright:
      footer?.copyright?.trim() ||
      `© ${new Date().getFullYear()} ${defaults.branding.logoText}. The digital curator of elite knowledge.`,
  };
}

function FooterLinkColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: FooterLink[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
        {title}
      </h2>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={`${title}-${link.href}-${link.label}`}>
            {link.href && link.href !== "#" ? (
              <Link
                href={link.href}
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {link.label}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">{link.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ cmsData }: SiteFooterProps) {
  const content = resolveFooterContent(cmsData);

  return (
    <footer className="mt-auto border-t border-transparent bg-surface-container-low">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-12 px-6 py-16 md:grid-cols-6 md:px-12">
        <div className="col-span-2 flex flex-col items-center md:items-start">
          <span className="mb-4 block font-[family-name:var(--font-headline)] text-xl font-bold text-primary">
            {content.branding.logoText}
          </span>
          <p className="max-w-xs text-sm leading-7 text-muted-foreground">
            {content.branding.description}
          </p>
        </div>
        <FooterLinkColumn
          title="Platform"
          links={content.companyLinks}
          className="flex flex-col items-center md:items-start"
        />
        <FooterLinkColumn title="Policy" links={content.quickLinks} />
        <div className="col-span-2 flex flex-col items-center md:items-start">
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
            {content.newsletter.title}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Stay updated with our curated knowledge.
          </p>
          <div className="flex gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email
            </label>
            <input
              id="footer-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={content.newsletter.emailPlaceholder}
              disabled
              className="w-full rounded-lg border border-border bg-surface-container-lowest px-4 py-2 text-sm text-muted-foreground"
            />
            <button
              type="button"
              disabled
              className="shrink-0 rounded-lg bg-primary px-3 py-2 text-on-primary opacity-60"
              aria-label="Subscribe (coming soon)"
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Subscriptions will be wired in a later phase.
          </p>
        </div>
      </div>
      <div className="border-t border-outline-variant/20 px-6 py-8 text-center text-xs text-muted-foreground md:px-12">
        {content.copyright}
      </div>
    </footer>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
