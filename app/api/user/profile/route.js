import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { kv } from '@vercel/kv';
// Vous devez importer ou reconstruire vos authOptions ici
// Par exemple: import { authOptions } from "../auth/[...nextauth]/route"; 
// Comme authOptions est dans route.js, on va faire une requête "neutre" basée sur la session.
import bcrypt from 'bcryptjs';

const psUrl = process.env.PRESTASHOP_API_URL;
const psKey = process.env.PRESTASHOP_API_KEY;

// Helper to escape XML
const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

export async function GET(req) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 });
        }

        // Fetch live from PrestaShop first
        try {
            const resPs = await fetch(`${psUrl}/customers?ws_key=${psKey}&output_format=JSON&display=full&filter[email]=${encodeURIComponent(session.user.email)}`);
            const dataPs = await resPs.json();

            if (dataPs?.customers?.length > 0) {
                const psUser = dataPs.customers[0];
                const mappedUser = {
                    id: session.user.id || psUser.id,
                    email: psUser.email.toLowerCase(),
                    name: `${psUser.firstname} ${psUser.lastname}`.trim(),
                    firstname: psUser.firstname,
                    lastname: psUser.lastname,
                    company: psUser.company || '',
                    siret: psUser.siret || '',
                    id_gender: parseInt(psUser.id_gender) || null,
                    birthday: psUser.birthday !== '0000-00-00' ? psUser.birthday : '',
                    role: session.user.role || 'client'
                };
                return NextResponse.json({ success: true, user: mappedUser }, { status: 200 });
            }
        } catch (err) {
            console.error("[Profile GET API] PrestaShop fetch failed, falling back to KV:", err);
        }

        // Fallback to KV
        const userKey = `user:${session.user.email.toLowerCase()}`;
        const user = await kv.get(userKey);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Utilisateur introuvable' }, { status: 404 });
        }

        const { password: _, ...safeUser } = user;
        return NextResponse.json({ success: true, user: safeUser }, { status: 200 });

    } catch (error) {
        console.error('[Profile GET API] Error:', error);
        return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 });
        }

        const body = await req.json();
        const userKey = `user:${session.user.email.toLowerCase()}`;
        const existingUser = await kv.get(userKey);

        if (!existingUser) {
            return NextResponse.json({ success: false, message: 'Utilisateur introuvable' }, { status: 404 });
        }

        // 1. Get raw XML skeleton from PrestaShop
        const psGetReq = await fetch(`${psUrl}/customers?ws_key=${psKey}&output_format=JSON&display=full&filter[email]=${encodeURIComponent(session.user.email)}`);
        const psData = await psGetReq.json();

        if (!psData?.customers?.length) {
            return NextResponse.json({ success: false, message: 'Compte PrestaShop introuvable' }, { status: 404 });
        }

        const psCustomer = psData.customers[0];
        const psId = psCustomer.id;

        // Fetch full XML payload forPUT
        const xmlRes = await fetch(`${psUrl}/customers/${psId}?ws_key=${psKey}`);
        let xmlText = await xmlRes.text();

        // 2. Determine fields to update
        const nameParts = (body.name || existingUser.name).trim().split(' ');
        const firstname = body.firstname || nameParts[0] || 'Client';
        const lastname = body.lastname || nameParts.slice(1).join(' ') || 'CBD';

        const companyText = body.company !== undefined ? body.company : (psCustomer.company || '');
        const siretText = body.siret !== undefined ? body.siret : (psCustomer.siret || '');
        const genderText = body.id_gender ? body.id_gender.toString() : (psCustomer.id_gender || '0');

        // Birthday formatting (YYYY-MM-DD expected by PrestaShop)
        let birthdayText = psCustomer.birthday || '0000-00-00';
        if (body.birthday) {
            // Check if it's DD/MM/YYYY
            const parts = body.birthday.split('/');
            if (parts.length === 3) {
                birthdayText = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
            } else {
                birthdayText = body.birthday; // fallback if already formatted or incomplete
            }
        }

        // 3. Password check if user wants to change it
        let newPasswordXml = '';
        let newKVHash = existingUser.password;

        if (body.oldPassword && body.newPassword) {
            const hashToTest = existingUser.password.startsWith('$2y$')
                ? existingUser.password.replace(/^\$2y\$/, '$2a$')
                : existingUser.password;

            const isPasswordValid = await bcrypt.compare(body.oldPassword, hashToTest);
            if (!isPasswordValid) {
                return NextResponse.json({ success: false, message: 'Le mot de passe actuel est incorrect.' }, { status: 400 });
            }

            // PrestaShop will hash the cleartext password we send via API
            newPasswordXml = `<passwd><![CDATA[${body.newPassword}]]></passwd>`;
            // We also update our KV with a new hash
            newKVHash = await bcrypt.hash(body.newPassword, 10);
        }

        // 4. Inject new values into XML using regex (PrestaShop requires sending all fields)
        xmlText = xmlText.replace(/<firstname>.*?<\/firstname>/s, `<firstname><![CDATA[${escapeXml(firstname)}]]></firstname>`);
        xmlText = xmlText.replace(/<lastname>.*?<\/lastname>/s, `<lastname><![CDATA[${escapeXml(lastname)}]]></lastname>`);
        xmlText = xmlText.replace(/<company>.*?<\/company>/s, `<company><![CDATA[${escapeXml(companyText)}]]></company>`);
        xmlText = xmlText.replace(/<siret>.*?<\/siret>/s, `<siret><![CDATA[${escapeXml(siretText)}]]></siret>`);
        xmlText = xmlText.replace(/<id_gender>.*?<\/id_gender>/s, `<id_gender><![CDATA[${genderText}]]></id_gender>`);
        xmlText = xmlText.replace(/<birthday>.*?<\/birthday>/s, `<birthday><![CDATA[${birthdayText}]]></birthday>`);

        if (newPasswordXml) {
            xmlText = xmlText.replace(/<passwd>.*?<\/passwd>/s, newPasswordXml);
        }

        // 5. Send PUT to PrestaShop
        const putRes = await fetch(`${psUrl}/customers?ws_key=${psKey}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'text/xml' },
            body: xmlText
        });

        if (!putRes.ok) {
            console.error("[Profile PUT API] PrestaShop PUT Failed:", await putRes.text());
            return NextResponse.json({ success: false, message: 'Erreur lors de la synchronisation avec PrestaShop' }, { status: 500 });
        }

        // 6. Sync changes back to KV
        const updatedUser = {
            ...existingUser,
            name: `${firstname} ${lastname}`,
            company: companyText,
            siret: siretText,
            password: newKVHash,
            updatedAt: new Date().toISOString()
        };
        await kv.set(userKey, updatedUser);

        const { password: _, ...safeUser } = updatedUser;

        return NextResponse.json({
            success: true,
            message: 'Profil mis à jour',
            user: safeUser
        }, { status: 200 });

    } catch (error) {
        console.error('[Profile PUT API] Error:', error);
        return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
    }
}
