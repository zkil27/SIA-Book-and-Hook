import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Anton, Geist, Geist_Mono, Permanent_Marker } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Heavy condensed gothic: matches the Hook & Box wordmark and Filipino
// "taxi" sign-painter lettering.
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
// Marker-on-cardboard numerals for price cards.
const marker = Permanent_Marker({ variable: "--font-marker-face", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Hook & Box — Fresh Seafood, Dasmariñas", template: "%s · Hook & Box" },
  description: "Today's catch with live stock and prices, delivered on ice across Dasmariñas City.",
  icons: { icon: "/imports/Vector.png" },
};

export const viewport: Viewport = {
  themeColor: "#eef6f8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${marker.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
