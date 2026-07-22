import type { Metadata, Viewport } from "next";
import { Syne, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { Chatbot } from "@/components/Chatbot";
import { ModalProvider } from "@/components/ModalProvider";
import { JsonLd } from "@/components/JsonLd";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ConsentScripts } from "@/components/ConsentScripts";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Création web, SEO, SEA & Google Ads`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  keywords: [
    "valorisation Google",
    "création site PWA",
    "SEO France",
    "SEA Google Ads",
    "référencement naturel",
    "publicité Google",
    "agence digitale Paris",
    "prise de rendez-vous",
    "devis SEO SEA",
    "RGPD",
  ],
  alternates: {
    canonical: "/",
    languages: { fr: "/" },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — valorisation Google SEO SEA PWA`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "business",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  other: {
    "msapplication-TileColor": "#1b4d3e",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e7f1ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0f2f26" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
          Aller au contenu
        </a>
        <JsonLd />
        <ModalProvider>
          <Header />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <Footer />
          <Chatbot />
          <CookieBanner />
        </ModalProvider>
        <ServiceWorkerRegister />
        <ConsentScripts />
      </body>
    </html>
  );
}
