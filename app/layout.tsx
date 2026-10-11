import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvoResearch — An Evolving AI Research Environment",
  description: "Every experiment leaves behind a question. Every failure leaves behind evidence.",
  applicationName: "EvoResearch",
  icons: { icon: "/evo-mark.svg", shortcut: "/evo-mark.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F8F6EF",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
