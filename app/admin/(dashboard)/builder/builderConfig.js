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
];

export const CATEGORIES = [
    { id: 'layout', label: 'Mise en page' },
    { id: 'content', label: 'Contenu' },
    { id: 'conversion', label: 'Conversion' },
    { id: 'media', label: 'Médias' },
];
