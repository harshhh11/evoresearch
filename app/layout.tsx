import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvoResearch — Research Intelligence Platform",
  description: "Enterprise SaaS research environment exploring relationships across papers, datasets, models, experiments, and autonomous failure recovery.",
  applicationName: "EvoResearch",
  icons: { icon: "/evo-mark.svg", shortcut: "/evo-mark.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F7F7F1",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#F7F7F1] text-[#252B26] font-sans">{children}</body>
    </html>
  );
}
