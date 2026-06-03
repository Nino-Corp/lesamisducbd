'use client';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { renderMarkdown } from '@/lib/utils/markdownRenderer';
import styles from './Privacy.module.css';

const HEADER_PROPS = {
    logoText: "LES AMIS DU CBD",
    logoImage: "/images/logo.webp",
    menuItems: [
        { label: "PRODUITS", href: "/produits" },
        { label: "L'ESSENTIEL", href: "/essentiel" },
        { label: "CBD & USAGES", href: "/usages" },
        { label: "BURALISTE", href: "/professionnel" }
    ]
};

const FOOTER_PROPS = {
    columnLinks: [
        { label: "Livraison", href: "/livraison" },
        { label: "CGV", href: "/cgv" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Transparence", href: "/transparence" },
        { label: "Buraliste", href: "/professionnel" }
    ],
    contactInfo: {
        title: "Les Amis du CBD France",
        address: "25 rue principale 07120 Chauzon (FR)",
        phone: "06 71 82 42 87",
        email: "lesamisducbd@gmail.com"
    },
    newsletter: {
        placeholder: "Votre adresse e-mail",
        disclaimer: "Vous pouvez vous désinscrire à tout moment."
    },
    copyright: "©2024 - Les Amis du CBD"
};

export default function PrivacyClient({ globalContent, content }) {
    const footerProps = {
        ...FOOTER_PROPS,
        newsletter: { ...FOOTER_PROPS.newsletter, isVisible: globalContent?.visibility?.newsletter !== false },
        columnLinks: globalContent?.footerLinks || FOOTER_PROPS.columnLinks,
        contactInfo: globalContent?.contact || FOOTER_PROPS.contactInfo
    };

    const heroTitle = content?.hero?.title || "Politique de confidentialité";

    return (
        <main className={styles.main}>
            <Header {...HEADER_PROPS} menuItems={globalContent?.headerLinks || HEADER_PROPS.menuItems} bannerVisible={globalContent?.visibility?.headerBanner !== false} />

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{heroTitle}</h1>
                </div>

                <div className={styles.content}>
                    {content && content.markdown ? renderMarkdown(content.markdown) : (
                        <>
                            <p>La société BLUE SKY WELL est soucieuse de la protection des données personnelles. Elle met en œuvre une démarche d'amélioration continue de sa conformité au Règlement général de protection des données (RGPD), à la Directive ePrivacy, ainsi qu'à la loi n° 78-17 du 6 janvier 1978 dite Informatique et Libertés pour assurer le meilleur niveau de protection à vos données personnelles.</p>
                            <p>Cette politique vous indique le type de données personnelles que nous collectons, la manière dont nous utilisons vos données personnelles et les droits dont vous disposez pour contrôler l’utilisation que nous en faisons.</p>

                            <p>Au sens du RGPD :</p>
                            <ul>
                                <li>les « données personnelles » sont toutes informations qui vous concernent et permettent de vous identifier, directement ou indirectement.</li>
                                <li>le « traitement de données personnelles » est toute opération ou ensemble d'opérations appliquées à des données à caractère personnel.</li>
                            </ul>
                            <p>Pour toute information sur la protection des données personnelles, vous pouvez également consulter le site de la Commission Nationale de l'Informatique et des Libertés <a href="http://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.</p>

                            <h2>Article 1 – Personne responsable du traitement des données personnelles</h2>
                            <p>Le responsable du traitement des données personnelles est la société BLUE SKY WELL.</p>
                            <p>Les données personnelles sont collectées sur le site internet lesamisducbd.fr et sont traitées par la société BLUE SKY WELL au 25 rue principale 07120 chauzon.</p>

                            <h2>Article 2 – Fondements juridiques</h2>
                            <p>La collecte des données personnelles est justifiée par différents fondement légaux :</p>
                            <ul>
                                <li>le consentement : notamment lorsque vous répondez à nos questions et lorsque vous donnez des avis sur nos produits ;</li>
                                <li>le contrat : le traitement des données personnelles est nécessaire à l’exécution du contrat entre BLUE SKY WELL et vous l’obligation légale ; l’intérêt légitime de la société BLUE SKY WELL, pour assurer le bon fonctionnement du site lesamisducbd.fr mais aussi la lutte contre la fraude.</li>
                            </ul>

                            <h2>Article 3 – Pourquoi mes données sont-elles collectées ?</h2>
                            <ul>
                                <li>Gestion de la relation client, nécessitant essentiellement des données d’identification comme votre nom et vos coordonnées de contact ;</li>
                                <li>Commande, paiement et livraison d’une commande, nécessitant des données telles que vos nom, adresse électronique, adresse de facturation, adresse de livraison, numéro de téléphone, votre sélection de produits ou des informations relatives au paiement ;</li>
                                <li>Amélioration de la navigation sur le site, par une personnalisation de nos services et des messages que vous nous adressons, permettant notamment lors de votre navigation sur notre site de vous proposer des produits similaires à ceux que vous avez déjà achetés ou consultés. Cela nécessite la collecte des données sur votre navigation et vos achats ;</li>
                                <li>Personnalisation des publicités en ligne et des campagnes de communication, nécessitant notamment le recueil des informations de navigation et d’achats sur le site ;</li>
                                <li>Fidélisation par le biais de notre programme de fidélité, nécessitant la collecte des données d’identification et des données relatives à vos achats ;</li>
                                <li>Envoi de communications commerciales, si vous choisissez de souscrire à la newsletter, nécessitant des données lors de la création de votre compte client telles que votre adresse électronique et de votre téléphone portable ;</li>
                                <li>Réponse aux demandes sur nos produits ou notre marque effectuées à l’adresse suivante : lesamisducbd.fr ;</li>
                                <li>Gestion des avis sur des produits pour laquelle nous avons besoin au minimum de votre adresse électronique ;</li>
                                <li>Connaissance des clients et statistiques de performance de notre site, nécessitant le recueil de données pour mieux comprendre nos clients.</li>
                            </ul>

                            <h2>Article 4 – Données personnelles collectées et moment</h2>
                            <p>Nous collections et traitons notamment les données suivantes : nom, prénom, date de naissance (à titre facultatif, sur consentement exprès), adresse électronique, mot de passe, numéro de téléphone, adresse postale, adresse IP, données de connexions et données de navigation, historiques de commandes, produits consultés, incidents de livraisons, réclamations.</p>
                            <p>Ces données sont généralement collectées quand :</p>
                            <ul>
                                <li>Vous vous connectez et naviguez sur notre site lesamisducbd.fr ;</li>
                                <li>Vous créez puis vous connectez à votre compte client ;</li>
                                <li>Vous rédigez un commentaire ;</li>
                                <li>Vous sélectionnez des produits et constituez un panier ;</li>
                                <li>Vous confirmez et payez une commande.</li>
                            </ul>

                            <h2>Article 5 – Durée de conservation des données</h2>
                            <p>Les Données Personnelles des utilisateurs ne sont pas conservées au-delà de la durée strictement nécessaire aux finalités poursuivies, conformément à la Règlementation Applicable.</p>
                            <p>Les données relatives à un client actif sont conservées :</p>
                            <ul>
                                <li>pendant toute la durée de la relation contractuelle, ou</li>
                                <li>jusqu’à l’envoi d’une demande d’une demande suppression, ou</li>
                                <li>Jusqu’à trois ans après une période d’inactivité.</li>
                            </ul>
                            <p>Lorsque vous nous contactez pour obtenir des informations sur nos produits ou notre marque, les données sont conservées pour la durée nécessaire au traitement de cette demande.</p>

                            <h2>Article 6 – Protection des données</h2>
                            <p>Nous utilisons un logiciel SSL (Secure Sockets Layer Software) qui crypte vos informations.</p>

                            <h2>Article 7 – Communication des données à des tiers</h2>
                            <p>Les données que nous collectons sont transmises aux prestataires auxquels nous faisons appel pour la réalisation de nos services : transporteurs, services de paiement en ligne, service de programme de fidélisation externalisé, etc…</p>
                            <p>Vos données ne feront pas l’objet de transmission en dehors de l’Union Européenne.</p>

                            <h2>Article 8 – Mineurs</h2>
                            <p>Notre site n’est pas destiné aux mineurs, nous ne leur vendons pas de produits. En conséquence, nous ne traitons pas les données les concernant.</p>

                            <h2>Article 9 – Vos droits</h2>
                            <p>Conformément à la loi « Informatique et libertés » du 6 janvier 1978 modifiée et du règlement (UE) no 2016/679 du 27 avril 2016, vous bénéficiez de droits relatifs à vos données personnelles que vous pouvez exercer à tout moment :</p>
                            <ul>
                                <li>droit d’accès ;</li>
                                <li>droit de rectification ;</li>
                                <li>droit de limitation du traitement de données (notamment si vous contestez l’exactitude des données, le traitement sera limité pendant la durée de vérification de leur exactitude) ;</li>
                                <li>droit d’effacement, aussi appelé « droit à l’oubli ». Toutefois nous pouvons être contraint de conserver certaines données, notamment pour des motifs légaux ou légitimes impérieux ;</li>
                                <li>droit à la portabilité des données, c’est-à-dire le droit de recevoir les données personnelles que vous nous avez fournies dans un format structuré, couramment utilisé et le droit de transmettre ces données à un autre responsable de traitement ;</li>
                                <li>Droit de refus de toute prospection commerciale ;</li>
                                <li>Vous pouvez enfin formuler des directives relatives à la conservation, à l’effacement et à la communication de vos données à caractère personnel après votre décès.</li>
                            </ul>
                            <p>Vous pouvez exercer vos droits auprès de BLUE SKY WELL à l’adresse suivante : lesamisducbd@gmail.com</p>
                            <p>Pour toute demande ou en cas de différend entre BLUE SKY WELL et les utilisateurs concernant le traitement de leurs données personnelles, ces derniers peuvent adresser leur demande ou leur réclamation à BLUE SKY WELL à l’adresse suivante : lesamisducbd@gmail.com</p>
                            <p>BLUE SKY WELL s’efforcera de trouver une solution satisfaisante pour assurer le respect de la règlementation applicable.</p>
                            <p>En l’absence de réponse de BLUE SKY WELL ou si le différend persiste malgré la proposition de BLUE SKY WELL ou à tout moment, les utilisateurs ont la possibilité d’introduire une réclamation auprès de la CNIL sur son site internet <a href="http://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a> ou auprès de l’autorité de contrôle de l’État membre de l’Union européenne au sein duquel l’utilisateur réside habituellement.</p>

                            <h2>Article 10 - Cookies</h2>
                            <p>La navigation sur le site lesamisducbd.fr est susceptible de provoquer l’installation de cookie(s) sur l’ordinateur de l’utilisateur.</p>
                            <p><strong>Définition</strong> - Un cookie est un fichier de petite taille, qui ne permet pas l’identification de l’utilisateur, mais qui enregistre des informations relatives à la navigation d’un ordinateur sur un site. Les données ainsi obtenues visent à faciliter la navigation ultérieure sur le site, et ont également vocation à permettre diverses mesures de fréquentation.</p>
                            <p><strong>Durée</strong> - Les données collectées grâce aux cookies émis par sont conservées pour une durée maximum de treize mois.</p>
                            <p><strong>Bandeau informatif</strong> - Un bandeau d’information est visible lors de votre première connexion sur notre site. Il permettra d’accepter les cookies, de personnaliser la gestion des cookies, ou de les refuser.</p>
                            <p><strong>Comment bloquer les cookies ?</strong> - L’utilisateur peut configurer son ordinateur de la manière suivante, pour refuser l’installation des cookies :</p>
                            <ul>
                                <li><strong>Sous Internet Explorer :</strong> onglet outil (pictogramme en forme de rouage en haut à droite) / options internet. Cliquez sur Confidentialité et choisissez Bloquer tous les cookies. Validez sur Ok.</li>
                                <li><strong>Sous Firefox :</strong> en haut de la fenêtre du navigateur, cliquez sur le bouton Firefox, puis aller dans l’onglet Options. Cliquer sur l’onglet Vie privée. Paramétrez les Règles de conservation sur : utiliser les paramètres personnalisés pour l’historique. Enfin décochez-la pour désactiver les cookies.</li>
                                <li><strong>Sous Safari :</strong> Cliquez en haut à droite du navigateur sur le pictogramme de menu (symbolisé par un rouage). Sélectionnez Paramètres. Cliquez sur Afficher les paramètres avancés. Dans la section « Confidentialité », cliquez sur Paramètres de contenu. Dans la section « Cookies », vous pouvez bloquer les cookies.</li>
                                <li><strong>Sous Chrome :</strong> Cliquez en haut à droite du navigateur sur le pictogramme de menu (symbolisé par trois lignes horizontales). Sélectionnez Paramètres. Cliquez sur Afficher les paramètres avancés. Dans la section « Confidentialité », cliquez sur préférences. Dans l’onglet « Confidentialité », vous pouvez bloquer les cookies.</li>
                            </ul>
                            <p><strong>Suppression</strong> - Les utilisateur peuvent les supprimer dans les paramètres du navigateur. Toutefois, la suppression de ces cookies peut entrainer certaines perturbations dans l’utilisation du site.</p>
                            <p><strong>Pour plus d’information</strong> - Pour une meilleure connaissance et maitrise des cookies de toute origine et pas seulement ceux du Site, les utilisateurs sont invités à consulter le site Youronlinechoices, édité par l’Interactive Advertising Bureau France (IAB) et la page spécifique de la CNIL :</p>
                            <ul>
                                <li><a href="http://www.youronlinechoices.com/fr/controler-ses-cookies/" target="_blank" rel="noopener noreferrer">http://www.youronlinechoices.com/fr/controler-ses-cookies/</a></li>
                                <li><a href="http://www.cnil.fr/vos-droits/vos-traces/les-cookies/conseils-aux-internautes" target="_blank" rel="noopener noreferrer">http://www.cnil.fr/vos-droits/vos-traces/les-cookies/conseils-aux-internautes</a></li>
                            </ul>
                        </>
                    )}
                </div>
            </div>

            <Footer {...footerProps} />
        </main>
    );
}
