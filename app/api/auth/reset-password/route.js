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
            let firstName = lowerEmail.split('@')[0];
            let existingKvUser = await kv.get(userKey);

            if (existingKvUser) {
                userExists = true;
                if (existingKvUser.firstname) {
                    firstName = existingKvUser.firstname;
                } else if (existingKvUser.name) {
                    firstName = existingKvUser.name.split(' ')[0];
                }
            } else {
                const prestaUser = await prestaCheckoutService.getCustomerByEmail(lowerEmail);
                if (prestaUser) {
                    userExists = true;
                    if (prestaUser.firstname) {
                        firstName = prestaUser.firstname;
                    }
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
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Réinitialisation de votre mot de passe</title>
                            <style>
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                    line-height: 1.6;
                                    color: #1F2937;
                                    background-color: #F3F4F6;
                                    margin: 0;
                                    padding: 0;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 40px auto;
                                    background: #FFFFFF;
                                    border-radius: 16px;
                                    overflow: hidden;
                                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                                }
                                .header {
                                    background-color: #1F4B40;
                                    padding: 30px 20px;
                                    text-align: center;
                                }
                                .header img {
                                    height: 48px;
                                    width: auto;
                                    display: block;
                                    margin: 0 auto;
                                }
                                .content {
                                    padding: 40px 30px;
                                    text-align: center;
                                }
                                h1 {
                                    color: #1F4B40;
                                    font-size: 24px;
                                    font-weight: 700;
                                    margin-bottom: 20px;
                                    margin-top: 0;
                                }
                                p {
                                    font-size: 16px;
                                    color: #4B5563;
                                    margin-bottom: 24px;
                                }
                                .button-container {
                                    margin: 35px 0;
                                }
                                .button {
                                    display: inline-block;
                                    background-color: #00FF94;
                                    color: #0A3222 !important;
                                    font-weight: 700;
                                    font-size: 16px;
                                    text-decoration: none;
                                    padding: 16px 36px;
                                    border-radius: 12px;
                                    box-shadow: 0 4px 12px rgba(0, 255, 148, 0.3);
                                }
                                .footer {
                                    background-color: #F9FAFB;
                                    padding: 24px 30px;
                                    text-align: center;
                                    border-top: 1px solid #E5E7EB;
                                }
                                .footer p {
                                    font-size: 13px;
                                    color: #9CA3AF;
                                    margin: 0 0 10px 0;
                                }
                                .footer a {
                                    color: #1F4B40;
                                    text-decoration: underline;
                                }
                                @media only screen and (max-width: 600px) {
                                    .container {
                                        margin: 20px 15px;
                                        border-radius: 12px;
                                    }
                                    .content {
                                        padding: 30px 20px;
                                    }
                                    h1 {
                                        font-size: 22px;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header" style="background-color: #1F4B40; padding: 30px 20px; text-align: center;">
                                    <a href="${baseUrl}" target="_blank">
                                        <img src="cid:logo" alt="Les Amis du CBD" width="250" height="75" style="height: 75px; width: auto; max-width: 100%; display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none;" />
                                    </a>
                                </div>
                                <div class="content">
                                    <h1>Mot de passe oublié, ${firstName} ?</h1>
                                    <p>Pas de panique, ça arrive aux meilleurs. 🌿<br/>Nous avons reçu une demande pour réinitialiser le mot de passe de votre compte sur <strong>Les Amis du CBD</strong>.</p>
                                    
                                    <div class="button-container">
                                        <a href="${resetUrl}" class="button" target="_blank">Réinitialiser mon mot de passe</a>
                                    </div>
                                    
                                    <p style="font-size: 14px; margin-bottom: 0;">Ce lien sécurisé expire dans <strong style="color: #1F4B40;">1 heure</strong>.</p>
                                </div>
                                <div class="footer">
                                    <p>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail en toute tranquillité. Votre mot de passe actuel est conservé.</p>
                                    <p>© Les Amis du CBD. <a href="mailto:lesamisducbd@gmail.com" target="_blank">Nous contacter</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                        `,
                        attachments: [
                            {
                                filename: 'logo-email.png',
                                path: `${baseUrl}/images/logo-email.png`,
                                cid: 'logo' // same cid value as in the html img src
                            }
                        ]
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
