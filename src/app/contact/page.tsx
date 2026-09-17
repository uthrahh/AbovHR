import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Contact us</h1>
      <p className="mt-2 text-base text-[var(--color-text-secondary)]">
        Questions about your account, a job listing, or how Abov handles your data — send us a message and we&apos;ll
        respond as soon as we can.
      </p>
      <div className="mt-6">
        <ContactForm />
      </div>
    </div>
  );
}
