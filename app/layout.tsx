import type { Metadata } from "next";
import { Cairo, DM_Sans } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const dm = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "لوحة تحكم رتام موبايل للشرائح",
  description: "لوحة تحكم تحليلية لتفعيلات شرائح رتام موبايل",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${dm.variable}`}>
      <body className="font-sans antialiased text-ink-900">{children}</body>
    </html>
  );
}
