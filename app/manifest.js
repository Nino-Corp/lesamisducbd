// Manifest PWA : permet d'installer le site sur l'écran d'accueil.
export default function manifest() {
  return {
    name: 'Les Amis du CBD',
    short_name: 'Les Amis du CBD',
    description: 'Boutique CBD premium française : fleurs, huiles, résines et plus.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1F4B40',
    theme_color: '#1F4B40',
    lang: 'fr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
