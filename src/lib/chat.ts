export type ChatAction = "lead" | "rdv" | "devis" | "mailto";

export type ChatReply = {
  reply: string;
  suggestLead?: boolean;
  actions?: ChatAction[];
  suggestions?: string[];
};

export type LeadStep = "name" | "email" | "phone" | "need" | "consent";

export const LEAD_STARTERS = [
  "Laisser mes coordonnées",
  "Être recontacté",
] as const;

export const FAQ_STARTERS = [
  "Formules SEO / SEA ?",
  "Google Ads : comment ça marche ?",
  "Création site PWA ?",
  "Prendre rendez-vous",
  "Laisser mes coordonnées",
] as const;

const LEAD_INTENT =
  /(laisser mes coordonn|être recontact|etre recontact|rappelle[rz]?[- ]?moi|contactez[- ]?moi|je veux un devis|envoyer (ma |une )?demande|prendre contact|coordonn)/i;

export function wantsLead(message: string): boolean {
  return LEAD_INTENT.test(message.trim());
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function leadPrompt(step: LeadStep): string {
  switch (step) {
    case "name":
      return "Parfait — on prépare votre demande. Quel est votre nom (ou celui de votre société) ?";
    case "email":
      return "Merci. Quelle adresse e-mail pouvons-nous utiliser pour vous répondre ?";
    case "phone":
      return "Un numéro de téléphone (optionnel) ? Sinon répondez « passer ».";
    case "need":
      return "En une phrase, quel est votre besoin (SEO, Ads, site PWA, audit…) ?";
    case "consent":
      return "Dernière étape : acceptez-vous le traitement de vos données pour être recontacté·e (RGPD) ? Répondez « j’accepte » ou « oui ». Politique : /politique-confidentialite";
  }
}

export function buildMailto(opts: {
  emailTo: string;
  name: string;
  email: string;
  phone?: string;
  need: string;
}): string {
  const subject = encodeURIComponent(`Demande Crevia — ${opts.name}`);
  const body = encodeURIComponent(
    [
      `Nom / société : ${opts.name}`,
      `E-mail : ${opts.email}`,
      opts.phone ? `Téléphone : ${opts.phone}` : null,
      `Besoin : ${opts.need}`,
      "",
      "(Envoyé depuis l’assistant Crevia)",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `mailto:${opts.emailTo}?subject=${subject}&body=${body}`;
}

export function replyFor(message: string): ChatReply {
  const q = message.toLowerCase().trim();

  if (wantsLead(message)) {
    return {
      reply: leadPrompt("name"),
      suggestLead: true,
      actions: ["lead"],
      suggestions: [],
    };
  }

  if (/(formule|tarif|prix|essentiel|croissance|sur[- ]?mesure|budget)/.test(q)) {
    return {
      reply:
        "Trois formules : Essentiel (audit + quick wins, dès 1 490 €), Croissance (site/PWA + SEO + Google Ads, dès 4 900 €, recommandée) et Sur-mesure (multi-campagnes, sur devis). Le budget exact dépend du périmètre.",
      actions: ["devis", "lead"],
      suggestions: ["Laisser mes coordonnées", "Demander un devis", "Délais typiques ?"],
    };
  }

  if (/(délai|delai|durée|duree|combien de temps|planning|semaine)/.test(q)) {
    return {
      reply:
        "Ordres de grandeur : Essentiel 2–3 semaines, Croissance 4–8 semaines, Sur-mesure selon le périmètre. Un premier RDV clarifie le calendrier.",
      actions: ["rdv", "lead"],
      suggestions: ["Prendre rendez-vous", "Laisser mes coordonnées", "Formules SEO / SEA ?"],
    };
  }

  if (/(méthode|methode|process|étapes|etapes|comment vous travaillez)/.test(q)) {
    return {
      reply:
        "Notre méthode : 1) Audit Google (site, SEO, Ads) 2) Stratégie 3) Création / campagnes 4) Mesure et optimisation. Reporting transparent à chaque jalon.",
      actions: ["rdv"],
      suggestions: ["Prendre rendez-vous", "Création site PWA ?", "SEO & mise en avant"],
    };
  }

  if (/(google\s*ads|sea|publicité|campagne|ads|roas|cpa)/.test(q)) {
    return {
      reply:
        "Nous structurons et optimisons vos campagnes Google Ads (Search, Display, Remarketing) avec tracking des conversions après consentement cookies. La formule Croissance inclut un lancement Ads initial.",
      actions: ["devis", "lead"],
      suggestions: ["Formules SEO / SEA ?", "Laisser mes coordonnées", "RGPD & cookies"],
    };
  }

  if (/(seo|référencement|referencement|mise en avant|visibilité|valoris|local seo|google business)/.test(q)) {
    return {
      reply:
        "SEO technique + contenu optimisé Google, local SEO / Google Business Profile, et alignement SEA pour une valorisation durable de votre présence.",
      actions: ["devis", "lead"],
      suggestions: ["Google Ads : comment ça marche ?", "Laisser mes coordonnées", "Délais typiques ?"],
    };
  }

  if (/(pwa|site|création|creation|développement|developpement|web|vitrine)/.test(q)) {
    return {
      reply:
        "Nous créons des sites et PWA : installables, rapides (Core Web Vitals), SEO-ready, prêts pour Analytics / Ads sous consentement RGPD. Un site classique peut évoluer en PWA.",
      actions: ["devis", "rdv", "lead"],
      suggestions: ["Laisser mes coordonnées", "Formules SEO / SEA ?", "Prendre rendez-vous"],
    };
  }

  if (/(rendez[- ]?vous|rdv|créneau|calendrier|visio)/.test(q)) {
    return {
      reply:
        "Réservez un créneau : visio, présentiel à Paris ou téléphone. Confirmation sous 24 h ouvrées. Vous pouvez aussi laisser vos coordonnées pour qu’on vous rappelle.",
      actions: ["rdv", "lead"],
      suggestions: ["Prendre rendez-vous", "Laisser mes coordonnées"],
    };
  }

  if (/(rgpd|données|cookie|confidentialité|cnil|europe|consent)/.test(q)) {
    return {
      reply:
        "Conformité FR/UE : bannière cookies granulaire (nécessaires / analytics / publicitaires), pages légales, tags Ads/Analytics conditionnés au consentement. DPO : dpo@crevia.fr.",
      suggestions: ["Laisser mes coordonnées", "Formules SEO / SEA ?"],
    };
  }

  if (/(contact|email|e-mail|téléphone|telephone|adresse|où êtes|ou etes)/.test(q)) {
    return {
      reply:
        "contact@crevia.fr · 01 84 80 00 00 · 12 rue de la Paix, 75002 Paris. Pour une demande suivie, laissez vos coordonnées ici ou ouvrez un devis / RDV.",
      actions: ["lead", "mailto", "devis", "rdv"],
      suggestions: ["Laisser mes coordonnées", "Prendre rendez-vous", "Demander un devis"],
    };
  }

  if (/(bonjour|salut|hello|bonsoir|hey)/.test(q)) {
    return {
      reply:
        "Bonjour ! Je peux vous renseigner sur la création PWA, le SEO, Google Ads / SEA, les formules, un RDV — ou collecter vos coordonnées pour un rappel.",
      suggestions: [...FAQ_STARTERS],
    };
  }

  if (/(merci|thanks|nickel|parfait)/.test(q)) {
    return {
      reply: "Avec plaisir. Besoin d’autre chose — devis, RDV ou laisser vos coordonnées ?",
      actions: ["lead", "rdv", "devis"],
      suggestions: ["Laisser mes coordonnées", "Prendre rendez-vous", "Demander un devis"],
    };
  }

  return {
    reply:
      "Je couvre la valorisation Google (SEO, SEA, Ads), les sites PWA, nos formules, le RDV et la prise de coordonnées. Reformulez ou choisissez une suggestion.",
    actions: ["lead"],
    suggestions: [...FAQ_STARTERS],
  };
}
