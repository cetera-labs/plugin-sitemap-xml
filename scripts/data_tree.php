<?php
namespace Cetera;
include_once('common_bo.php');

$nodes = array();

if (!empty($_REQUEST["itemID"]))
    $nodes = \SitemapXML\SitemapXML::getTreeList($_REQUEST["listID"], $_REQUEST["itemID"], (!empty($_REQUEST["withoutRoot"]) ? false : true));

echo json_encode($nodes);

?>
