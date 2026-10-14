// Block templates and editor definitions for the Page Builder

export const TEMPLATES = [
    {
        type: 'TitleBlock',
        label: 'Titre Seul',
        icon: 'T',
        description: 'Un bloc titre avec options avancées (taille, police, couleur)',
        category: 'layout',
        defaultProps: { 
            text: 'Votre titre', 
            htmlTag: 'h2', 
            textAlign: 'center', 
            color: '#1F4B40', 
            fontFamily: 'inherit',
            fontSize: 'var(--text-3xl)' 
        },
    },
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
        defaultProps: { title: '', text: '<p>Votre texte ici...</p>', imageSrc: '', imagePosition: 'right', imageWidth: 50, buttonText: '', buttonLink: '', imageFit: 'cover' },
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
        description: 'Grille de 2 à 4 cartes avec icône ou image',
        category: 'content',
        defaultProps: {
            title: '', subtitle: '', columns: 3, cardStyle: 'shadow', headerAlign: 'center', titleFontFamily: 'inherit',
            cards: [
                { icon: 'leaf', imageSrc: '', bgColor: '#e3fff8', textColor: 'inherit', title: 'Titre', text: 'Description.' },
                { icon: 'star', imageSrc: '', bgColor: '#e3fff8', textColor: 'inherit', title: 'Titre', text: 'Description.' },
                { icon: 'shield', imageSrc: '', bgColor: '#e3fff8', textColor: 'inherit', title: 'Titre', text: 'Description.' },
            ]
        },
    },
    {
        type: 'ImageCardsGrid',
        label: 'Cartes avec Grandes Images',
        icon: '🖼️🃏',
        description: 'Grille (Image + Icône + Texte)',
        category: 'content',
        defaultProps: {
            columns: 3,
            backgroundColor: 'transparent',
            cards: [
                { heroImage: '', icon: 'users', title: 'Titre', description: 'Description', linkText: 'Découvrir', linkUrl: '#' }
            ]
        },
    },
    {
        type: 'IconSummary',
        label: 'Sommaire Icônes',
        icon: '🔘',
        description: 'Liste de points clés avec icônes',
        category: 'content',
        defaultProps: {
            items: [
                { title: 'Avantage 1', emoji: '✨', link: '' },
                { title: 'Avantage 2', emoji: '🌿', link: '' }
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
        defaultProps: { src: '', alt: '', caption: '', imageWidth: 100, imageAlign: 'center', fullWidth: false },
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
        type: 'VideoCard',
        label: 'Encadré Vidéo',
        icon: '🎬',
        description: 'Vidéo stylisée avec cadre, durée et annotation',
        category: 'media',
        defaultProps: {
            embedType: 'video',
            embedCode: '',
            aspectRatio: '16/9',
            videoUrl: '',
            thumbnail: '',
            duration: '',
            title: 'On vous montre ?',
            showUnderline: true,
            badgeIcon: 'camera',
            buttonText: 'Voir la vidéo →',
            buttonColor: '#185A48',
            cardStyle: 'sticker',
            cardBgColor: '#FAF6EB',
            cardWidth: 520,
            rotation: -1.5,
            cornerDecoration: 'candy',
            showAnnotation: true,
            annotationText: 'Poppy vous montre comment doser le CBD dans vos recettes sans se tromper !',
            annotationPosition: 'right',
            showArrows: true,
            marginTop: 'none',
            marginBottom: 'medium'
        },
    },
    {
        type: 'FAQ',
        label: 'FAQ',
        icon: '❓',
        description: 'Questions / réponses',
        category: 'content',
        defaultProps: { title: 'Questions Fréquentes', variant: 'accordion', items: [{ question: 'Ma question ?', answer: 'Ma réponse ici.' }] },
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
        type: 'LatestArticlesBlock',
        label: 'Derniers Articles (Auto)',
        icon: '📰',
        description: 'Affiche automatiquement les derniers articles publiés du blog',
        category: 'blog',
        defaultProps: {
            title: 'Nos derniers articles',
            count: 3,
            category: '',
            titleAlign: 'left',
            titleColor: '#1F4B40',
            backgroundColor: '#e3fff8',
            cardStyle: 'border',
            showImage: true,
            showExcerpt: true,
            showCategory: true,
            columns: 3
        },
    },
    {
        type: 'MostReadArticlesBlock',
        label: 'Articles + Lus (Auto)',
        icon: '📈',
        description: 'Affiche automatiquement les articles les plus lus',
        category: 'blog',
        defaultProps: {
            title: 'Les plus lus du moment',
            count: 3,
            category: '',
            titleAlign: 'left',
            titleColor: '#1F4B40',
            backgroundColor: '#e3fff8',
            cardStyle: 'border',
            showImage: true,
            showExcerpt: true,
            showCategory: true,
            columns: 3
        },
    },
    {
        type: 'BlogCategoryFilter',
        label: 'Filtres & Grille Blog',
        icon: '📑',
        description: 'Barre de filtres avec H2 dynamique, recherche et grille d\'articles',
        category: 'blog',
        defaultProps: {
            defaultFilter: 'all',
            sourceMode: 'auto',
            columns: 4,
            showSearch: true,
            showSort: true,
            showCountBadges: true,
            searchPlaceholder: 'Rechercher un article...',
            filters: [
                {
                    id: 'all',
                    label: 'Tout voir',
                    icon: 'all',
                    h2Prefix: 'Tous nos articles',
                    h2Highlight: 'Cuisine & CBD',
                    introText: 'Plats salés, desserts, boissons... faites le plein d\'inspiration avec nos recettes gourmandes au CBD.'
                },
                {
                    id: 'recettes',
                    label: 'Nos recettes',
                    icon: 'chef',
                    h2Prefix: 'À vos tabliers,',
                    h2Highlight: 'on passe en cuisine !',
                    introText: 'Du salé, du sucré, des classiques revisités et quelques expériences maison pour inviter le CBD dans vos assiettes et dans vos verres.'
                },
                {
                    id: 'astuces',
                    label: 'Trucs & astuces',
                    icon: 'lightbulb',
                    h2Prefix: 'Nos trucs & astuces,',
                    h2Highlight: 'les secrets des chefs',
                    introText: 'Dosage, décarboxylation, matières grasses : les techniques indispensables pour cuisiner le CBD sans fausse note.'
                },
                {
                    id: 'fleurs',
                    label: 'Fleurs & saveurs',
                    icon: 'flower',
                    h2Prefix: 'Fleurs & saveurs,',
                    h2Highlight: 'l’art des terpènes',
                    introText: 'Associer les arômes, choisir les bonnes variétés et sublimer les profils gustatifs de vos préparations.'
                },
                {
                    id: 'debuter',
                    label: 'Bien débuter',
                    icon: 'book',
                    h2Prefix: 'Bien débuter,',
                    h2Highlight: 'votre première recette',
                    introText: 'Guides pas-à-pas, précautions de base et conseils faciles pour se lancer en toute sérénité.'
                }
            ],
            articles: [
                {
                    id: 'art-1',
                    title: 'Pâtes crémeuses au CBD et parmesan',
                    badge: 'RECETTE',
                    filterId: 'recettes',
                    excerpt: 'Une recette simple et savoureuse pour un dîner tout en douceur !',
                    image: 'https://res.cloudinary.com/dasqyp35f/image/upload/v1791291468/lesamisducbd/partners/uv7fitxw2ycmqe6dfhib.png',
                    readTime: '8 min',
                    date: '12/08/2024',
                    href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
                },
                {
                    id: 'art-2',
                    title: 'Comment faire une huile infusée au CBD ?',
                    badge: 'CONSEIL',
                    filterId: 'astuces',
                    excerpt: 'Découvrez notre méthode simple et efficace pour des huiles parfaitement aromatisées.',
                    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
                    readTime: '7 min',
                    date: '15/07/2024',
                    href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
                },
                {
                    id: 'art-3',
                    title: 'Brownies au CBD : le duo parfait ?',
                    badge: 'RECETTE',
                    filterId: 'recettes',
                    excerpt: 'Un grand classique gourmand à partager (ou pas !).',
                    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
                    readTime: '6 min',
                    date: '28/07/2024',
                    href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
                },
                {
                    id: 'art-4',
                    title: 'Quelle fleur de CBD choisir pour cuisiner ?',
                    badge: 'CONSEIL',
                    filterId: 'fleurs',
                    excerpt: 'Nos variétés coups de cœur selon vos recettes.',
                    image: 'https://res.cloudinary.com/dasqyp35f/image/upload/v1791460034/lesamisducbd/partners/vcl8mmcwrw77ttrjliyp.png',
                    readTime: '6 min',
                    date: '01/07/2024',
                    href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
                },
                {
                    id: 'art-5',
                    title: 'Bien débuter avec le CBD en cuisine : guide débutant',
                    badge: 'DÉBUTER',
                    filterId: 'debuter',
                    excerpt: 'Température, décarboxylation et dosage : tout ce qu’il faut savoir pour commencer sans stress.',
                    image: '/images/usages/cuisine.webp',
                    readTime: '5 min',
                    date: '20/06/2024',
                    href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
                }
            ]
        }
    },
    {
        type: 'TableOfContents',
        label: 'Sommaire',
        icon: '📋',
        description: 'Table des matières auto-générée depuis les titres',
        category: 'blog',
        defaultProps: {
            title: 'Au programme !',
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
        type: 'InteractiveMap',
        label: 'Carte de France (Mini)',
        icon: '🗺️',
        description: 'Petite carte statique de France avec points',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'SearchBarBlock',
        label: 'Barre de Recherche',
        icon: '🔍',
        description: 'Moteur de recherche complet',
        category: 'conversion',
        defaultProps: { title: '', placeholder: 'Rechercher un produit ou une information…' }
    },
    {
        type: 'StoreLocatorWidget',
        label: 'Carte Interactive (Store Locator)',
        icon: '🌍',
        description: 'Affiche la vraie carte interactive des partenaires',
        category: 'special',
        defaultProps: { subtitle: false, title: 'Où nous retrouver ?', description: 'Découvrez nos points de vente partenaires.' }
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
    },
    {
        type: 'RecrutementText',
        label: 'Texte Recrutement',
        icon: '📝',
        description: 'Titre principal et texte descriptif',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'RecrutementJobs',
        label: 'Offres d\'emploi',
        icon: '💼',
        description: 'Liste des postes ouverts',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'RecrutementContact',
        label: 'Contact Recrutement',
        icon: '✉️',
        description: 'Carte de contact avec bouton modal',
        category: 'special',
        defaultProps: {}
    },
    {
        type: 'DeliverySteps',
        label: 'Étapes Livraison',
        icon: '🚚',
        description: 'Schéma en 4 étapes de livraison (spécifique à la page)',
        category: 'special',
        defaultProps: {}
    },

];

export const CATEGORIES = [
    { id: 'layout', label: 'Mise en page' },
    { id: 'content', label: 'Contenu' },
    { id: 'blog', label: 'Blog / Article' },
    { id: 'conversion', label: 'Conversion' },
    { id: 'leads', label: 'Acquisition / Leads' },
    { id: 'media', label: 'Médias' },
    { id: 'special', label: 'Spécifique' },
];
