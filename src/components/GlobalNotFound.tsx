import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-6xl font-black text-primary mb-4">404</h2>
      <h3 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow hover:bg-primary/90 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}