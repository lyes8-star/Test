import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--forest-deep)] text-[rgba(255,255,255,0.86)]">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-3xl text-white">{siteConfig.name}</p>
          <p className="mt-3 max-w-sm text-[rgba(255,255,255,0.72)]">
            {siteConfig.tagline} Création de sites PWA, SEO, SEA et Google Ads — conforme RGPD et droit français.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--sage)]">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a className="hover:text-white" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
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
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--sage)]">Légal</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" href="/mentions-legales">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/politique-confidentialite">
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/politique-cookies">
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
          <p>Site PWA · SEO / SEA ready · RGPD & droit français</p>
        </div>
      </div>
    </footer>
  );
}
