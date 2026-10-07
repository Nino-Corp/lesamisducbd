import RelatedArticles from '@/components/RelatedArticles/RelatedArticles';

export default function MostReadArticlesPreview({ 
    title = "Les plus lus du moment", 
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
        title: `Article Populaire ${category ? category + ' ' : ''}${i + 1}`,
        href: '#',
        excerpt: 'Cet article est très lu en ce moment !',
        category: category || 'Populaire',
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
