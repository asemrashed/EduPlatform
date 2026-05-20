'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
        <span className="material-symbols-outlined text-3xl">error</span>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error has occurred. Please try again later.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow hover:bg-primary/90 transition-colors inline-block"
      >
        Try again
      </button>
    </div>
  );
}