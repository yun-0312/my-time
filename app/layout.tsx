import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  M_PLUS_Rounded_1c,
  Noto_Sans_JP,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fontDisplay = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
});

const fontBody = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "My Time",
  description: "子供が自分を管理できるようになるアプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} bg-sky font-body text-ink antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
