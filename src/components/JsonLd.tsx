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
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
