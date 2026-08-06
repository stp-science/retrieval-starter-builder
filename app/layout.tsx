import type { Metadata } from "next";
import PowerPointDownloadEnhancer from "./PowerPointDownloadEnhancer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retrieval Starter Builder",
  description:
    "Create ready-to-use Junior Science retrieval starters from a checked question bank.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "./favicon.svg",
    shortcut: "./favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <PowerPointDownloadEnhancer />
      </body>
    </html>
  );
}
