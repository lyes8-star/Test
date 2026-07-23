import { formatAddress, mapsUrls, siteConfig } from "@/lib/site";

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 7l9 7 9-7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function TopContactBar() {
  const phoneHref = `tel:${siteConfig.phone.replace(/\s/g, "")}`;
  const addressLine = formatAddress();
  const maps = mapsUrls();

  return (
    <div className="top-contact" role="region" aria-label="Coordonnées">
      <div className="container top-contact-inner">
        <a className="top-contact-item" href={phoneHref}>
          <IconPhone />
          <span>{siteConfig.phoneDisplay}</span>
        </a>
        <a className="top-contact-item" href={`mailto:${siteConfig.email}`}>
          <IconMail />
          <span>{siteConfig.email}</span>
        </a>
        <span className="top-contact-item">
          <IconClock />
          <span>{siteConfig.hours}</span>
        </span>
        <span className="top-contact-item top-contact-address address-map-trigger" tabIndex={0}>
          <IconPin />
          <span>{addressLine}</span>
          <span className="address-map-popup" role="tooltip">
            <iframe
              title="Carte Google Maps — Crevia"
              src={maps.embed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </span>
        </span>
      </div>
    </div>
  );
}
