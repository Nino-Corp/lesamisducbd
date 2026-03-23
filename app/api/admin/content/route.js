import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import homeData from '@/data/home.json';

// Force dynamic execution to prevent caching content
export const dynamic = 'force-dynamic';

const KV_KEY = 'home_content';

// Helper function to get initial data from file
async function getInitialData() {
    try {
        return homeData;
    } catch (error) {
        console.error('Error reading initial home.json:', error);
        return { sections: [] }; // Fallback
    }
}

// GET: Retrieve the full home content
export async function GET() {
    try {
        // Try to get data from KV first
        let data = await kv.get(KV_KEY);

        // If KV is empty (first time) or malformed, load from local file and populate KV
        if (!data || !data.sections || data.sections.length === 0) {
            console.log('KV empty or malformed, loading initial data from local file');
            const initialData = await getInitialData();

            // Fix: If for some reason KV had an array instead of { sections: [] }
            data = initialData.sections ? initialData : { sections: Array.isArray(initialData) ? initialData : [] };

            await kv.set(KV_KEY, data);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading content:', error);
        return NextResponse.json(
            { error: 'Failed to load content', details: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}

// POST: Update specific section content
export async function POST(request) {
    try {
        const body = await request.json();
        let data = await kv.get(KV_KEY);
        if (!data) data = await getInitialData();

        // Check if we are doing a bulk update (from the new unified Accueil layout)
        if (body.sections && Array.isArray(body.sections)) {
            data.sections = body.sections;
            await kv.set(KV_KEY, data);
            return NextResponse.json({ success: true, updatedSections: data.sections.length });
        }

        // Legacy individual update
        const { sectionId, newProps } = body;
        if (!sectionId || !newProps) {
            return NextResponse.json({ error: 'Missing sectionId or newProps' }, { status: 400 });
        }

        const sectionIndex = data.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) {
            return NextResponse.json({ error: `Section not found: ${sectionId}` }, { status: 404 });
        }

        data.sections[sectionIndex].props = {
            ...data.sections[sectionIndex].props,
            ...newProps
        };

        await kv.set(KV_KEY, data);

        return NextResponse.json({
            success: true,
            updatedSection: data.sections[sectionIndex]
        });

    } catch (error) {
        console.error('Error updating content:', error);
        return NextResponse.json(
            { error: 'Failed to update content' },
            { status: 500 }
        );
    }
}
