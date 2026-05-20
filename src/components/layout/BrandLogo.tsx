import { cn } from '@/lib/cn';

type BrandLogoProps = {
  logoUrl?: string;
  logoText: string;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
};

/** Site branding: logo image and wordmark shown together when configured. */
export function BrandLogo({
  logoUrl,
  logoText,
  className,
  imageClassName,
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className={cn(
            'h-8 w-auto max-w-[9rem] shrink-0 object-contain sm:h-9',
            imageClassName,
          )}
        />
      ) : null}
      <span
        className={cn(
          'truncate font-black tracking-tighter text-primary',
          textClassName,
        )}
      >
        {logoText}
      </span>
    </span>
  );
}
