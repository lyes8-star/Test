export const siteConfig = {
  name: "Meridian",
  legalName: "Meridian Digital SAS",
  tagline: "Valorisez votre présence Google",
  description:
    "Agence française de création de sites PWA et valorisation Google : SEO, SEA, Google Ads, mise en avant locale et nationale. Prise de rendez-vous et devis en ligne.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://meridian-digital.fr",
  locale: "fr_FR",
  lang: "fr",
  email: "contact@meridian-digital.fr",
  phone: "+33 1 84 80 00 00",
  phoneDisplay: "01 84 80 00 00",
  address: {
    street: "12 rue de la Paix",
    city: "75002 Paris",
    country: "France",
  },
  siret: "000 000 000 00000",
  rcs: "RCS Paris 000 000 000",
  tva: "FR00 000000000",
  capital: "10 000 €",
  director: "Direction Meridian",
  hosting: {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  },
  dpo: "dpo@meridian-digital.fr",
  social: {
    linkedin: "https://www.linkedin.com/company/meridian-digital",
  },
} as const;

export const activities = [
  {
    id: "creation",
    title: "Création site & PWA",
    summary:
      "Sites ultra-design, rapides et installables — pensés pour convertir et briller sur Google.",
    points: [
      "Sites vitrine & tunnels de conversion",
      "PWA installable (mobile & desktop)",
      "Performance Core Web Vitals",
    ],
  },
  {
    id: "seo",
    title: "SEO & mise en avant",
    summary:
      "Référencement naturel technique et éditorial pour apparaître là où vos clients cherchent.",
    points: [
      "Audit technique & sémantique",
      "Contenu optimisé Google",
      "Fiche Google Business & local SEO",
    ],
  },
  {
    id: "sea",
    title: "SEA & Google Ads",
    summary:
      "Campagnes Search, Display et Remarketing pour une visibilité immédiate et mesurable.",
    points: [
      "Structure de comptes Google Ads",
      "Tracking conversions & consentement",
      "Optimisation CPA / ROAS",
    ],
  },
  {
    id: "optimisation",
    title: "Suivi & optimisation",
    summary:
      "Pilotage continu : rapports clairs, itérations et alignement SEO + SEA.",
    points: [
      "Tableaux de bord Google Analytics",
      "A/B tests landing & annonces",
      "Roadmap mensuelle d’amélioration",
    ],
  },
] as const;

export const formulas = [
  {
    id: "essentiel",
    name: "Essentiel",
    price: "à partir de 1 490 €",
    duration: "2 à 3 semaines",
    description:
      "Audit Google + quick wins SEO/SEA pour débloquer votre visibilité rapidement.",
    features: [
      "Audit SEO technique & Ads",
      "Plan d’actions priorisées",
      "Optimisations on-page express",
      "Support e-mail 15 jours",
    ],
    featured: false,
  },
  {
    id: "croissance",
    name: "Croissance",
    price: "à partir de 4 900 €",
    duration: "4 à 8 semaines",
    description:
      "Site ou PWA + SEO on-page + lancement Google Ads — le parcours complet de valorisation.",
    features: [
      "Tout Essentiel inclus",
      "Création / refonte site PWA",
      "SEO technique & contenu",
      "Campagne Google Ads initiale",
      "Reporting bi-mensuel",
    ],
    featured: true,
  },
  {
    id: "sur-mesure",
    name: "Sur-mesure",
    price: "sur devis",
    duration: "selon périmètre",
    description:
      "Dispositif multi-sites ou multi-campagnes, avec équipe dédiée et SLA.",
    features: [
      "Équipe dédiée SEO + SEA",
      "Multi-comptes Google Ads",
      "PWA / produit digital avancé",
      "Conformité RGPD & tags consent",
      "Reporting exécutif mensuel",
    ],
    featured: false,
  },
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Audit",
    text: "Analyse de votre présence Google : site, SEO, Ads, concurrence et opportunités.",
  },
  {
    step: "02",
    title: "Stratégie",
    text: "Feuille de route SEO / SEA, priorités de création et objectifs de conversion.",
  },
  {
    step: "03",
    title: "Création & campagnes",
    text: "Site PWA, contenus, structure Ads et mise en ligne avec tracking conforme.",
  },
  {
    step: "04",
    title: "Mesure",
    text: "Optimisation continue des performances Google et reporting transparent.",
  },
] as const;
