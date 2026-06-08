// Block templates and editor definitions for the Page Builder

export const TEMPLATES = [
    {
        type: 'ContentHero',
        label: 'Hero / En-tête',
        icon: '🖼️',
        description: 'Grand titre avec image de fond',
        category: 'layout',
        defaultProps: { title: 'Titre de la page', imageSrc: '', textAlign: 'center', overlayOpacity: 50 },
    },
    {
        type: 'TwoColumns',
        label: 'Deux colonnes',
        icon: '⬛⬛',
        description: 'Texte + image côte à côte',
        category: 'layout',
        defaultProps: { title: '', text: '<p>Votre texte ici...</p>', imageSrc: '', imagePosition: 'right', imageWidth: 50, buttonText: '', buttonLink: '' },
    },
    {
        type: 'RichText',
        label: 'Texte enrichi',
        icon: '📝',
        description: 'Titre + contenu HTML libre',
        category: 'content',
        defaultProps: { title: '', content: '<p>Votre texte ici...</p>', textAlign: 'left', maxWidth: 800 },
    },
    {
        type: 'CardsGrid',
        label: 'Grille de cartes',
        icon: '🃏',
        description: 'Grille de 2 à 4 cartes avec icône',
        category: 'content',
        defaultProps: {
            title: '', subtitle: '', columns: 3, cardStyle: 'shadow', headerAlign: 'center',
            cards: [
                { icon: 'leaf', title: 'Titre', text: 'Description.' },
                { icon: 'star', title: 'Titre', text: 'Description.' },
                { icon: 'shield', title: 'Titre', text: 'Description.' },
            ]
        },
    },
    {
        type: 'StatsBanner',
        label: 'Chiffres clés',
        icon: '📊',
        description: 'Bannière de statistiques / valeurs',
        category: 'content',
        defaultProps: {
            stats: [
                { value: '100%', label: 'Naturel' },
                { value: '<0.3%', label: 'THC' },
                { value: '50+', label: 'Produits' },
                { value: '24h', label: 'Livraison' },
            ],
            backgroundColor: '#1F4B40', textColor: '#ffffff', accentColor: '#00FF94'
        },
    },
    {
        type: 'CTABlock',
        label: "Appel à l'action",
        icon: '🎯',
        description: 'Bloc avec titre, texte et bouton(s)',
        category: 'conversion',
        defaultProps: {
            title: "Prêt à nous rejoindre ?",
            subtitle: '',
            buttonText: 'Découvrir nos produits',
            buttonLink: '/produits',
            buttonSecondaryText: '',
            buttonSecondaryLink: '',
            backgroundColor: '#1F4B40',
            textColor: '#ffffff',
            accentColor: '#00FF94',
            alignment: 'center',
        },
    },
    {
        type: 'Quote',
        label: 'Citation',
        icon: '💬',
        description: 'Citation mise en valeur avec auteur',
        category: 'content',
        defaultProps: { text: '"Le CBD doit être simple, accessible et de qualité."', author: 'Les Amis du CBD', textAlign: 'center' },
    },
    {
        type: 'ImageBlock',
        label: 'Image',
        icon: '🖼',
        description: 'Image pleine largeur avec légende',
        category: 'media',
        defaultProps: { src: '', alt: '', caption: '', imageWidth: 100, imageAlign: 'center' },
    },
    {
        type: 'VideoEmbed',
        label: 'Vidéo',
        icon: '🎥',
        description: 'Embed YouTube ou Vimeo',
        category: 'media',
        defaultProps: { url: '', title: '', caption: '', backgroundColor: '#1F4B40', videoWidth: 100, videoAlign: 'center' },
    },
    {
        type: 'FAQ',
        label: 'FAQ',
        icon: '❓',
        description: 'Accordéon questions / réponses',
        category: 'content',
        defaultProps: { title: 'Questions Fréquentes', items: [{ question: 'Ma question ?', answer: 'Ma réponse ici.' }] },
    },
    {
        type: 'Divider',
        label: 'Séparateur',
        icon: '➖',
        description: 'Espace ou ligne de séparation',
        category: 'layout',
        defaultProps: { style: 'line', spacing: 'medium', color: '#e5e7eb' },
    },
    {
        type: 'AuthorCard',
        label: 'Carte Auteur',
        icon: '✍️',
        description: 'Bio auteur avec photo et réseaux sociaux (E-E-A-T)',
        category: 'blog',
        defaultProps: { name: 'Prénom Nom', role: 'Rédacteur CBD', bio: 'Passionné par le CBD et le bien-être naturel.', imageSrc: '', twitter: '', linkedin: '', website: '' },
    },
    {
        type: 'CalloutBox',
        label: 'Encadré',
        icon: '💡',
        description: 'Note, Conseil, Attention, Important (améliore lisibilité)',
        category: 'blog',
        defaultProps: { type: 'tip', title: 'Bon à savoir', content: '<p>Votre information importante ici.</p>', emoji: '' },
    },
    {
        type: 'RelatedArticles',
        label: 'Articles similaires',
        icon: '🔗',
        description: 'Maillage interne — liens vers d\'autres articles',
        category: 'blog',
        defaultProps: {
            title: 'Articles similaires',
            articles: [
                { title: 'Titre de l\'article', href: '/p/mon-article', excerpt: 'Courte description…', category: 'CBD', image: '' },
            ]
        },
    },
    {
        type: 'TableOfContents',
        label: 'Sommaire',
        icon: '📋',
        description: 'Table des matières auto-générée depuis les titres',
        category: 'blog',
        defaultProps: {
            title: 'Sommaire',
            items: [
                { text: 'Introduction', anchor: 'introduction', level: 2 },
                { text: 'Section principale', anchor: 'section-1', level: 2 },
            ]
        },
    },
    {
        type: 'FeaturedProducts',
        label: 'Produit(s) en vedette',
        icon: '🛍️',
        description: 'Affiche un ou plusieurs produits spécifiques (par référence)',
        category: 'conversion',
        defaultProps: {
            title: 'Notre Sélection',
            subtitle: '',
            skus: 'FLEUR-GOR-01',
            columns: 4
        }
    },
    {
        type: 'Marquee',
        label: 'Bandeau défilant',
        icon: '🔄',
        description: 'Texte défilant en continu (style promo)',
        category: 'conversion',
        defaultProps: {
            text: 'OFFRE SPÉCIALE : Livraison offerte dès 50€ !',
            speed: 20
        }
    },
    {
        type: 'OfferComparator',
        label: "Comparateur d'offres",
        icon: '⚖️',
        description: 'Comparateur de prix interactif',
        category: 'conversion',
        defaultProps: {}
    },
    {
        type: 'PartnersNetwork',
        label: 'Logos partenaires',
        icon: '🤝',
        description: 'Grille ou ligne de logos partenaires/certifications',
        category: 'content',
        defaultProps: {
            title: 'Ils nous font confiance',
            partners: [
                { image: '', name: 'Partenaire 1' },
                { image: '', name: 'Partenaire 2' }
            ]
        }
    },
    {
        type: 'QualityBanner',
        label: 'Bandeau Qualité',
        icon: '🌟',
        description: 'Bandeau d\'assurance qualité',
        category: 'content',
        defaultProps: {
            title: 'Qualité Premium',
            subtitle: '100% Naturel et Testé en Laboratoire'
        }
    },
    {
        type: 'WhyChooseUs',
        label: 'Pourquoi nous choisir',
        icon: '✅',
        description: 'Section avec image et liste d\'avantages',
        category: 'content',
        defaultProps: {
            title: 'Pourquoi choisir Les Amis du CBD ?',
            features: [
                { title: 'Qualité', description: 'Nos produits sont testés.' },
                { title: 'Livraison Rapide', description: 'Expédition en 24h.' }
            ],
            ctaLabel: 'En savoir plus',
            ctaLink: '/essentiel',
            imageSrc: '',
            imageAlt: 'Expertise',
            isReversed: false
        }
    },
    {
        type: 'CodeEmbed',
        label: 'Code / Iframe',
        icon: '🧑‍💻',
        description: 'Insérer du code HTML, CSS ou Iframe personnalisé',
        category: 'layout',
        defaultProps: {
            code: '<div style="padding:20px; background:#f0f0f0; text-align:center;">Code HTML personnalisé ici</div>'
        }
    },
    {
        type: 'NewsletterBlock',
        label: 'Newsletter',
        icon: '✉️',
        description: 'Formulaire de capture d\'e-mail',
        category: 'leads',
        defaultProps: {
            title: 'Rejoignez notre Newsletter',
            description: 'Recevez nos dernières offres.',
            buttonText: "S'inscrire",
            placeholder: 'Votre e-mail'
        }
    },
    {
        type: 'ContactFormBlock',
        label: 'Formulaire de Contact',
        icon: '📝',
        description: 'Formulaire de contact complet',
        category: 'leads',
        defaultProps: {
            title: 'Contactez-nous',
            description: 'Laissez-nous un message et nous vous répondrons rapidement.',
            buttonText: 'Envoyer le message'
        }
    },
    // --- SPECIAL PAGES BLOCKS ---
    {
        type: 'EssentielIntro',
        label: 'Intro Essentiel',
        icon: '✨',
        description: 'Bloc d\'intro avec image et badges',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'EssentielCarousel',
        label: 'Carrousel Essentiel',
        icon: '🎠',
        description: 'Carrousel de cartes informatives',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'EssentielPoints',
        label: 'Points Essentiel',
        icon: '✅',
        description: 'Liste de points clés avec icônes',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'ProHero',
        label: 'Hero Pro',
        icon: '🏢',
        description: 'En-tête spécifique espace Pro',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'ProSteps',
        label: 'Étapes Pro',
        icon: '🪜',
        description: 'Bloc des étapes de commande Pro',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'UsagesIntro',
        label: 'Intro Usages',
        icon: '🌿',
        description: 'Bloc d\'intro pour la page Usages',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'UsagesCarouselBlock',
        label: 'Carrousel Usages',
        icon: '🎠',
        description: 'Carrousel d\'informations sur les usages',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'UsagesWarning',
        label: 'Avertissement Usages',
        icon: '⚠️',
        description: 'Bloc d\'avertissement (santé/légal)',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'UsagesEssentialBox',
        label: 'Box Essentiel Usages',
        icon: '💡',
        description: 'Encadré "L\'essentiel à retenir"',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'TransparenceHeader',
        label: 'En-tête Transparence',
        icon: '✨',
        description: 'En-tête avec titre et sous-titre',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'TransparenceQuote',
        label: 'Citation / Profil',
        icon: '🗣️',
        description: 'Citation avec photo de profil',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'TransparenceFeature',
        label: 'Fonctionnalité',
        icon: '⭐',
        description: 'Bloc de 2 colonnes avec icône',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'TransparenceCertificates',
        label: 'Certificats',
        icon: '📄',
        description: 'Galerie de certificats PDF/Images',
        category: 'special',
        defaultProps: {}
    }
];

export const CATEGORIES = [
    { id: 'layout', label: 'Mise en page' },
    { id: 'content', label: 'Contenu' },
    { id: 'blog', label: '📝 Blog / Article' },
    { id: 'conversion', label: 'Conversion' },
    { id: 'leads', label: 'Acquisition / Leads' },
    { id: 'media', label: 'Médias' },
    { id: 'special', label: 'Spécifique' },
];
