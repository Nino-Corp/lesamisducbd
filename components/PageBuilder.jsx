import Header from './Header/Header';
import Marquee from './Marquee/Marquee';
import Hero from './Hero/Hero';
import ProductList from './ProductList/ProductList';
import WhyChooseUs from './WhyChooseUs/WhyChooseUs';
import FAQ from './FAQ/FAQ';
import Link from 'next/link';
import Footer from './Footer/Footer';
import Partners from './Partners/Partners';
import Quote from './Quote/Quote';
import QualityBanner from './QualityBanner/QualityBanner';
import PartnersNetwork from './PartnersNetwork/PartnersNetwork';
import InteractiveMapWrapper from './InteractiveMap/InteractiveMapWrapper';
import JoinUs from './JoinUs/JoinUs';
import ScrollReveal from './ScrollReveal/ScrollReveal';
import RichText from './RichText/RichText';
import ContentHero from './ContentHero/ContentHero';
import ImageBlock from './ImageBlock/ImageBlock';
// New builder blocks
import CTABlock from './CTABlock/CTABlock';
import TwoColumns from './TwoColumns/TwoColumns';
import CardsGrid from './CardsGrid/CardsGrid';
import ImageCardsGrid from './ImageCardsGrid/ImageCardsGrid';
import StatsBanner from './StatsBanner/StatsBanner';
import VideoEmbed from './VideoEmbed/VideoEmbed';
import Divider from './Divider/Divider';
import AuthorCard from './AuthorCard/AuthorCard';
import CalloutBox from './CalloutBox/CalloutBox';
import RelatedArticles from './RelatedArticles/RelatedArticles';
import TableOfContents from './TableOfContents/TableOfContents';
import FeaturedProducts from './FeaturedProducts/FeaturedProducts';
import OfferComparator from './OfferComparator/OfferComparator';
import CodeEmbed from './CodeEmbed/CodeEmbed';
import NewsletterBlock from './NewsletterBlock/NewsletterBlock';
import ContactFormBlock from './ContactFormBlock/ContactFormBlock';
import TitleBlock from './TitleBlock/TitleBlock';
import IconSummary from './IconSummary/IconSummary';

import { EssentielIntro, EssentielCarousel, EssentielPoints } from './EssentielBlocks/EssentielBlocks';
import { ProHero, ProSteps } from './ProBlocks/ProBlocks';
import { UsagesIntro, UsagesCarouselBlock, UsagesWarning, UsagesEssentialBox } from './UsagesBlocks/UsagesBlocks';
import { TransparenceHeader, TransparenceQuote, TransparenceFeature, TransparenceCertificates } from './TransparenceBlocks/TransparenceBlocks';
import { RecrutementText, RecrutementJobs, RecrutementContact } from './RecrutementBlocks/RecrutementBlocks';
import DeliverySteps from './LivraisonBlocks/DeliverySteps';

const componentMap = {
    Header,
    Marquee,
    Hero,
    ContentHero,
    ImageBlock,
    QualityBanner,
    ProductList,
    WhyChooseUs,
    PartnersNetwork,
    InteractiveMap: InteractiveMapWrapper,
    InteractiveMapWrapper,
    Partners,
    FAQ,
    JoinUs,
    ScrollReveal,
    RichText,
    TitleBlock,
    Footer,
    Quote,
    CTABlock,
    TwoColumns,
    CardsGrid,
    ImageCardsGrid,
    StatsBanner,
    VideoEmbed,
    Divider,
    AuthorCard,
    CalloutBox,
    RelatedArticles,
    TableOfContents,
    IconSummary,
    FeaturedProducts,
    OfferComparator,
    CodeEmbed,
    NewsletterBlock,
    ContactFormBlock,
    EssentielIntro,
    EssentielCarousel,
    EssentielPoints,
    ProHero,
    ProSteps,
    UsagesIntro,
    UsagesCarouselBlock,
    UsagesWarning,
    UsagesEssentialBox,
    TransparenceHeader,
    TransparenceQuote,
    TransparenceFeature,
    TransparenceCertificates,
    RecrutementText,
    RecrutementJobs,
    RecrutementContact,
    DeliverySteps
};

const NO_ANIMATE = new Set(['Header', 'Hero', 'ProHero', 'TransparenceHeader']);

const cleanHtmlStrings = (obj) => {
    if (typeof obj === 'string') return obj.replace(/&nbsp;/g, ' ');
    if (Array.isArray(obj)) return obj.map(cleanHtmlStrings);
    if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        for (const key in obj) newObj[key] = cleanHtmlStrings(obj[key]);
        return newObj;
    }
    return obj;
};

export default function PageBuilder({ sections }) {
    if (!sections) return null;

    return (
        <>
            {sections.map((section, index) => {
                if (section.props?.isVisible === false) return null;

                const Component = componentMap[section.type];
                if (!Component) {
                    console.warn(`[PageBuilder] No component found for type: ${section.type}`);
                    return null;
                }

                const { paddingTop, paddingBottom, marginTop, marginBottom, hideMobile, hideDesktop, sectionId, ...rawProps } = section.props || {};
                const componentProps = cleanHtmlStrings(rawProps);

                // Map padding values to px/rem
                const paddingMap = { none: '0px', small: '15px', medium: '30px', large: '50px', xl: '80px' };
                // Map margin values to px/rem (including negative for pulling blocks together)
                const marginMap = { 'negative-large': '-50px', 'negative-medium': '-30px', 'negative-small': '-15px', none: '0px', small: '15px', medium: '30px', large: '50px', xl: '80px' };

                const wrapperStyle = {};
                if (paddingTop && paddingMap[paddingTop]) wrapperStyle.paddingTop = paddingMap[paddingTop];
                if (paddingBottom && paddingMap[paddingBottom]) wrapperStyle.paddingBottom = paddingMap[paddingBottom];
                if (marginTop && marginMap[marginTop]) wrapperStyle.marginTop = marginMap[marginTop];
                if (marginBottom && marginMap[marginBottom]) wrapperStyle.marginBottom = marginMap[marginBottom];

                let classNames = '';
                if (hideMobile) classNames += ' hide-mobile';
                if (hideDesktop) classNames += ' hide-desktop';

                const content = NO_ANIMATE.has(section.type) ? (
                    <Component {...componentProps} />
                ) : (
                    <ScrollReveal animation="fade-up" duration={700} delay={100}>
                        <Component {...componentProps} />
                    </ScrollReveal>
                );

                return (
                    <div 
                        key={section.id || index} 
                        id={sectionId || section.id || undefined} 
                        style={wrapperStyle} 
                        className={classNames.trim() || undefined}
                    >
                        {content}
                    </div>
                );
            })}
        </>
    );
}
