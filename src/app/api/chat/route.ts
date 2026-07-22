import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1).max(500),
});

function replyFor(message: string): string {
  const q = message.toLowerCase();

  if (/(formule|tarif|prix|essentiel|croissance|sur[- ]?mesure)/.test(q)) {
    return "Trois formules : Essentiel (audit + quick wins, dès 1 490 €), Croissance (site/PWA + SEO + Google Ads, dès 4 900 €, recommandée) et Sur-mesure (multi-campagnes, sur devis). Utilisez « Demander un devis » pour préciser.";
  }
  if (/(google\s*ads|sea|publicité|campagne|ads)/.test(q)) {
    return "Nous structurons et optimisons vos campagnes Google Ads (Search, Display, Remarketing) avec tracking des conversions activé uniquement après consentement cookies. La formule Croissance inclut un lancement Ads initial.";
  }
  if (/(seo|référencement|referencement|mise en avant|visibilité|valoris)/.test(q)) {
    return "Notre SEO couvre l’audit technique, le contenu optimisé Google, le local SEO / Google Business Profile et l’alignement avec vos campagnes SEA pour une valorisation durable.";
  }
  if (/(pwa|site|création|creation|développement|developpement|web)/.test(q)) {
    return "Nous créons des sites PWA ultra-design : installables, rapides (Core Web Vitals), SEO-ready et préparés pour le tracking Google Ads / Analytics sous consentement RGPD.";
  }
  if (/(rendez[- ]?vous|rdv|créneau|calendrier)/.test(q)) {
    return "Réservez via le bouton « Rendez-vous » : visio, présentiel à Paris ou téléphone. Confirmation sous 24 h ouvrées.";
  }
  if (/(rgpd|données|cookie|confidentialité|cnil|europe|consent)/.test(q)) {
    return "Oui : bannière cookies granulaire (nécessaires / analytics / publicitaires SEA), pages légales FR, et tags Google Ads/Analytics conditionnés au consentement. DPO : dpo@meridian-digital.fr.";
  }
  if (/(contact|email|téléphone|telephone|adresse|devis)/.test(q)) {
    return "contact@meridian-digital.fr · 01 84 80 00 00 · 12 rue de la Paix, 75002 Paris. Pour un devis, cliquez sur « Demander un devis ».";
  }
  if (/(bonjour|salut|hello|bonsoir)/.test(q)) {
    return "Bonjour ! Je peux vous aider sur : création PWA, SEO, Google Ads / SEA, formules, RDV ou conformité RGPD.";
  }
  return "Je renseigne sur la valorisation Google (SEO, SEA, Ads), les sites PWA, nos formules, le RDV et le devis. Reformulez ou utilisez les suggestions.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Message invalide" }, { status: 400 });
    }
    return NextResponse.json({ reply: replyFor(parsed.data.message) });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
