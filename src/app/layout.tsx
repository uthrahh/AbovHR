import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Newsreader, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { AppShell } from "@/components/layout/app-shell";
import { appShellBootstrapScript } from "@/components/layout/app-shell-bootstrap";
import { getSiteUrl } from "@/lib/site-url";
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

const siteUrl = getSiteUrl();

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Abov",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1a17",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Script id="app-shell-bootstrap" strategy="beforeInteractive">
          {appShellBootstrapScript()}
        </Script>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <AppShell />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
