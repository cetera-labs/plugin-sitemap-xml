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

$sort = !empty($_REQUEST["sort"]) ? $_REQUEST["sort"] : "id";
$dir = !empty($_REQUEST["dir"]) ? $_REQUEST["dir"] : "ASC";

$r = $qb
    ->select('*')
    ->from('sitemapxml_lists')
    ->orderBy($sort, $dir)
    ->execute();

while ($f = $r->fetch()) {
    try {
        if (!empty($f['site'])) {
            $c = \Cetera\Catalog::getById($f['site']);
            if ($c) {
                $f['site_name'] = $c->name . " (" . $c->alias . ")";
            }

            if (empty($f["lastRun"]))
                $f['lastRun'] = $translator->_("Еще не запускался");

            $f['run'] = '<a href="#" class="js-run-parse" data-id="' . $f["id"] . '">' . $translator->_("Запустить") . '</a>';
        }
        $data[] = $f;
    } catch (\Exception $e) {
    }
}

echo json_encode(array(
    'success' => true,
    'rows' => $data
));
?>
