import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Abov — Careers, jobs, and skills",
    short_name: "Abov",
    description: "Find jobs, plan your career, and close skill gaps in one place.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#faf8f5",
    theme_color: "#1c1a17",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-maskable-192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa-icon-maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Find jobs", url: "/jobs" },
      { name: "Your dashboard", url: "/dashboard" },
    ],
  };
}
