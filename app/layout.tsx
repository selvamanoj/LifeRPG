import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import "./globals.css";

const display = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700", "900"],
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Life RPG — The Living Keep",
  description:
    "Turn real work into quests. Earn XP, grow attributes, and keep a persistent hero in Postgres.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="void-ember">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <a className="skip-link" href="#main">
          Skip to keep
        </a>
        {children}
      </body>
    </html>
  );
}
