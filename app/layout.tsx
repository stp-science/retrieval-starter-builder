import type { Metadata } from "next";
import PowerPointDownloadEnhancer from "./PowerPointDownloadEnhancer";
import SiteExperienceEnhancer from "./SiteExperienceEnhancer";
import ConnectFourEnhancer from "./ConnectFourEnhancer";
import ConnectFourShowAllEnhancer from "./ConnectFourShowAllEnhancer";
import "./globals.css";
import "./preview-wide.css";
import "./activity-polish.css";
import "./site-science.css";

export const metadata: Metadata = {
  title: "Retrieval Starter Builder",
  description:
    "Create ready-to-use junior, NCEA and IB Science retrieval starters from a checked question bank.",
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
        <SiteExperienceEnhancer />
        <ConnectFourEnhancer />
        <ConnectFourShowAllEnhancer />
      </body>
    </html>
  );
}
