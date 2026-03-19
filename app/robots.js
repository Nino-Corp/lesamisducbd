import { SITE_URL } from './shared-metadata';

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/private/', '/account/', '/admin/'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
