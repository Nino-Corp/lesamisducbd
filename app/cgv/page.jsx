
import CgvClient from './CgvClient';
import { kv } from '@vercel/kv';

export const metadata = {
    title: 'Conditions Générales de Vente | Les Amis du CBD',
    description: 'Consultez les Conditions Générales de Vente (CGV) de la boutique Les Amis du CBD.',
};

export const revalidate = 60;

export default async function CgvPage() {

    let globalContent = null;
    let content = null;

    try {
        const [gData, cData] = await Promise.all([
            kv.get('global_content'),
            kv.get('cgv_content')
        ]);
        if (gData) globalContent = gData;
        if (cData) content = cData;
    } catch (e) {
        console.error('KV error (cgv):', e);
    }

    if (!content || !content.sections) {
        const visibility = content?.visibility || {};
        
        const simpleMarkdownToHtml = (md) => {
            if (!md) return '';
            return md.split('\n\n').map(p => {
                let html = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                if (html.startsWith('## ')) return `<h2>${html.slice(3)}</h2>`;
                if (html.startsWith('### ')) return `<h3>${html.slice(4)}</h3>`;
                if (html.startsWith('- ')) {
                    const lis = html.split('\n').filter(l => l.startsWith('- ')).map(l => `<li>${l.slice(2)}</li>`).join('');
                    return `<ul>${lis}</ul>`;
                }
                return `<p>${html.replace(/\n/g, '<br/>')}</p>`;
            }).join('');
        };

        const defaultHTML = `
<h2>Article 1 - Dispositions générales relatives aux présentes conditions générales de vente (ci-après les « CGV »)</h2>
<h3>1. 1. Objet</h3>
<p>Les CGV sont applicables exclusivement à la vente en ligne des produits figurant sur le site www.lesamisducbd.fr dont l'accès est libre et gratuit à tout internaute.</p>

<h3>1. 2. Domaine d'application</h3>
<p>Les CGV régissent exclusivement les contrats de vente en ligne des produits de BLUE SKY WELL aux clients et constituent avec la commande en ligne les documents contractuels opposables aux parties, à l'exclusion de tous autres documents, prospectus, catalogues ou photographies des produits qui n'ont qu'une valeur indicative.</p>
<p>Les CGV sont exclusivement applicables aux produits livrés aux clients établis en France métropolitaine, sur les territoires d’Outre-mer, et/ou dans un pays membre de l’UE.</p>
<p>Les CGV sont rédigées, ainsi que l'ensemble des informations contractuelles mentionnées sur le site, en langue française.</p>

<h3>1. 3. Disponibilité et opposabilité des CGV</h3>
<p>Les CGV sont mises à la disposition des consommateurs sur le site du vendeur où elles sont directement consultables.</p>
<p>Les CGV sont opposables au client qui reconnaît, en cochant une case prévue à cet effet, en avoir eu connaissance et les avoir acceptées avant de valider la commande.</p>
<p>La validation de la commande par sa confirmation vaut adhésion par le client aux CGV en vigueur au jour de la commande dont la conservation et la reproduction sont assurées par le vendeur professionnel conformément à l'article 1127-2 du code civil (ancien C. civ., art. 1369-4).</p>

<h3>1. 4. Modification des CGV</h3>
<p>BLUE SKY WELL se réserve la faculté de modifier ses CGV à tout moment.</p>
<p>En cas de modification des CGV, les CGV applicables sont celles en vigueur à la date de la commande dont une copie datée à ce jour peut être remise à sa demande au client.</p>

<h3>1. 5. Divisibilité des clauses des CGV</h3>
<p>La nullité d'une clause contractuelle n'entraîne pas la nullité des CGV, sauf s'il s'agit d'une clause impulsive et déterminante ayant amené l'une des parties à conclure le contrat de vente.</p>
<p>L'inapplication temporaire ou permanente d'une ou plusieurs clauses des CGV par BLUE SKY WELL ne saurait valoir renonciation de sa part aux autres clauses des CGV qui continuent à produire leurs effets.</p>

<h2>Article 2 - Produits</h2>
<p>Les produits offerts à la vente présentés dans le catalogue publié sur le site font chacun l'objet d'un descriptif mentionnant leurs caractéristiques essentielles au sens de l'article L. 111-1 du code de la consommation.</p>
<p>Les photographies illustrant les produits ne constituent pas un document contractuel.</p>
<p>Le mode d'utilisation du produit, si c'est un élément essentiel, est mentionné dans le catalogue électronique ou au plus tard à sa livraison.</p>
<p>Les produits sont offerts et livrés dans la limite des stocks disponibles.</p>
<p>En cas d'indisponibilité du produit commandé, BLUE SKY WELL propose au client soit :</p>
<ul>
    <li>l’envoi d’un produit de substitution présentant des caractéristiques similaires, dont le prix est au moins égal à celui du produit initialement choisi ;</li>
    <li>l’édition d’un bon d’achat du montant de la commande ;</li>
    <li>le remboursement de la commande dans un délai de 7 jours.</li>
</ul>
<p>En dehors du remboursement du prix du produit indisponible, BLUE SKY WELL n'est tenu à aucune indemnité d'annulation, sauf si l'inexécution du contrat lui est personnellement imputable.</p>

<h2>Article 3 - Prix</h2>
<p>Les prix de vente sont indiqués, pour chacun des produits figurant dans le catalogue électronique, en euros toutes taxes comprises, hors frais de livraison et de transport.</p>
<p>Le prix de vente du produit est celui en vigueur au jour de la commande.</p>
<p>Les frais de livraison et de transports sont mentionnés avant validation de la commande et facturés en supplément sauf lorsque la commande dépasse une somme préalablement annoncée sur la page « Livraison et paiement » du site www.lesamisducbd.fr.</p>
<p>Ils sont fixés sur le récapitulatif de la commande.</p>
<p>Le montant total dû par le client est indiqué sur la page de confirmation de commande.</p>
<p>En cas de promotion par les prix, BLUE SKY WELL s'engage à appliquer le prix promotionnel à toute commande passée durant la période de la publicité faite pour la promotion.</p>
<p>BLUE SKY WELL se réserve le droit de modifier ses prix à tout moment, tout en garantissant au client l'application du prix en vigueur au jour de la commande.</p>
<p>Pour les livraisons dans les DOM TOM : il n'y a pas de TVA mais éventuellement des droits de douanes seront à acquitter.</p>

<h2>Article 4- Offre</h2>
<p>Les offres de vente en ligne présentées sur le site sont réservées aux clients résidant en France métropolitaine / territoires d’Outre-mer et/ou dans un pays membre de l’Union européenne et pour des livraisons dans ces mêmes zones géographiques.</p>
<p>Les offres de vente en ligne présentées sur le site sont valables, à défaut d'indication de durée particulière, tant que les produits figurent dans le catalogue électronique et dans la limite des stocks disponibles.</p>
<p>L'acceptation de l'offre par le client est validée, conformément au procédé du double clic, par la confirmation de la commande.</p>

<h2>Article 5 – Compte client</h2>
<p>Avant de passer commande sur le site, le Client peut créer un compte client. A cet effet, il doit remplir un formulaire dans la rubrique « Mon Compte » avec les informations le concernant, et il s’engage à donner des informations exactes et à ne pas usurper l’identité d’un tiers ni à modifier son âge.</p>
<p>Le Client indique notamment son adresse électronique et un mot de passe qui lui serviront pour s’identifier sur le site ultérieurement. L’identifiant et le mot de passe sont personnels et le Client s’engage à ne pas les divulguer.</p>

<h2>Article 6 - Commande</h2>
<h3>6. 1. Étapes de conclusion du contrat</h3>
<p>Pour passer commande, le client, après avoir rempli son panier virtuel en indiquant les produits sélectionnés et les quantités souhaitées, clique ensuite sur le bouton « Commander » et fournit les informations relatives à la livraison et au mode de paiement.</p>
<p>Avant de cliquer sur le bouton « Commander », le client a la possibilité de vérifier le détail de sa commande et son prix total et de revenir aux pages précédentes pour corriger d'éventuelles erreurs ou éventuellement modifier sa commande.</p>
<p>Le contrat de vente est formé au moment de l'envoi par le client de la confirmation de sa commande.</p>

<h3>6. 2. Modification de commande</h3>
<p>Toute modification de commande par le client après confirmation de sa commande est soumise à l'acceptation du vendeur professionnel.</p>

<h3>6.3. Confirmation de la commande</h3>
<p>Un courrier électronique accusant réception de la commande et de son paiement est envoyé par BLUE SKY WELL dans les meilleurs délais.</p>
<p>BLUE SKY WELL se réserve le droit de refuser toute commande pour des motifs légitimes et plus particulièrement si les quantités de produits commandés sont anormalement élevées pour des clients ayant la qualité de particuliers.</p>

<h3>6.4. Archivage</h3>
<p>L'archivage des communications, des bons de commande et des factures est effectué sur un support fiable et durable de manière à constituer une copie fidèle et durable conformément à l'article 1360 du code civil. Ces communications, bons de commande et factures peuvent être produits à titre de preuve du contrat.</p>

<h2>Article 7 - Paiement</h2>
<p>Le prix des produits est exigible en totalité après confirmation de la commande.</p>

<h3>7.1 Modalités de paiement</h3>
<p>Le paiement s'effectue en ligne par carte bancaire ou via PayPal.</p>

<h3>7.2. Sécurisation du paiement</h3>
<p>Notre site fait l’objet des systèmes de sécurisation 3D secure obligatoire et PCI DSS.</p>

<h3>7.3. Défaut de paiement</h3>
<p>En cas de défaut de paiement de l’intégralité du prix sous dix jours, le contrat sera considéré comme résolu d’office.</p>

<h2>Article 8 - Livraison</h2>
<h3>8. 1. Zone de livraison</h3>
<p>BLUE SKY WELL livre toute commande à destination de la France métropolitaine, des territoires d’Outre-Mer et du territoire de l’Union Européenne.</p>

<h3>8.2. Délais de livraison</h3>
<p>BLUE SKY WELL s’engage à livrer les produits dans le délai indiqué sur la page de validation de la commande par le client, à savoir :</p>
<ul>
    <li>De 24 heures à 5 jours en France métropolitaine ;</li>
    <li>De 3 jours à 10 jours dans les pays de l’Union européenne ;</li>
    <li>5 à 20 jours dans les territoires d’Outre-mer.</li>
</ul>
<p>Le délai de livraison correspond au délai d’expédition indiqué sur la page du produit auquel s’ajoute le délai de traitement et d’acheminement.</p>
<p>Le délai court à compter du paiement total de la commande.</p>
<p>Les délais ne s’appliquent pas en cas de force de majeure ou de cas fortuit.</p>

<h3>8. 3. Frais de livraison</h3>
<p>Les frais de livraison sont à la charge du client, sauf lorsque la commande dépasse un montant préalablement déterminé.</p>

<h3>8.4. Modalités de livraison</h3>
<p>Les produits sont livrés à l'adresse indiquée par le client sur le bon de commande.</p>
<p>La livraison est effectuée par :</p>
<ul>
    <li>la remise directe du produit au client par les transporteurs en fonction de la taille de l’objet ;</li>
    <li>par livraison à domicile ;</li>
    <li>par retrait en point relais.</li>
</ul>
<p>Si le colis fait l’objet d’une mise à disposition, il devra être retiré par le client dans un délai de quinze jours à compter de l'avis de mise à disposition.</p>
<p>En l'absence de retirement dans le délai indiqué, BLUE SKY WELL peut, après une mise en demeure du client, restée sans effet, procéder au retirement, résoudre de plein droit la commande. Les frais de livraison ne seront pas remboursés, et les éventuels frais de retour mis à la charge du client.</p>

<h3>8.5. Conformité des produits</h3>
<p>Lorsque le produit est livré à l'adresse indiquée il appartient au client de vérifier en présence du livreur l'état du produit livré et, le cas échéant, d’émettre des réserves sur le bon de livraison ou sur le récépissé de transport.</p>
<p>Si le produit n'est pas conforme à la commande, le client doit adresser une réclamation au vendeur professionnel en vue d'obtenir le remplacement du produit ou éventuellement la résolution de la vente.</p>

<h3>8.6. Livraison et transfert du risque</h3>
<p>Le produit, qui est livré au client par un transporteur choisi par BLUE SKY WELL, voyage aux risques et périls du vendeur. Le risque est transféré à l’acheteur lorsqu’il prend physiquement possession de la marchandise.</p>
<p>Les risques de perte ou d'endommagement des biens sont transférés au client au moment où il prend, ou un tiers qu'il a désigné, physiquement possession du bien, sans distinction selon sa nature.</p>

<h3>8.8. Transfert de propriété</h3>
<p>À partir de la livraison effective, la propriété du produit est transférée au client.</p>

<h3>8.9. Retard de livraison</h3>
<p>Si la livraison n’est pas intervenue dans un délai de 30 jours suivant la date de la commande en ligne, le client peut demander à être remboursé dans un délai de 30 jours.</p>
<p>Ce délai ne s’applique pas en cas de force majeure.</p>

<h3>8.10. Défaut de livraison</h3>
<p>Le défaut total de livraison entraîne la résolution de plein droit du contrat de vente et le remboursement du prix payé, incluant les frais de livraison.</p>
<p>Un incident de livraison ne sera pas considéré comme un défaut de livraison.</p>

<h2>Article 9 - Garantie légale de conformité et garantie des vices cachés</h2>
<p>Tous les produits fournis par BLUE SKY WELL bénéficient de la garantie légale de conformité prévue aux articles L. 217-4 et suivants du code de la consommation ou de la garantie des vices cachés prévue aux articles 1641 et suivants du code civil.</p>
<p>La loi française applicable au contrat ne peut avoir pour effet de priver le client résidant dans un autre État membre des dispositions sur les garanties que lui accorde son droit national en application de la directive du 25 mai 1999 concernant la vente et les garanties des biens de consommation.</p>
<p>BLUE SKY WELL est tenu de la garantie à raison des défauts cachés de la chose vendue qui la rendent impropre à l'usage auquel on la destine, ou qui diminuent tellement cet usage que le client ne l'aurait pas acquise, ou n'en aurait donné qu'un moindre prix, s'il les avait connus.</p>
<p>Le client peut décider de mettre en œuvre la garantie contre les défauts cachés de la chose vendue au sens de l'article 1641 du code civil. Dans cette hypothèse, il peut choisir entre la résolution de la vente ou une réduction du prix de vente conformément à l'article 1644 du code civil.</p>

<h2>Article 10 - Droit de rétractation et retour des articles commandés</h2>
<p>Conformément aux articles L. 221-5 et suivants du code de la consommation, le client dispose d’un délai de 14 jours à compter de la réception, par lui-même ou un tiers, des articles commandés pour exercer son droit à rétraction sans avoir à justifier de motifs ou payer de pénalités.</p>
<p>Pour exercer le droit de rétractation, le client doit remplir le formulaire de rétractation sur la page suivante https://www.lesamisducbd.fr/formulaire-de-retractation.html ou envoyer un courriel contenant son nom, prénom, adresse et numéro de commande et indiquant sans ambiguïté qu’il exerce son droit à rétractation à l’adresse suivante : lesamisducbd@gmail.com</p>
<p>Les frais de retour du produit commandé et livré au client seront supportés par le client.</p>
<p>Le client peut renvoyer les produits à l’adresse postale suivante :</p>
<p><strong>BLUE SKY WELL, 25 RUE PRINCIPALE ETIENNE GEORGES 07120 CHAUZON</strong></p>
<p>Les produits retournés doivent être neufs, non utilisés, et le cas échéant dans leur boite d'origine. Tout article retourné sali et/ou endommagé par le client ne sera pas repris.</p>
<p>Le retour se fait après réception et confirmation de la réclamation par BLUE SKY WELL.</p>
<p>Il appartient au client de se ménager la preuve de ce retour.</p>
<p>Le Client sera remboursé de l'intégralité de sa commande, au prix facturé, exception faite des frais de livraison, dans un délai de 15 jours à compter de la réception par BLUE SKY WELL de la commande retournée. Ce remboursement s'effectuera par le même moyen de paiement que celui utilisé pour la transaction initiale.</p>
<p>Si le retour est refusé par BLUE SKY WELL pour les raisons ci-avant exposées, les produits seront alors retournés au client aux frais de ce dernier sans que celui-ci puisse exiger une quelconque compensation ou droit à remboursement, à l'exception de l'exercice ultérieur de ses droits à garantie sur les produits vendus.</p>

<h2>Article 11 – Réclamations</h2>
<p>En cas de litige, le client doit former une réclamation amiable auprès de BLUE SKY WELL par mail à lesamisducbd@gmail.com ou par courrier postal à l'adresse suivante : BLUE SKY WELL, 25 RUE PRINCIPALE ETIENNE GEORGES 07120 CHAUZON</p>

<h2>Article 12 : Propriété intellectuelle</h2>
<p>Le contenu du site www.lesamisducbd.fr , la structure générale ainsi que les logiciels, textes, images animées ou non, photographies, son savoir-faire et tous les autres éléments composant le site sont la propriété exclusive de la société BLUE SKY WELL ou de ses partenaires qui lui ont concédé une licence.</p>
<p>Toute représentation totale ou partielle de ce site par quelque personne que ce soit, sans l’autorisation expresse de la société BLUE SKY WELL est interdite et constituerait une contrefaçon sanctionnée par le Code de la propriété intellectuelle.</p>
<p>Les signes distinctifs de la société BLUE SKY WELL et de ses partenaires, tels que les noms de domaine, marques, dénominations ainsi que les logos figurant sur le site sont protégés par le Code de la propriété intellectuelle.</p>
<p>Toute reproduction totale ou partielle de ces signes distinctifs effectuée à partir des éléments du site sans autorisation expresse de la société BLUE SKY WELL est donc prohibée.</p>

<h2>Article 13 : Force majeure</h2>
<p>En cas de force majeure telle que définie par la jurisprudence en cours, l'exécution des prestations de BLUE SKY WELL sera suspendue pour tout ou partie. La force majeure s'entend de tout événement extérieur, imprévisible et insurmontable empêchant BLUE SKY WELL d'exécuter ses obligations contractuelles.</p>
<p>En cas de survenance d'un événement qualifié de force majeure selon l'alinéa précédent, BLUE SKY WELL s'engage à le notifier au client dans les plus brefs délais.</p>

<h2>Article 14 - Litiges, tribunal compétent et droit applicable</h2>
<p>Le présent contrat et les CGV le régissant sont soumis à la loi française, sous réserve des règles impératives du pays de résidence du consommateur.</p>
<p>À défaut d'accord amiable, tout litige relatif à l'existence, l'interprétation, la conclusion, l'exécution ou la rupture du contrat ainsi que sur tous les documents connexes à ce contrat relèvera de la compétence du tribunal judiciaire et/ou du tribunal de commerce de l'Ardèche.</p>
        `;

        content = content || {};
        content.sections = [
            { id: 'hero', type: 'ContentHero', props: {
                title: content?.hero?.title || "CGV",
                subtitle: content?.hero?.subtitle || "Conditions Générales de Vente",
            }, isVisible: visibility.hero !== false },
            
            { id: 'content', type: 'RichText', props: {
                content: content.markdown ? simpleMarkdownToHtml(content.markdown) : defaultHTML
            }, isVisible: visibility.content !== false }
        ];
    }

    return <CgvClient globalContent={globalContent} content={content} />;
}
