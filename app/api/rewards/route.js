import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const PRESTASHOP_BASE_URL = process.env.NEXT_PUBLIC_PRESTASHOP_URL || 'https://my.lesamisducbd.fr';
const REWARDS_API_SECRET = process.env.REWARDS_API_SECRET || 'SecretFidelite2026XyZ';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action') || 'get_dashboard';

        if (action === 'get_settings') {
            const prestaUrl = `${PRESTASHOP_BASE_URL}/module/allinone_rewards/api?secret=${REWARDS_API_SECRET}&action=get_settings`;
            const response = await fetch(prestaUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`PrestaShop API status: ${response.status}`);
            return NextResponse.json(await response.json());
        }

        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const psCustomerId = session.user.legacy_ps_id;
        if (!psCustomerId) {
            return NextResponse.json({
                success: true,
                points_available: 0,
                value_available: 0,
                sponsorship_link: '',
                sponsorship_code: ''
            });
        }

        const prestaUrl = `${PRESTASHOP_BASE_URL}/module/allinone_rewards/api?secret=${REWARDS_API_SECRET}&action=${action}&id_customer=${psCustomerId}`;
        
        const response = await fetch(prestaUrl, { cache: 'no-store' });
        
        if (!response.ok) {
            throw new Error(`PrestaShop API responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Rewards API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const psCustomerId = session.user.legacy_ps_id;
        if (!psCustomerId) {
            return NextResponse.json({ error: "Client PrestaShop introuvable" }, { status: 400 });
        }

        const body = await request.json();
        const action = body.action || 'convert_points';

        const prestaUrl = `${PRESTASHOP_BASE_URL}/module/allinone_rewards/api?secret=${REWARDS_API_SECRET}&action=${action}&id_customer=${psCustomerId}`;
        
        const response = await fetch(prestaUrl, {
            method: 'POST',
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`PrestaShop API responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Rewards API POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
