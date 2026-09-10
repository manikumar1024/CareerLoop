import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "CareerLoop AI — Longitudinal Skill-to-Livelihood Outcome Intelligence",
  description: "AI-Powered Longitudinal Skill-to-Livelihood Outcome Intelligence Platform. Tracking employment outcomes, skill gaps, and the real long-term impact of skilling initiatives across vocational training ecosystems.",
  keywords: ["Skill Outcomes", "Longitudinal Tracking", "Employability Intelligence", "CareerLoop AI", "Skill India", "Vocational Training", "Employment Analytics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
