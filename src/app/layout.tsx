import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-josefin",
});

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple and clean todo app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={josefinSans.variable}>
      <body style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
