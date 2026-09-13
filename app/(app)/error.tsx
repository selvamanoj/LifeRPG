"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="panel p-8">
      <h1 className="font-display text-2xl text-danger">The keep flickered</h1>
      <p className="mt-2 text-parchment/80">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-ember px-4 py-2 font-semibold text-ink"
      >
        Try again
      </button>
    </div>
  );
}
