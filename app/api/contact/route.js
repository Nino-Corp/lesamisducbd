import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const data = await req.json();

        const { name, company, email, phone, message } = data;

        if (!name || !email) {
            return NextResponse.json({ error: 'Champs obligatoires manquants (Nom et Email)' }, { status: 400 });
        }

        // Pour configurer cet envoi avec Brevo, il faut ajouter EMAIL_USER (login SMTP Brevo) et EMAIL_PASS (clé SMTP) dans .env.local
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // EMAIL_TO définit l'adresse de réception. Sinon on utilise ninoprime@hotmail.com pour les tests.
        const recipient = process.env.EMAIL_TO || 'ninoprime@hotmail.com';

        const mailOptions = {
            from: process.env.EMAIL_USER || '"Les Amis du CBD" <no-reply@lesamisducbd.fr>',
            to: recipient,
            replyTo: email,
            subject: company ? `🔥 Nouveau prospect Buraliste : ${company}` : `Nouveau message de contact : ${name}`,
            text: `
Nouveau message de contact !

Nom : ${name}
${company ? `Société : ${company}` : ''}
Email : ${email}
${phone ? `Téléphone : ${phone}` : ''}

Message :
${message || 'Aucun message.'}
            `,
            html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Nouveau prospect Buraliste</title>
                <style>
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        background-color: #FAFAFA;
                        margin: 0;
                        padding: 0;
                        color: #333333;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                        border: 1px solid #EAEAEA;
                    }
                    .email-header {
                        background: linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%);
                        color: #ffffff;
                        padding: 35px 40px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .email-header::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: #49B197;
                    }
                    .logo-text {
                        font-size: 24px;
                        font-weight: 800;
                        letter-spacing: 1px;
                        margin: 0 0 10px 0;
                        color: #ffffff;
                        text-transform: uppercase;
                    }
                    .logo-accent {
                        color: #49B197;
                    }
                    .header-title {
                        font-size: 16px;
                        font-weight: 400;
                        color: #B0B0B0;
                        margin: 0;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .email-body {
                        padding: 40px;
                    }
                    .greeting {
                        font-size: 20px;
                        font-weight: 600;
                        margin-bottom: 25px;
                        color: #1A1A1A;
                    }
                    .info-card {
                        background-color: #F8F9FA;
                        border-left: 4px solid #49B197;
                        border-radius: 0 8px 8px 0;
                        padding: 25px;
                        margin-bottom: 30px;
                    }
                    .info-row {
                        margin-bottom: 15px;
                        line-height: 1.5;
                    }
                    .info-row:last-child {
                        margin-bottom: 0;
                    }
                    .info-label {
                        font-weight: 600;
                        color: #555555;
                        font-size: 13px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        display: block;
                        margin-bottom: 4px;
                    }
                    .info-value {
                        font-size: 16px;
                        color: #1A1A1A;
                        font-weight: 500;
                    }
                    .message-card {
                        background-color: #ffffff;
                        border: 1px solid #EAEAEA;
                        border-radius: 8px;
                        padding: 25px;
                    }
                    .message-title {
                        font-size: 14px;
                        font-weight: 600;
                        color: #1A1A1A;
                        margin: 0 0 15px 0;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .message-content {
                        font-size: 15px;
                        line-height: 1.6;
                        color: #444444;
                        margin: 0;
                        white-space: pre-wrap;
                        font-style: italic;
                    }
                    .empty-message {
                        color: #999999;
                        font-style: italic;
                        font-size: 14px;
                    }
                    .email-footer {
                        background-color: #F8F9FA;
                        text-align: center;
                        padding: 25px;
                        font-size: 13px;
                        color: #888888;
                        border-top: 1px solid #EAEAEA;
                    }
                    .btn-action {
                        display: inline-block;
                        background-color: #1A1A1A;
                        color: #ffffff !important;
                        text-decoration: none;
                        font-weight: 600;
                        padding: 12px 25px;
                        border-radius: 6px;
                        margin-top: 20px;
                        font-size: 14px;
                        transition: background-color 0.3s;
                    }
                    .btn-action:hover {
                        background-color: #333333;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <p class="logo-text">Les Amis <span class="logo-accent">du CBD</span></p>
                        <p class="header-title">${company ? 'Nouveau Lead Buraliste' : 'Nouveau Message'}</p>
                    </div>
                    
                    <div class="email-body">
                        <div class="greeting">
                            ${company ? 'Un buraliste souhaite vous rejoindre ! 🚀' : 'Un utilisateur vous a contacté ! 📬'}
                        </div>
                        
                        <div class="info-card">
                            ${company ? `
                            <div class="info-row">
                                <span class="info-label">Société / Nom du tabac</span>
                                <span class="info-value">${company}</span>
                            </div>` : ''}
                            <div class="info-row">
                                <span class="info-label">Contact</span>
                                <span class="info-value">${name}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Email</span>
                                <span class="info-value"><a href="mailto:${email}" style="color: #49B197; text-decoration: none;">${email}</a></span>
                            </div>
                            ${phone ? `
                            <div class="info-row">
                                <span class="info-label">Téléphone</span>
                                <span class="info-value"><a href="tel:${phone.replace(/\s+/g, '')}" style="color: #1A1A1A; text-decoration: none;">${phone}</a></span>
                            </div>` : ''}
                        </div>

                        <div class="message-card">
                            <h4 class="message-title">💬 Message laissé :</h4>
                            ${message ?
                    `<p class="message-content">"${message.replace(/\n/g, '<br/>')}"</p>` :
                    `<p class="empty-message">Le prospect n'a pas laissé de message complémentaire.</p>`
                }
                        </div>

                        <center>
                            <a href="mailto:${email}" class="btn-action">Répondre au prospect</a>
                        </center>
                    </div>

                    <div class="email-footer">
                        Cet email vous a été envoyé depuis votre boutique Les Amis du CBD.<br>
                        Le prospect est en attente de réponse.
                    </div>
                </div>
            </body>
            </html>
            `
        };

        // Si l'utilisateur n'a pas configuré l'email, on fait semblant que ça marche dans la console
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('--- [DEV] EMAIL NON ENVOYÉ (Manque EMAIL_USER/EMAIL_PASS) ---');
            console.log(mailOptions.text);
            return NextResponse.json({ success: true, simulated: true });
        }

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        return NextResponse.json({ error: "Erreur serveur lors de l'envoi" }, { status: 500 });
    }
}
