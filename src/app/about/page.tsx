import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Abov",
  description: "Abov is a career platform connecting candidates, employers, and institutions around jobs, skills, and career planning.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">About Abov</h1>

      <div className="mt-6 flex flex-col gap-5 text-base leading-relaxed text-[var(--color-text-secondary)]">
        <p>
          Abov HR is built around a simple observation: job search, career planning, and skill-building usually happen on
          separate tools that don&apos;t talk to each other. A resume lives in one place, job search in another, and any
          learning plan is disconnected from both. Abov puts them on one platform so the connections between them — what a
          job actually requires, what you already have, and what would close the gap — are visible and useful.
        </p>
        <p>
          The platform serves three groups directly: <strong>candidates</strong> looking for jobs, internships, and a
          clearer sense of what to learn next; <strong>employers</strong> who need to post roles, screen applicants, and
          move them through a hiring pipeline; and <strong>institutions</strong> supporting students through career
          development and placement.
        </p>
        <p>
          Match scores and career suggestions on Abov are calculated transparently from your profile and platform data —
          skills, experience, location, and preferences — not presented as a black-box guarantee. We&apos;d rather show our
          work than make a claim we can&apos;t back up.
        </p>
        <p>
          This build is under active development. Where a feature isn&apos;t fully implemented yet — for example, real
          payment processing or a live AI assistant — we say so rather than simulate it.
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/jobs" className="text-sm font-medium text-[var(--color-accent-text)] underline">
          Browse jobs
        </Link>
        <Link href="/contact" className="text-sm font-medium text-[var(--color-accent-text)] underline">
          Get in touch
        </Link>
      </div>
    </div>
  );
}
