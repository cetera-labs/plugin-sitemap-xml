<?php
/**
 * Cetera CMS 3
 *
 * AJAX-backend действия с форумами
 *
 * @package CeteraCMS
 * @version $Id$
 * @copyright 2000-2010 Cetera labs (http://www.cetera.ru)
 * @author Roman Romanov <nicodim@sitemapxml.ru>
 **/

include_once('common_bo.php');

$res = array(
    'success' => false,
    'errors' => array()
);

$action = $_REQUEST['action'];
$id = intval($_REQUEST['id']);

if ($action == 'delete_list') {
    $qb = Cetera\DbConnection::getDbConnection()->createQueryBuilder();
    $r = $qb
        ->delete("sitemapxml_lists")
        ->where($qb->expr()->eq('id', $id))
        ->execute();
    $res['success'] = true;
}

if ($action == 'save_list') {
    try {

        $qb = Cetera\DbConnection::getDbConnection()->createQueryBuilder();
        $r = $qb
            ->select('id, name')
            ->from('sitemapxml_lists')
            ->where("id <> " . $id)
            ->andWhere($qb->expr()->eq('name', $qb->expr()->literal($_REQUEST["name"], PDO::PARAM_STR)))
            ->execute();

        if ($f = $r->fetch()) {
            throw new \Exception($translator->_('Sitemapxml с таким названием уже существует'));
        }

        $qb = Cetera\DbConnection::getDbConnection()->createQueryBuilder();
        if ($id) {
            $r = $qb
                ->update('sitemapxml_lists')
                ->set('`name`', $qb->expr()->literal($_REQUEST["name"], PDO::PARAM_STR))
                ->set('`site`', $qb->expr()->literal($_REQUEST["site"], PDO::PARAM_STR))
                ->set('`path`', $qb->expr()->literal($_REQUEST["path"], PDO::PARAM_STR))
                ->set('`dirs`', $qb->expr()->literal($_REQUEST["dirs"], PDO::PARAM_STR))
                ->set('`lastUpdate`', $qb->expr()->literal(date("Y-m-d H:i:s"), PDO::PARAM_STR))
                ->set('`robots`', $_REQUEST["robots"])
                ->set('`yandex`', $_REQUEST["yandex"])
                ->set('`google`', $_REQUEST["google"])
                ->set('`bing`', $_REQUEST["bing"])
                ->set('`domain`', $qb->expr()->literal(!empty($_REQUEST["domain"]) ? $_REQUEST["domain"] : "section-1", PDO::PARAM_STR))
                ->where($qb->expr()->eq('id', $id))
                ->execute();
        } else {
            $r = $qb
                ->insert('sitemapxml_lists')
                ->values(
                    array(
                        '`name`' => $qb->expr()->literal($_REQUEST["name"], PDO::PARAM_STR),
                        '`site`' => $qb->expr()->literal($_REQUEST["site"], PDO::PARAM_STR),
                        '`path`' => $qb->expr()->literal($_REQUEST["path"], PDO::PARAM_STR),
                        '`dirs`' => $qb->expr()->literal($_REQUEST["dirs"], PDO::PARAM_STR),
                        '`lastUpdate`' => $qb->expr()->literal(date("Y-m-d H:i:s"), PDO::PARAM_STR),
                        '`robots`' => $_REQUEST["robots"],
                        '`yandex`' => $_REQUEST["yandex"],
                        '`google`' => $_REQUEST["google"],
                        '`bing`' => $_REQUEST["bing"],
                        '`domain`' => $qb->expr()->literal(!empty($_REQUEST["domain"]) ? $_REQUEST["domain"] : "section-1", PDO::PARAM_STR),
                    )
                )
                ->execute();
        }

        if (!$id)
            $id = Cetera\DbConnection::getDbConnection()->lastInsertId();

        $res['success'] = true;
    } catch (\Exception $e) {
        $res["errors"][] = $e->getMessage();
    }
}

if ($action == 'get_list') {
    $qb = Cetera\DbConnection::getDbConnection()->createQueryBuilder();
    $r = $qb
        ->select('*')
        ->from('sitemapxml_lists')
        ->where($qb->expr()->eq('id', $id))
        ->execute();

    $res['rows'] = $r->fetch();
    if (!empty($res['rows']['site'])) {
        $c = \Cetera\Catalog::getById($res['rows']['site']);
        if ($c) {
            $res['rows']['site_name'] = $c->name;
        }
    }
    $res['success'] = true;
}

/*if ($action == 'import_item') {
    \Sitemapxml\SitemapxmlFeed::startImport($application, $id);
}

if ($action == 'import_all') {
    \Sitemapxml\SitemapxmlFeed::startImportAll($application);
}*/

if ($action == "parse") {
    if ($id > 0) {
        $res = \SitemapXML\SitemapXML::parse($id);
        $res["request"] = $_REQUEST;
    }
}

echo json_encode($res);
