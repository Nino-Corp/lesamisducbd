const fs = require('fs');

const pages = [
  { id: 'p0', title: 'Accueil', slug: '/', files: ['app/page.js', 'data/home.json'] },
  { id: 'p1', title: 'L\'Essentiel', slug: '/essentiel', files: ['app/essentiel/page.jsx', 'app/essentiel/EssentielClient.jsx'] },
  { id: 'p2', title: 'CBD & Usages', slug: '/usages', files: ['app/usages/page.jsx', 'app/usages/UsagesClient.jsx'] },
  { id: 'p3', title: 'Professionnel / Grossiste', slug: '/professionnel', files: ['app/professionnel/page.jsx', 'app/professionnel/ProfessionnelClient.jsx', 'app/professionnels/page.jsx'] },
  { id: 'p4', title: 'Transparence & Qualité', slug: '/transparence', files: ['app/transparence/page.jsx', 'app/transparence/TransparenceClient.jsx'] },
  { id: 'p5', title: 'Livraison & Retours', slug: '/livraison', files: ['app/livraison/page.jsx', 'app/livraison/LivraisonClient.jsx'] },
  { id: 'p6', title: 'Conditions Générales de Vente', slug: '/cgv', files: ['app/cgv/page.jsx', 'app/cgv/CgvClient.jsx'] },
  { id: 'p7', title: 'Politique de Confidentialité', slug: '/privacy', files: ['app/privacy/page.jsx', 'app/privacy/PrivacyClient.jsx'] },
  { id: 'p8', title: 'Recrutement', slug: '/recrutement', files: ['app/recrutement/page.jsx'] }
];

const results = [];
for (const p of pages) {
    let content = '';
    for (const file of p.files) {
        try {
            if (!fs.existsSync(file)) continue;
            let text = fs.readFileSync(file, 'utf8');
            text = text.replace(/import.*?['\"].*?['\"];/g, '');
            text = text.replace(/<[^>]+>/g, ' ');
            text = text.replace(/[^a-zA-Z0-9éèêëàáâäîïôöùûüçœæ\s]/g, ' ');
            text = text.replace(/\s+/g, ' ').trim();
            content += ' ' + text;
        } catch(e) {}
    }
    content = content.replace(/\s+/g, ' ').trim();
    const { files, ...pageData } = p;
    results.push({ ...pageData, content });
}

fs.writeFileSync('public/search-pages.json', JSON.stringify(results));
console.log('Search index updated!');
