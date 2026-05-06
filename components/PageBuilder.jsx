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
import StatsBanner from './StatsBanner/StatsBanner';
import VideoEmbed from './VideoEmbed/VideoEmbed';
import Divider from './Divider/Divider';

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
    JoinUs,
    FAQ,
    Partners,
    Quote,
    RichText,
    Footer,
    // New blocks
    CTABlock,
    TwoColumns,
    CardsGrid,
    StatsBanner,
    VideoEmbed,
    Divider,
};

const NO_ANIMATE = new Set(['Header', 'Hero']);

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

                const { paddingTop, paddingBottom, hideMobile, hideDesktop, sectionId, ...componentProps } = section.props || {};

                // Map padding values to px/rem
                const paddingMap = { none: '0px', small: '20px', medium: '40px', large: '80px', xl: '120px' };
                const wrapperStyle = {};
                if (paddingTop && paddingMap[paddingTop]) wrapperStyle.paddingTop = paddingMap[paddingTop];
                if (paddingBottom && paddingMap[paddingBottom]) wrapperStyle.paddingBottom = paddingMap[paddingBottom];

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
                        id={sectionId || undefined} 
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
