import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <div className="panel p-8">
        <h1 className="font-display text-3xl text-ember">Path vanished</h1>
        <p className="mt-2 text-parchment/70">This corridor is not on the map.</p>
        <Link href="/" className="mt-6 inline-block text-ember underline">
          Return to the threshold
        </Link>
      </div>
    </main>
  );
}
