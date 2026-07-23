"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ModalProvider } from "@/components/ModalProvider";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StickyMobileBar } from "@/components/StickyMobileBar";
import { MediaCopyGuard } from "@/components/MediaCopyGuard";

const Chatbot = dynamic(
  () => import("@/components/Chatbot").then((m) => m.Chatbot),
  { ssr: false },
);

const CookieBanner = dynamic(
  () => import("@/components/CookieBanner").then((m) => m.CookieBanner),
  { ssr: false },
);

const ServiceWorkerRegister = dynamic(
  () =>
    import("@/components/ServiceWorkerRegister").then(
      (m) => m.ServiceWorkerRegister,
    ),
  { ssr: false },
);

const ConsentScripts = dynamic(
  () => import("@/components/ConsentScripts").then((m) => m.ConsentScripts),
  { ssr: false },
);

const AccessibilityMenu = dynamic(
  () => import("@/components/AccessibilityMenu").then((m) => m.AccessibilityMenu),
  { ssr: false },
);

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <ModalProvider>
        <Header />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
        <Chatbot />
        <CookieBanner />
        <StickyMobileBar />
        <AccessibilityMenu />
      </ModalProvider>
      <ScrollReveal />
      <MediaCopyGuard />
      <ServiceWorkerRegister />
      <ConsentScripts />
    </>
  );
}
