# Meridian — Valorisation Google (SEO / SEA / PWA)

Site Next.js ultra-design pour une agence française de **création web & valorisation Google** :
SEO, SEA / Google Ads, sites PWA, prise de rendez-vous, devis et chatbot.

## Fonctionnalités

- Landing : activités, formules, méthode, conformité, contact
- Modales **RDV** et **devis** avec consentement RGPD
- **Chatbot** multi-tours : FAQ enrichie + collecte de coordonnées (consentement RGPD), actions RDV/devis/mailto
- **PWA** : manifest, service worker, icônes, installable
- **SEO** : metadata, Open Graph, JSON-LD, `robots.ts`, `sitemap.ts`
- **SEA ready** : catégorie cookies publicitaires ; tags Ads à brancher après consentement
- **RGPD / droit FR** : mentions légales, confidentialité, cookies, bannière granulaire

## Démarrage rapide (fichier `index.html`)

Ouvrez **[`index.html`](index.html)** à la racine du dépôt (double-clic ou serveur statique).  
C’est l’entrée du site : landing, RDV, devis, chatbot, cookies RGPD — sans installation.

```bash
# optionnel : serveur local
npx serve .
# puis ouvrir http://localhost:3000
```

## Version Next.js (App Router)

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

## Audits (Lighthouse, Axe, OG/Schema, CWV, Bundle)

```bash
npm run serve:static         # terminal 1 — http://127.0.0.1:3456
npm run audit:lighthouse     # home Lighthouse
npm run audit:cwv            # Core Web Vitals lab mobile+desktop (PageSpeed local)
npm run audit:pagespeed-local # alias de audit:cwv
npm run audit:unlighthouse   # crawl Unlighthouse CI (fallback sitewide)
npm run audit:axe            # WCAG Axe
npm run audit:og             # Open Graph + JSON-LD
npm run audit:sitewide       # Lighthouse multi-pages
npm run audit:bundle         # Bundlephobia
npm run audit:all
```

Rapports dans `audits/`. Optimisations : fonts locales, `next/dynamic` (chat/cookies), `content-visibility`, idle init widgets.

Les routes `POST /api/rdv`, `POST /api/devis` et `POST /api/chat-lead` valident les données (Zod) et journalisent côté serveur.
Le chat static enregistre aussi les leads dans `localStorage` (`meridian_chat_leads`).
Pour la production : brancher Resend, SMTP ou un CRM dans ces handlers (e-mail transactionnel non branché pour l’instant).

## Tracking Google Ads / Analytics (consentement)

1. Écouter l’événement `meridian:consent` (détail : `{ analytics, advertising }`).
2. Charger gtag / Google Ads **uniquement** si `analytics` ou `advertising` est `true`.
3. Prévoir les paramètres UTM sur les landing (`utm_source`, `utm_medium`, `utm_campaign`).

## Personnalisation

Contenu centralisé dans [`src/lib/site.ts`](src/lib/site.ts) (marque, activités, formules, coordonnées).

## Conformité

Contenu légal fourni à titre de **modèle** : faire valider SIRET, RCS, DPO et textes par un conseil juridique avant mise en production.
