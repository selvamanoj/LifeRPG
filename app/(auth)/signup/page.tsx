import { AuthPanel } from "@/components/auth/AuthPanel";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-6 text-sm text-parchment/60">
        ← Back to the threshold
      </Link>
      <AuthPanel mode="signup" />
    </div>
  );
}
