# Meridian — Valorisation Google (SEO / SEA / PWA)

Site Next.js ultra-design pour une agence française de **création web & valorisation Google** :
SEO, SEA / Google Ads, sites PWA, prise de rendez-vous, devis et chatbot.

## Fonctionnalités

- Landing : activités, formules, méthode, conformité, contact
- Modales **RDV** et **devis** avec consentement RGPD
- **Chatbot** à règles (SEO, Ads, PWA, formules…)
- **PWA** : manifest, service worker, icônes, installable
- **SEO** : metadata, Open Graph, JSON-LD, `robots.ts`, `sitemap.ts`
- **SEA ready** : catégorie cookies publicitaires ; tags Ads à brancher après consentement
- **RGPD / droit FR** : mentions légales, confidentialité, cookies, bannière granulaire

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start
```

## Variables d’environnement

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL canonique (défaut `https://meridian-digital.fr`) |

## Brancher e-mail / CRM (hors démo)

Les routes `POST /api/rdv` et `POST /api/devis` valident les données (Zod) et journalisent côté serveur.
Pour la production : brancher Resend, SMTP ou un CRM dans ces handlers.

## Tracking Google Ads / Analytics (consentement)

1. Écouter l’événement `meridian:consent` (détail : `{ analytics, advertising }`).
2. Charger gtag / Google Ads **uniquement** si `analytics` ou `advertising` est `true`.
3. Prévoir les paramètres UTM sur les landing (`utm_source`, `utm_medium`, `utm_campaign`).

## Personnalisation

Contenu centralisé dans [`src/lib/site.ts`](src/lib/site.ts) (marque, activités, formules, coordonnées).

## Conformité

Contenu légal fourni à titre de **modèle** : faire valider SIRET, RCS, DPO et textes par un conseil juridique avant mise en production.
