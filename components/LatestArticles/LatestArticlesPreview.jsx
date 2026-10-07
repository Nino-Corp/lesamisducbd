import RelatedArticles from '@/components/RelatedArticles/RelatedArticles';

export default function LatestArticlesPreview({ 
    title = "Nos derniers articles", 
    count = 3, 
    category = '',
    titleAlign = 'left',
    titleColor = '#1F4B40',
    backgroundColor = '#e3fff8',
    cardStyle = 'border',
    showImage = true,
    showExcerpt = true,
    showCategory = true,
    columns = 3
}) {
    const dummyArticles = Array.from({ length: count }).map((_, i) => ({
        title: `Article ${category ? category + ' ' : ''}auto généré ${i + 1}`,
        href: '#',
        excerpt: 'Cet article sera récupéré automatiquement sur le site en ligne...',
        category: category || 'Blog',
        image: '/images/og-image.jpg'
    }));
    return <RelatedArticles 
        title={title} 
        articles={dummyArticles} 
        titleAlign={titleAlign}
        titleColor={titleColor}
        backgroundColor={backgroundColor}
        cardStyle={cardStyle}
        showImage={showImage}
        showExcerpt={showExcerpt}
        showCategory={showCategory}
        columns={columns}
    />;
}
