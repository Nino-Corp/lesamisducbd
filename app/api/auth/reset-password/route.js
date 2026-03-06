import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prestaCheckoutService } from '@/lib/services/prestaCheckoutService';

export async function POST(req) {
    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'request') {
            const { email } = body;
            if (!email) {
                return NextResponse.json({ success: false, message: 'Email requis' }, { status: 400 });
            }

            const lowerEmail = email.toLowerCase();
            const userKey = `user:${lowerEmail}`;

            // Check if user exists in KV or PrestaShop
            let userExists = false;
            let existingKvUser = await kv.get(userKey);

            if (existingKvUser) {
                userExists = true;
            } else {
                const prestaUser = await prestaCheckoutService.getCustomerByEmail(lowerEmail);
                if (prestaUser) {
                    userExists = true;
                }
            }

            if (userExists) {
                // Generate token
                const token = crypto.randomBytes(32).toString('hex');
                // Store token with 1 hour expiration (3600 seconds)
                await kv.set(`reset:${token}`, lowerEmail, { ex: 3600 });

                // Send email
                if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    const transporter = nodemailer.createTransport({
                        host: 'smtp-relay.brevo.com',
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });

                    const baseUrl = process.env.NODE_ENV === 'development'
                        ? 'http://localhost:3000'
                        : (process.env.NEXT_PUBLIC_SITE_URL || 'https://lesamisducbd.fr');

                    const resetUrl = `${baseUrl}/connexion?reset=${token}`;

                    const mailOptions = {
                        from: '"Les Amis du CBD" <contact@lesamisducbd.fr>',
                        to: lowerEmail,
                        subject: `Réinitialisation de votre mot de passe - Les Amis du CBD`,
                        html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
                            <p>Vous avez demandé la réinitialisation de votre mot de passe sur la boutique Les Amis du CBD.</p>
                            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable pendant 1 heure.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="background-color: #49B197; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
                            </div>
                            <p style="color: #666; font-size: 14px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.</p>
                        </div>
                        `
                    };

                    await transporter.sendMail(mailOptions);
                } else {
                    console.warn('[DEV] Email credentials missing. Token generated:', token);
                }
            }

            // Always return success to prevent email enumeration
            return NextResponse.json({ success: true, message: 'Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.' });

        } else if (action === 'reset') {
            const { token, newPassword } = body;

            if (!token || !newPassword) {
                return NextResponse.json({ success: false, message: 'Token et nouveau mot de passe requis' }, { status: 400 });
            }

            if (newPassword.length < 6) {
                return NextResponse.json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
            }

            const lowerEmail = await kv.get(`reset:${token}`);
            if (!lowerEmail) {
                return NextResponse.json({ success: false, message: 'Lien de réinitialisation expiré ou invalide' }, { status: 400 });
            }

            const userKey = `user:${lowerEmail}`;
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            let existingKvUser = await kv.get(userKey);

            if (existingKvUser) {
                // Update existing KV user
                existingKvUser.password = hashedPassword;
                await kv.set(userKey, existingKvUser);
            } else {
                // User only existed in PrestaShop. Fetch details and migrate them to KV.
                const prestaUser = await prestaCheckoutService.getCustomerByEmail(lowerEmail);
                if (!prestaUser) {
                    return NextResponse.json({ success: false, message: 'Utilisateur introuvable' }, { status: 404 });
                }

                const newUser = {
                    id: prestaUser.id.toString(),
                    email: lowerEmail,
                    name: `${prestaUser.firstname} ${prestaUser.lastname}`.trim(),
                    firstname: prestaUser.firstname,
                    lastname: prestaUser.lastname,
                    password: hashedPassword,
                    birthday: '',
                    company: '',
                    siret: '',
                    role: prestaUser.id_default_group == 4 ? 'professionnel' : 'client',
                    id_default_group: prestaUser.id_default_group || 3,
                    addresses: [], // They will have to re-enter addresses or we can fetch them separately later
                    createdAt: new Date().toISOString()
                };

                await kv.set(userKey, newUser);
            }

            // Invalidate the token
            await kv.del(`reset:${token}`);

            return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
        }

        return NextResponse.json({ success: false, message: 'Action invalide' }, { status: 400 });

    } catch (error) {
        console.error('[Reset Password API] Error:', error);
        return NextResponse.json({ success: false, message: 'Erreur lors du traitement de la demande' }, { status: 500 });
    }
}
