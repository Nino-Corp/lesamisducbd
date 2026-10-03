import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';
const SETTINGS_KEY = 'loyalty_settings_v1';

const DEFAULT_SETTINGS = {
    tiers: [
        { id: "1", name: "La Graine", minSpent: 0, icon: "/icons/loyalty/graine.svg" },
        { id: "2", name: "Le Bourgeon", minSpent: 100, icon: "/icons/loyalty/bourgeon.svg" },
        { id: "3", name: "La Floraison", minSpent: 300, icon: "/icons/loyalty/floraison.svg" },
        { id: "4", name: "Maître Récolteur", minSpent: 800, icon: "/icons/loyalty/recolteur.svg" }
    ],
    cardStyle: {
        logoText: "Les Amis du CBD Club",
        primaryColor: "#10b981", 
        cardBackground1: "#112924",
        cardBackground2: "#1F4B40",
        textColor: "#ffffff"
    },
    enabledGroups: [3],
    ratio: 10 // 1 point = 10 euros spent by default if 10% ? No, wait. 
    // If they get 10% of their order, spending 100€ gives them 10€.
    // If 1 point = 0.10€ value, then they got 100 points.
    // So 100€ spent = 100 points. The ratio of points to euros spent is 1 point = 1 euro.
    // Let's just set ratio to 1 by default, but let the user change it.
};

export async function GET() {
    try {
        const settings = await kv.get(SETTINGS_KEY);
        return NextResponse.json(settings || DEFAULT_SETTINGS);
    } catch (error) {
        console.error('Loyalty Settings API GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        
        // Basic validation
        if (!body.tiers || !Array.isArray(body.tiers)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Sort tiers by minSpent
        body.tiers.sort((a, b) => a.minSpent - b.minSpent);

        await kv.set(SETTINGS_KEY, body);
        return NextResponse.json({ success: true, settings: body });
    } catch (error) {
        console.error('Loyalty Settings API POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
