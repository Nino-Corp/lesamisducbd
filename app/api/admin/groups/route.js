import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const psUrl = process.env.PRESTASHOP_API_URL;
        const psKey = process.env.PRESTASHOP_API_KEY;

        if (!psUrl || !psKey) {
            return NextResponse.json({ error: 'PrestaShop credentials missing' }, { status: 500 });
        }

        const fetchUrl = `${psUrl}/groups?ws_key=${psKey}&output_format=JSON&display=[id,name]`;
        const res = await fetch(fetchUrl);
        const data = await res.json();

        if (data && data.groups) {
            // PrestaShop name can be an array of objects for multiple languages, or a single string
            const formattedGroups = data.groups.map(g => {
                let name = "Groupe " + g.id;
                if (typeof g.name === 'string') {
                    name = g.name;
                } else if (Array.isArray(g.name)) {
                    // Try to find French (id 1 usually) or just take the first one
                    const frName = g.name.find(n => n.id === "1" || n.id === 1);
                    name = frName ? frName.value : g.name[0].value;
                }
                return {
                    id: parseInt(g.id, 10),
                    name: name
                };
            });
            return NextResponse.json({ groups: formattedGroups });
        }

        return NextResponse.json({ groups: [] });
    } catch (error) {
        console.error('Error fetching PrestaShop groups:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
