import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Abov — Jobs, career guidance, and skills in one place",
    template: "%s | Abov",
  },
  description:
    "Abov is a career platform for finding jobs and internships, planning your next role, closing skill gaps, and connecting with employers and institutions.",
  openGraph: {
    type: "website",
    siteName: "Abov",
    title: "Abov — Jobs, career guidance, and skills in one place",
    description:
      "Find jobs and internships, plan your next career move, and close skill gaps — one platform for candidates, employers, and institutions.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Abov — Jobs, career guidance, and skills in one place",
    description:
      "Find jobs and internships, plan your next career move, and close skill gaps — one platform for candidates, employers, and institutions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
