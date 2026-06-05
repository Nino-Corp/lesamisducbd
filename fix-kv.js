const { kv } = require('@vercel/kv');
require('dotenv').config({ path: '.env.local' });

async function fixHero() {
    const data = await kv.get('essentiel_content');
    if (data && data.sections) {
        const heroIndex = data.sections.findIndex(s => s.id === 'hero');
        if (heroIndex !== -1) {
            let title = data.sections[heroIndex].props.title;
            if (!title.includes('span')) {
                data.sections[heroIndex].props.title = `<span style="letter-spacing: -0.05em; text-shadow: 0 2px 10px rgba(0,0,0,0.5); font-size: 2.5rem; font-weight: 700; position: relative; z-index: 2;">${title}</span>`;
                await kv.set('essentiel_content', data);
                console.log('Fixed hero title in KV!');
            } else {
                console.log('Already fixed.');
            }
        }
    } else {
        console.log('No sections in KV yet.');
    }
}

fixHero().catch(console.error);
