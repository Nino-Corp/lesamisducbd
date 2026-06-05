const { kv } = require('@vercel/kv');
require('dotenv').config({ path: '.env.local' });

async function revertHero() {
    const data = await kv.get('essentiel_content');
    if (data && data.sections) {
        const heroIndex = data.sections.findIndex(s => s.id === 'hero');
        if (heroIndex !== -1) {
            let title = data.sections[heroIndex].props.title;
            // Extract text from inside span if it exists
            const match = title.match(/<span[^>]*>(.*?)<\/span>/i);
            if (match) {
                data.sections[heroIndex].props.title = match[1];
                await kv.set('essentiel_content', data);
                console.log('Reverted hero title in KV! New title: ' + match[1]);
            } else {
                console.log('No span to revert.');
            }
        }
    } else {
        console.log('No sections in KV yet.');
    }
}

revertHero().catch(console.error);
