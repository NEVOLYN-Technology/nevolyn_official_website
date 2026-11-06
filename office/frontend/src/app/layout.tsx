import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nevolyn.com"),
  title: {
    default: "NEVOLYN Office — Employee Login, HRM & Operations Portal",
    template: "%s | NEVOLYN Office",
  },
  description:
    "Official employee login, attendance, HRM, project portfolio, and daily operations portal for NEVOLYN Technology.",
  keywords: [
    "NEVOLYN",
    "Nevolyn",
    "NEVOLYN Technology",
    "nevolyn office",
    "office nevolyn",
    "nevolyn office login",
    "nevolyn office management",
    "nevolyn employee login",
    "nevolyn staff login",
    "nevolyn staff portal",
    "nevolyn employee portal",
    "nevolyn hrm",
    "nevolyn hr portal",
    "nevolyn attendance",
    "nevolyn attendance login",
    "nevolyn work log",
    "nevolyn portal",
    "nevolyn.com/office",
    "নেভোলিন",
    "নেভোলিন অফিস",
    "নেভোলিন অফিস লগইন",
    "নেভোলিন এমপ্লয়ী লগইন",
    "নেভোলিন অফিস পোর্টাল",
  ],
  alternates: {
    canonical: "https://nevolyn.com/office/login",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NEVOLYN Technology",
    title: "NEVOLYN Office — Employee Login, HRM & Operations Portal",
    description:
      "Official employee login, attendance, HRM, project portfolio, and daily operations portal for NEVOLYN Technology.",
    url: "https://nevolyn.com/office/login",
    images: [
      {
        url: "https://nevolyn.com/nevolyn-logo.png",
        width: 1200,
        height: 630,
        alt: "NEVOLYN Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEVOLYN Office Login — Employee & HRM Portal",
    description:
      "Official employee login, attendance, HRM, and daily operations portal for NEVOLYN Technology.",
    images: ["https://nevolyn.com/nevolyn-logo.png"],
  },
  verification: {
    google: "vzbTJSa6lso2s74DPf_itEshA7SPnSNE2As5Jg4N2iM",
  },
};

const officeSchemaGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://nevolyn.com/office#webpage",
      url: "https://nevolyn.com/office/login",
      name: "NEVOLYN Office — Employee Login, HRM & Operations Portal",
      alternateName: [
        "NEVOLYN Office",
        "NEVOLYN Office Login",
        "NEVOLYN Office Management",
        "NEVOLYN Employee Login",
        "NEVOLYN HRM Portal",
        "নেভোলিন অফিস",
        "নেভোলিন অফিস লগইন",
      ],
      description:
        "Official employee login, attendance, HRM, project portfolio, and daily operations portal for NEVOLYN Technology.",
      isPartOf: {
        "@id": "https://nevolyn.com/#website",
      },
      about: {
        "@id": "https://nevolyn.com/#organization",
      },
      inLanguage: ["en", "bn"],
    },
  ],
};

/**
 * Root application layout establishing global HTML structure, fonts, dark theme class,
 * Schema.org structured data, and TanStack Query provider tree.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(officeSchemaGraph) }}
        />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
