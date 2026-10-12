import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'lesamisducbd/pages';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Vérification de la taille (max 25 Mo)
        const MAX_SIZE_BYTES = 25 * 1024 * 1024;
        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json({
                error: `Le fichier est trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} Mo). La limite est de 25 Mo. Pour préserver les performances et le SEO de votre site, privilégiez l'hébergement sur YouTube ou Vimeo.`
            }, { status: 413 });
        }

        // Convert the File to a Buffer to be able to upload to Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using a promise wrapper since the stream API is callback-based
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: folder.startsWith('lesamisducbd') ? folder : `lesamisducbd/${folder}`,
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        // Return the secure URL and metadata from Cloudinary to the frontend
        return NextResponse.json({ 
            url: uploadResult.secure_url,
            duration: uploadResult.duration || null,
            bytes: uploadResult.bytes || file.size,
            format: uploadResult.format || null
        }, { status: 200 });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error during file upload', details: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
