import { siteConfig } from "@/lib/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.legalName,
        url: siteConfig.url,
        email: siteConfig.email,
        telephone: siteConfig.phone,
        logo: `${siteConfig.url}/icons/icon-512.png`,
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.address.street,
          addressLocality: "Paris",
          postalCode: "75002",
          addressCountry: "FR",
        },
        sameAs: [siteConfig.social.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": `${siteConfig.url}/#organization` },
        inLanguage: "fr-FR",
      },
      {
        "@type": "ProfessionalService",
        name: siteConfig.name,
        description: siteConfig.description,
        image: `${siteConfig.url}/og.jpg`,
        url: siteConfig.url,
        telephone: siteConfig.phone,
        priceRange: "€€€",
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.address.street,
          addressLocality: "Paris",
          postalCode: "75002",
          addressCountry: "FR",
        },
        areaServed: {
          "@type": "Country",
          name: "France",
        },
        knowsAbout: [
          "SEO",
          "SEA",
          "Google Ads",
          "PWA",
          "Création de sites web",
          "Valorisation Google",
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: `${siteConfig.url}/`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Quelles formules propose Meridian ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Essentiel (audit + quick wins dès 1 490 €), Croissance (site/PWA + SEO + Google Ads dès 4 900 €) et Sur-mesure (multi-campagnes, sur devis).",
            },
          },
          {
            "@type": "Question",
            name: "Proposez-vous du SEO et Google Ads ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui : SEO technique et contenu, SEA / Google Ads avec tracking après consentement cookies RGPD.",
            },
          },
          {
            "@type": "Question",
            name: "Le site est-il conforme RGPD ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui : bannière cookies granulaire, pages légales françaises et tags analytics/Ads conditionnés au consentement.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
