"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signup(email.trim(), password, displayName);
      router.replace("/map");
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : "Unable to create your account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#e5f0e6] px-4 py-12 text-[#18372f]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/island-bg.svg')] bg-cover bg-center opacity-20"
      />
      <section className="relative w-full max-w-md border border-white/80 bg-[#fffdf7]/95 p-7 shadow-[0_24px_70px_-38px_rgba(22,65,50,0.55)] sm:p-9">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#66877b]">
          Shakara Workers / Lagos Island
        </p>
        <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight">
          Join the island.
        </h1>
        <p className="mt-2 text-sm text-[#567168]">
          Make a place for yourself among the workers.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {error && (
            <p
              role="alert"
              className="border-l-2 border-[#b74d3e] bg-[#fff0eb] px-3 py-2.5 text-sm text-[#913c31]"
            >
              {error}
            </p>
          )}
          <div>
            <label
              htmlFor="display-name"
              className="mb-1.5 block text-sm font-semibold text-[#34574b]"
            >
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              maxLength={60}
              className="min-h-11 w-full border border-[#cbd9ca] bg-white px-3 text-sm outline-none transition focus:border-[#34785b] focus:ring-2 focus:ring-[#34785b]/20"
              placeholder="e.g. Tunde from Tech"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-semibold text-[#34574b]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="min-h-11 w-full border border-[#cbd9ca] bg-white px-3 text-sm outline-none transition focus:border-[#34785b] focus:ring-2 focus:ring-[#34785b]/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-semibold text-[#34574b]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="min-h-11 w-full border border-[#cbd9ca] bg-white px-3 text-sm outline-none transition focus:border-[#34785b] focus:ring-2 focus:ring-[#34785b]/20"
              placeholder="At least 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[#245e49] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#184a38] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
            {!submitting && <ArrowRight aria-hidden="true" size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#668077]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#245e49] underline decoration-[#a8c2ad] underline-offset-4 hover:text-[#184a38]"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
