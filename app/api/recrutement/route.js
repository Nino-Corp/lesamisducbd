import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const formData = await req.formData();

        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        const file = formData.get('file');

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const recipient = process.env.EMAIL_TO || 'ninoprime@hotmail.com';

        const mailOptions = {
            from: '"Les Amis du CBD" <contact@lesamisducbd.fr>',
            to: recipient,
            replyTo: email,
            subject: `🤝 Nouvelle Candidature : ${name}`,
            html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Nouvelle Candidature</title>
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
                    .message-content {
                        font-size: 15px;
                        line-height: 1.6;
                        color: #444444;
                        margin: 0;
                        white-space: pre-wrap;
                        font-style: italic;
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
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <p class="logo-text">Les Amis <span class="logo-accent">du CBD</span></p>
                        <p class="header-title">Espace Recrutement</p>
                    </div>
                    
                    <div class="email-body">
                        <div class="greeting">
                            Quelqu'un souhaite rejoindre l'équipe ! 💼
                        </div>
                        
                        <div class="info-card">
                            <div class="info-row">
                                <span class="info-label">Candidat</span>
                                <span class="info-value">${name}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Email de contact</span>
                                <span class="info-value"><a href="mailto:${email}" style="color: #49B197; text-decoration: none;">${email}</a></span>
                            </div>
                        </div>

                        <div class="message-card">
                            <span class="info-label" style="margin-bottom: 10px;">Message du candidat :</span>
                            <p class="message-content">"${message.replace(/\n/g, '<br/>')}"</p>
                        </div>
                        
                        ${file ? `<p style="margin-top: 20px; font-size: 14px; text-align: center;">📎 <b>Une pièce jointe a été envoyée avec cette candidature.</b></p>` : ''}

                        <center>
                            <a href="mailto:${email}" class="btn-action">Contacter le candidat</a>
                        </center>
                    </div>

                    <div class="email-footer">
                        Candidature reçue depuis le site Les Amis du CBD.<br>
                    </div>
                </div>
            </body>
            </html>
            `
        };

        // Traitement de la pièce jointe si présente
        if (file && file instanceof Blob) {
            const buffer = Buffer.from(await file.arrayBuffer());
            mailOptions.attachments = [
                {
                    filename: file.name,
                    content: buffer,
                }
            ];
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('--- [DEV] EMAIL NON ENVOYÉ (Manque EMAIL_USER/EMAIL_PASS) ---');
            return NextResponse.json({ success: true, simulated: true });
        }

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erreur lors de l'envoi de la candidature:", error);
        return NextResponse.json({ error: "Erreur serveur lors de l'envoi" }, { status: 500 });
    }
}
