import type { Metadata } from "next";
import { Atkinson_Hyperlegible, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

// Resident view. Chosen for legibility, not personality.
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// Family view.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Labels and timestamps, both views.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caretaker",
  description:
    "Family calls that name who is speaking, and turn conversations into a family tree.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${atkinson.variable} ${inter.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
