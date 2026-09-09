import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import { prestaCheckoutService } from '@/lib/services/prestaCheckoutService';
import { cookies } from 'next/headers';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const userKey = `user:${credentials.email.toLowerCase()}`;
                    let user = await kv.get(userKey);

                    if (!user) {
                        // FALLBACK : Compte non trouvé sur KV, on cherche sur l'ancien PrestaShop
                        console.log(`[NextAuth] Non trouvé dans KV. Recherche sur PrestaShop pour: ${credentials.email}`);
                        const psUrl = process.env.PRESTASHOP_API_URL;
                        const psKey = process.env.PRESTASHOP_API_KEY;

                        try {
                            const fetchUrl = `${psUrl}/customers?ws_key=${psKey}&output_format=JSON&display=full&filter[email]=${encodeURIComponent(credentials.email)}`;
                            const psRes = await fetch(fetchUrl);
                            const psData = await psRes.json();

                            if (psData?.customers?.length > 0) {
                                const psUser = psData.customers[0];

                                // Tester le mot de passe (les hashs PrestaShop 1.7+ sont en $2y$, bcryptjs demande $2a$ ou $2b$)
                                const psHash = psUser.passwd ? psUser.passwd.replace(/^\$2y\$/, '$2a$') : '';

                                if (!psHash) throw new Error("Identifiants incorrects.");

                                const isPasswordValid = await bcrypt.compare(credentials.password, psHash);

                                if (isPasswordValid) {
                                    console.log(`[NextAuth] Migration du compte PrestaShop réussie pour: ${credentials.email}`);

                                    // Créer et importer le profil sur KV instantanément
                                    user = {
                                        id: Date.now().toString(),
                                        email: psUser.email.toLowerCase(),
                                        name: `${psUser.firstname} ${psUser.lastname}`.trim(),
                                        password: psUser.passwd, // on garde le hash original
                                        company: psUser.company || '',
                                        siret: psUser.siret || '',
                                        role: 'client',
                                        id_default_group: parseInt(psUser.id_default_group) || 3, // Groupe récupéré depuis PrestaShop
                                        addresses: [],
                                        createdAt: new Date().toISOString(),
                                        legacy_ps_id: psUser.id // On garde la trace de l'ancien ID
                                    };

                                    await kv.set(userKey, user);
                                } else {
                                    throw new Error("Identifiants incorrects.");
                                }
                            } else {
                                throw new Error("Identifiants incorrects.");
                            }
                        } catch (apiErr) {
                            console.error("[NextAuth] Erreur lors de la vérification PrestaShop:", apiErr);
                            throw new Error("Identifiants incorrects.");
                        }
                    } else {
                        // L'utilisateur existe déjà dans KV, vérification normale
                        // On gère le cas où l'utilisateur a été migré et possède toujours un hash $2y$ original
                        const hashToTest = user.password.startsWith('$2y$')
                            ? user.password.replace(/^\$2y\$/, '$2a$')
                            : user.password;

                        const isPasswordValid = await bcrypt.compare(credentials.password, hashToTest);

                        if (!isPasswordValid) {
                            console.error("[NextAuth] Mot de passe invalide pour:", credentials.email);
                            throw new Error("Identifiants incorrects.");
                        }

                        // Rafraîchir le groupe depuis PrestaShop à chaque connexion
                        // Cela reflète les changements faits par l'admin dans le Back Office PrestaShop
                        try {
                            const psUrl = process.env.PRESTASHOP_API_URL;
                            const psKey = process.env.PRESTASHOP_API_KEY;
                            const psRes = await fetch(`${psUrl}/customers?ws_key=${psKey}&output_format=JSON&display=full&filter[email]=${encodeURIComponent(credentials.email)}`);
                            const psData = await psRes.json();

                            if (psData?.customers?.length > 0) {
                                const freshGroup = parseInt(psData.customers[0].id_default_group);
                                const freshPsId = psData.customers[0].id;
                                if (freshGroup && freshGroup !== user.id_default_group) {
                                    console.log(`[NextAuth] Mise à jour du groupe pour ${credentials.email}: ${user.id_default_group} → ${freshGroup}`);
                                    user = { ...user, id_default_group: freshGroup, legacy_ps_id: freshPsId };
                                    await kv.set(userKey, user);
                                } else if (!user.legacy_ps_id && freshPsId) {
                                    // Stocker l'id PS si pas encore fait
                                    user = { ...user, legacy_ps_id: freshPsId };
                                    await kv.set(userKey, user);
                                }
                            } else {
                                // L'utilisateur n'existe pas du tout sur PrestaShop ! (Créé depuis le front Next)
                                // On le crée silencieusement pour que son ID existe pour les paniers
                                console.log(`[NextAuth] Création automatique sur PrestaShop pour le nouvel utilisateur front: ${credentials.email}`);
                                const newPsUser = await prestaCheckoutService.createCustomer({
                                    email: user.email,
                                    firstname: user.firstname || user.name.split(' ')[0] || 'Client',
                                    lastname: user.lastname || user.name.split(' ').slice(1).join(' ') || 'CBD',
                                    company: user.company,
                                    siret: user.siret,
                                    birthday: user.birthday,
                                    id_gender: user.id_gender,
                                    role: user.role
                                }, 0);

                                if (newPsUser && newPsUser.id) {
                                    user = { ...user, legacy_ps_id: newPsUser.id };
                                    await kv.set(userKey, user);

                                    // Lier le filleul à son parrain (si code présent)
                                    const cookieStore = cookies();
                                    const sponsorCode = cookieStore.get('sponsorship_code')?.value;
                                    
                                    if (sponsorCode) {
                                        console.log(`[NextAuth] Code de parrainage trouvé: ${sponsorCode}. Enregistrement pour ${newPsUser.id}...`);
                                        const PRESTASHOP_BASE_URL = process.env.NEXT_PUBLIC_PRESTASHOP_URL || 'https://my.lesamisducbd.fr';
                                        const REWARDS_API_SECRET = process.env.REWARDS_API_SECRET || 'SecretFidelite2026XyZ';
                                        
                                        try {
                                            const sponsorRes = await fetch(`${PRESTASHOP_BASE_URL}/module/allinone_rewards/api?secret=${REWARDS_API_SECRET}&action=register_sponsorship&new_customer_id=${newPsUser.id}&sponsor_code=${sponsorCode}`);
                                            const sponsorData = await sponsorRes.json();
                                            console.log(`[NextAuth] Résultat parrainage:`, sponsorData);
                                        } catch (e) {
                                            console.error(`[NextAuth] Erreur appel API parrainage:`, e);
                                        }
                                    }
                                }
                            }
                        } catch (refreshErr) {
                            console.warn("[NextAuth] Impossible de rafraîchir le groupe PrestaShop (non bloquant):", refreshErr.message);
                        }
                    }

                    // Retourner les informations utilisateur pour le JWT
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role || 'client',
                        company: user.company || '',
                        id_default_group: user.id_default_group || (user.role === 'buraliste' ? 4 : 3),
                        legacy_ps_id: user.legacy_ps_id || null // On renvoie l'ID PrestaShop
                    };
                } catch (e) {
                    console.error("[NextAuth] Erreur authentification globale:", e);
                    throw new Error(e.message || "Erreur serveur lors de la connexion.");
                }
            }
        })
    ],
    pages: {
        signIn: '/connexion',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Premier login, persister les données étendues dans le JWT
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.company = user.company;
                token.id_default_group = user.id_default_group;
                if (user.legacy_ps_id) token.legacy_ps_id = user.legacy_ps_id;
            }

            // Mettre à jour la session si `update` est appelé par le client
            if (trigger === "update" && session) {
                token = { ...token, ...session.user };
            }

            return token;
        },
        async session({ session, token }) {
            // Passer les données du JWT à la session Front-end
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.company = token.company;
                session.user.id_default_group = token.id_default_group;
                if (token.legacy_ps_id) session.user.legacy_ps_id = token.legacy_ps_id;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 Days
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
