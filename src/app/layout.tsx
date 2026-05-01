import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-cormorant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crumbss - Artisanal Bakery",
  description: "Small Crumbs, Big Joy. Premium artisanal cookies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cormorant.variable} h-full antialiased scroll-smooth selection:bg-accent selection:text-background`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-primary bg-grain relative">
        <div className="absolute inset-0 bg-grain pointer-events-none opacity-[0.03] mix-blend-multiply z-50 fixed"></div>
        {children}
      </body>
    </html>
  );
}
