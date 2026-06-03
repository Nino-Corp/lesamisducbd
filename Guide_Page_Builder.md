# Guide d'Utilisation : Page Builder Les Amis du CBD

Bienvenue dans le guide officiel de votre constructeur de pages sur-mesure. Cet outil puissant vous permet de concevoir, modifier et publier des pages pour votre site web de manière totalement autonome, sans avoir besoin de toucher au code source.

Ce document répertorie **toutes les fonctionnalités** du Page Builder et vous explique pas à pas comment les utiliser.

---

## 1. Création et Gestion des Pages

### L'écran d'accueil
Depuis l'onglet **Builder** dans votre panel d'administration, vous avez une vue d'ensemble de toutes vos pages.
* **Barre de recherche & Filtres** : Retrouvez rapidement une page par son titre, son slug (l'URL), ou filtrez par type de page (Blog, Landing, FAQ).
* **Score SEO** : Chaque page affiche une petite pastille "SEO XX%". Ce score est calculé en fonction du remplissage de vos balises SEO.
* **Statuts** : Une page peut être *Brouillon* (grise), *Publié* (verte) ou *Planifiée* (jaune).

### Créer une nouvelle page
1. Cliquez sur le bouton **+ Créer**.
2. **Le type de page** : Choisissez si c'est un Article de blog, une Landing page, une FAQ, etc. Cela aide Google à comprendre votre page.
3. **Les modèles de départ** : Vous pouvez partir d'une page blanche, ou gagner du temps en choisissant un modèle (ex: *Article de blog typique* qui pré-remplit le titre, le sommaire et le texte).
4. Remplissez le Titre et cliquez sur Créer.

### Dupliquer une page existante
Si vous avez fait un superbe design de Landing Page et que vous voulez le réutiliser pour une autre promotion, cliquez simplement sur le bouton **📋 (Dupliquer)** sur l'écran d'accueil du Builder.

---

## 2. L'Interface d'Édition

L'interface se divise en deux parties principales :
* **À gauche : L'Éditeur & La Liste des sections** (là où vous travaillez).
* **À droite : Le Canvas Interactif** (là où vous voyez le rendu en direct).

### 2.1 Le Panneau de Gauche (Structure)
C'est ici que vous gérez l'ordre de vos blocs.
* **Ajouter un bloc** : Cliquez sur le grand bouton vert `+ Ajouter un bloc`.
* **Réorganiser** : Maintenez le clic sur l'icône de la petite poignée (⠿) à gauche d'un bloc, et glissez-le plus haut ou plus bas.
* **Masquer un bloc** : Cliquez sur l'icône de l'œil (👁) pour cacher temporairement un bloc de la page sans le supprimer.

### 2.2 Le Panneau de Gauche (Édition d'un bloc)
Lorsque vous cliquez sur un bloc dans la liste, vous rentrez dans ses paramètres :
* Modifiez le texte, ajoutez des images, changez les couleurs... Le rendu s'actualise en temps réel à droite !
* **Options Avancées (tout en bas)** :
    * **Marge Haut / Bas** : Permet de rajouter de l'espace ("respiration") autour de votre bloc (Petit, Moyen, Grand).
    * **Masquer sur Mobile / PC** : Idéal si vous voulez faire un affichage spécifique selon l'appareil du client.
    * **ID d'ancre** : Si vous tapez `contact` ici, vous pourrez créer un lien ailleurs sur le site pointant vers `#contact` et la page défilera toute seule jusqu'à ce bloc !

### 2.3 Le Canvas de Droite (Aperçu Live)
* **Les modes d'affichage** : En haut du canvas, cliquez sur `💻 PC`, `📱 Tablette` ou `📱 Mobile` pour vérifier que votre page est belle sur tous les écrans.
* **Le mode Plein Écran** : Cliquez sur `↗️ Plein écran` pour cacher le panneau d'édition et voir votre page en conditions réelles.

---

## 3. L'Historique et La Sauvegarde

* **Brouillon vs Publié** : En haut à droite, vous pouvez choisir de garder la page en "Brouillon" (invisible pour les clients). Dès que vous passez en "Publié", la page est en ligne !
* **Planification** : Si vous choisissez "Planifié", vous pourrez choisir une date et une heure (ex: vendredi à 18h). La page se publiera toute seule à ce moment-là.
* **Sauvegarde Auto** : Pas d'inquiétude, l'éditeur sauvegarde automatiquement votre travail si vous oubliez de cliquer sur le bouton "Enregistrer".
* **L'Historique (La machine à remonter le temps)** : Vous avez fait une bêtise ? 
    1. Utilisez le raccourci clavier `Ctrl + Z` pour annuler la dernière action.
    2. Si l'erreur date d'hier, cliquez sur le bouton `🕐 Historique` en haut. Vous y trouverez les 10 dernières sauvegardes en base de données et pourrez restaurer la version de votre choix en 1 clic !

---

## 4. Le Panneau SEO (Référencement)

Le bouton `⚙️ SEO` en haut à droite est votre meilleur ami pour Google.
* **Titre et Description Meta** : C'est ce qui s'affichera dans les résultats Google. Une jauge vous indique si votre texte est trop court ou trop long.
* **Image OpenGraph** : L'image qui s'affichera quand vous partagerez le lien de la page sur Facebook, Twitter ou WhatsApp.
* **Indexation (Noindex)** : Cochez cette case si vous créez une page privée (ex: promo VIP) que vous ne voulez SURTOUT PAS voir apparaître sur Google.
* *Note technique :* Toutes vos pages publiées sont automatiquement ajoutées au `sitemap.xml` du site pour que Google les trouve rapidement.

---

## 5. Catalogue des Blocs Disponibles

Le constructeur inclut tous les éléments de design professionnels du site :

**📝 Contenu & Texte**
* **Contenu Hero (En-tête)** : Le grand titre principal de la page (H1) avec une description courte. Indispensable pour le SEO.
* **Texte Riche (WYSIWYG)** : L'éditeur de texte complet (comme Word) pour écrire des paragraphes, mettre en gras, ajouter des liens ou des listes à puces.
* **Sommaire (Table des matières)** : Génère un menu cliquable automatiquement.

**🖼️ Médias**
* **Image Simple** : Une grande image d'illustration.
* **Galerie / Grille d'images** : Pour afficher jusqu'à 4 images côte à côte.
* **Code / Iframe** : Pour intégrer un élément externe (Une vidéo YouTube, une carte Google Maps, un formulaire Typeform). *Ne collez que du code de confiance !*

**🛍️ E-commerce & Produits**
* **Grille de Produits** : Sélectionnez manuellement les produits phares de la boutique que vous souhaitez mettre en avant sur cette page.

**🌟 Rassurance & Vente**
* **Pourquoi nous choisir** : Une belle section avec la photo du scientifique à gauche et des puces d'arguments à droite.
* **Comparateur de Marge** : Le fameux calculateur interactif (très utile pour le B2B).
* **Bandeau Qualité Premium** : Un petit encart fin pour rappeler que vos produits sont 100% naturels et testés en laboratoire.
* **Réseau de Partenaires** : Une grille pour afficher les logos des entreprises qui vous font confiance ou vos labels (Agriculture Biologique, etc.).

**👨‍💼 Blogging & Navigation**
* **Carte Auteur** : Pour signer vos articles de blog avec votre photo et votre poste.
* **Articles Similaires** : Pour proposer d'autres lectures à la fin de votre page.
* **Foire aux Questions (FAQ)** : Des questions/réponses qui se déplient au clic (Accordéons).

---

## 6. Quelques Astuces de Pro

1. **La règle du H1** : Pensez toujours à mettre **un seul** bloc "Contenu Hero" par page. C'est le titre principal pour Google.
2. **Duplication rapide** : N'hésitez pas à créer une page "Brouillon" avec tous vos blocs préférés, et à la dupliquer à chaque fois que vous créez une nouvelle Landing Page !
3. **Ne surchargez pas** : Utilisez les options "Marge Haut / Bas" pour laisser vos pages respirer. Un design aéré fait beaucoup plus professionnel.

*(Généré par Antigravity)*
