import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EvoResearch — Research Intelligence Platform",
  description: "Enterprise SaaS research environment exploring relationships across papers, datasets, models, experiments, and autonomous failure recovery.",
  applicationName: "EvoResearch",
  icons: { icon: "/evo-mark.svg", shortcut: "/evo-mark.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F8FAF7",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#F8FAF7] text-[#17251D] font-sans">
        {children}
      </body>
    </html>
  );
}
