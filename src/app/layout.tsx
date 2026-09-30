import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Document Order Assistant | Automatically Arrange PDFs by SOP",
  description:
    "Arrange PDF documents using dates, document types, dependencies and SOP rules. Review, reorder and export a correctly sequenced document package.",
  keywords: [
    "PDF ordering",
    "SOP compliance",
    "document sequencing",
    "PDF merger",
    "audit report",
    "employee onboarding dossier",
    "loan application ordering",
  ],
  authors: [{ name: "Document Order Assistant" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
