<?php
/**
 * Passerelle Headless - Téléchargement de Facture PDF v1.1
 */
ini_set('display_errors', 0);
error_reporting(0);

require(dirname(__FILE__) . '/config/config.inc.php');
require(dirname(__FILE__) . '/init.php'); // Requis pour initialiser Smarty et Context

$secret_key = Configuration::get('PS_SAS_SECRET_KEY') ?: 'LacBc67_9sP@!CBD2026_SecureKey';

$id_order = (int)Tools::getValue('id_order');
$id_customer = (int)Tools::getValue('id_customer');
$ts = (int)Tools::getValue('ts');
$signature = Tools::getValue('sign');

if (!$id_order || !$id_customer || !$signature || !$ts) {
    die('Erreur : Paramètres manquants.');
}

if (time() > ($ts + 1800)) { // 30 minutes de validité
    die('Erreur : Lien expiré.');
}

$payload = $id_order . '-' . $id_customer . '-' . $ts;
$expected_signature = hash_hmac('sha256', $payload, $secret_key);

if (!hash_equals($expected_signature, $signature)) {
    die('Erreur : Signature invalide.');
}

$order = new Order($id_order);
if (!Validate::isLoadedObject($order) || $order->id_customer != $id_customer) {
    die('Erreur : Commande introuvable ou accès refusé.');
}

$invoices = $order->getInvoicesCollection();
if (!count($invoices)) {
    die('Erreur : Aucune facture disponible pour cette commande. Vérifiez son statut sur PrestaShop.');
}

if (ob_get_length() > 0) {
    ob_clean();
}

$pdf = new PDF($invoices, PDF::TEMPLATE_INVOICE, Context::getContext()->smarty);
$pdf->render();
exit;
