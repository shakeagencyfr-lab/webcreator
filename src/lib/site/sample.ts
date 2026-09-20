import type { SiteSpec } from "./schema";

/**
 * Spec de démonstration.
 *
 * Il sert à deux choses : l'aperçu fonctionne sans clé API, et le renderer a
 * un cas de référence qui exerce les neuf types de section. Quand une section
 * casse, elle casse ici avant de casser chez un client.
 *
 * La palette est volontairement teintée (jamais de noir ni de gris purs) et
 * passe l'audit de contraste de `theme.ts`.
 */
export const sampleSpec: SiteSpec = {
  name: "Booster Commerçant Pro",
  tagline: "Le pilotage de caisse des commerces de quartier",
  lang: "fr",
  theme: {
    fontPairing: "editorial",
    radius: "sm",
    density: "regular",
    colors: {
      bg: "#FBF9F6",
      surface: "#F2EEE7",
      text: "#1A1714",
      muted: "#5F574E",
      border: "#DFD8CD",
      primary: "#1A1714",
      primaryText: "#FBF9F6",
      accent: "#C2410C",
    },
  },
  sections: [
    {
      type: "header",
      brand: "Booster",
      links: [
        { label: "Fonctionnalités", href: "#fonctionnalites" },
        { label: "Tarifs", href: "#tarifs" },
        { label: "Questions", href: "#questions" },
      ],
      cta: { label: "Essayer 30 jours", href: "#essai" },
    },
    {
      type: "hero",
      title: "Votre commerce se pilote depuis le comptoir, pas depuis un tableur.",
      subtitle:
        "Encaissement, stock et comptabilité dans un seul outil, pensé pour les commerces indépendants de 1 à 10 salariés.",
      primaryCta: { label: "Essayer 30 jours", href: "#essai" },
      secondaryCta: { label: "Voir une démo", href: "#demo" },
    },
    {
      type: "stats",
      items: [
        { value: "3 200", label: "commerces équipés en France" },
        { value: "11 min", label: "pour la clôture de caisse du soir" },
        { value: "99,9 %", label: "de disponibilité sur douze mois" },
      ],
    },
    {
      type: "features",
      title: "Ce que vous arrêtez de faire à la main",
      subtitle:
        "Chaque fonction remplace une tâche que vous faites aujourd'hui le soir, après la fermeture.",
      items: [
        {
          title: "Clôture automatique",
          body: "Le journal de caisse se solde tout seul à la fermeture. Les écarts sont signalés au centime, avec le ticket correspondant.",
        },
        {
          title: "Stock en temps réel",
          body: "Chaque vente décrémente le stock. Les seuils de réapprovisionnement déclenchent une commande fournisseur pré-remplie.",
        },
        {
          title: "Export comptable",
          body: "Un export au format de votre expert-comptable, tous les mois, sans ressaisie. Compatible Sage, Cegid et Pennylane.",
        },
        {
          title: "Hors ligne d'abord",
          body: "La caisse continue d'encaisser quand la connexion tombe. La synchronisation se fait au retour du réseau.",
        },
      ],
    },
    {
      type: "testimonials",
      title: "Des commerçants qui ont arrêté le tableur",
      items: [
        {
          quote:
            "Je fermais à 19 h 30 et je partais à 20 h 45. Maintenant je pars à 19 h 50, la caisse est bouclée.",
          author: "Naïma Belkacem",
          role: "Épicerie fine, Roubaix",
        },
        {
          quote:
            "L'export comptable nous a fait gagner une demi-journée par mois. Mon comptable ne me relance plus.",
          author: "Thomas Grivel",
          role: "Caviste, Nantes",
        },
      ],
    },
    {
      type: "pricing",
      title: "Tarifs",
      subtitle: "Sans engagement, sans commission sur votre chiffre d'affaires.",
      plans: [
        {
          name: "Comptoir",
          price: "29 €",
          period: "mois",
          description: "Une caisse, un point de vente.",
          features: [
            "Encaissement illimité",
            "Clôture automatique",
            "Export comptable mensuel",
          ],
          highlighted: false,
          cta: { label: "Commencer", href: "#essai" },
        },
        {
          name: "Boutique",
          price: "59 €",
          period: "mois",
          description: "Jusqu'à trois caisses et la gestion de stock.",
          features: [
            "Tout Comptoir",
            "Stock temps réel",
            "Commandes fournisseurs",
            "Deux utilisateurs inclus",
          ],
          highlighted: true,
          cta: { label: "Commencer", href: "#essai" },
        },
        {
          name: "Réseau",
          price: "Sur devis",
          period: null,
          description: "À partir de quatre points de vente.",
          features: [
            "Tout Boutique",
            "Consolidation multi-boutiques",
            "Accompagnement dédié",
          ],
          highlighted: false,
          cta: { label: "Nous contacter", href: "#contact" },
        },
      ],
    },
    {
      type: "faq",
      title: "Questions fréquentes",
      items: [
        {
          question: "Faut-il changer de matériel ?",
          answer:
            "Non. Booster tourne sur une tablette ou un ordinateur existant, et reconnaît les imprimantes à tickets et tiroirs-caisse les plus courants.",
        },
        {
          question: "Que se passe-t-il si internet tombe ?",
          answer:
            "La caisse continue de fonctionner en local et enregistre les ventes. Tout se synchronise dès que la connexion revient, sans intervention.",
        },
        {
          question: "Mes données m'appartiennent-elles ?",
          answer:
            "Oui. Vous pouvez exporter l'intégralité de vos données à tout moment, dans un format ouvert, et clôturer votre compte sans délai de préavis.",
        },
      ],
    },
    {
      type: "cta",
      title: "Essayez sur une vraie journée de caisse.",
      body: "Trente jours, sans carte bancaire. Nous reprenons votre historique de ventes pour que le test soit réaliste.",
      cta: { label: "Démarrer l'essai", href: "#essai" },
    },
    {
      type: "footer",
      brand: "Booster",
      note: "Édité à Lille. Hébergement des données en France.",
      columns: [
        {
          title: "Produit",
          links: [
            { label: "Fonctionnalités", href: "#fonctionnalites" },
            { label: "Tarifs", href: "#tarifs" },
          ],
        },
        {
          title: "Légal",
          links: [
            { label: "Mentions légales", href: "#mentions" },
            { label: "Confidentialité", href: "#confidentialite" },
          ],
        },
      ],
    },
  ],
};
