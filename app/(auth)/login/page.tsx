"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace("/map");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Unable to sign in.",
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
          Welcome back.
        </h1>
        <p className="mt-2 text-sm text-[#567168]">
          Sign in and find your place on the island.
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
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="min-h-11 w-full border border-[#cbd9ca] bg-white px-3 text-sm outline-none transition focus:border-[#34785b] focus:ring-2 focus:ring-[#34785b]/20"
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[#245e49] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#184a38] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
            {!submitting && <ArrowRight aria-hidden="true" size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#668077]">
          New to the island?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#245e49] underline decoration-[#a8c2ad] underline-offset-4 hover:text-[#184a38]"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
