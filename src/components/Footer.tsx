import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-[var(--ink)] text-[rgba(242,244,247,0.78)]">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-3xl text-white">{siteConfig.name}</p>
          <p className="mt-3 max-w-sm">
            {siteConfig.tagline} Création de sites PWA, SEO, SEA et Google Ads — conforme RGPD,
            accessibilité (WCAG / RGAA) et droit français / UE.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--beam)]">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a className="hover:text-[var(--beam)]" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a className="hover:text-[var(--beam)]" href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              {siteConfig.address.street}
              <br />
              {siteConfig.address.city}
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--beam)]">Légal</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="hover:text-[var(--beam)]" href="/autodiagnostic">
                Autodiagnostic site
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--beam)]" href="/accessibilite">
                Accessibilité
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--beam)]" href="/mentions-legales">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--beam)]" href="/politique-confidentialite">
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--beam)]" href="/politique-cookies">
                Politique cookies
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-2 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. Tous droits réservés.
          </p>
          <p>Site PWA · SEO / SEA · RGPD · WCAG / RGAA / EAA</p>
        </div>
      </div>
    </footer>
  );
}
