// Service worker minimal : rend le site installable (PWA).
// Aucune mise en cache agressive : le contenu (panier, compte, prix) doit toujours être frais.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
