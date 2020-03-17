<?php
/************************************************************************************************
 *
 * Список материалов
 *************************************************************************************************/

include_once('common_bo.php');

$data = array();
$sitemapxmlPath = $application->getServer()->getFullUrl();
if (!preg_match("#/$#", $sitemapxmlPath))
    $sitemapxmlPath .= "/";

$qb = Cetera\DbConnection::getDbConnection()->createQueryBuilder();
$r = $qb
    ->select('id, fileName as alias')
    ->from('sitemapxml_lists')
    ->execute();

while ($f = $r->fetch()) {
    $data[] = $f;
}

echo json_encode(array(
    'success' => true,
    'rows' => $data
));
?>
