<?php

namespace SitemapXML;

/**
 *
 */
class SitemapCities
{
    /**
     * @return void
     */
    public static function generateCitiesSitemaps()
    {
        $applicationR = \Cetera\Application::getInstance();
        $conn = new \mysqli($applicationR->getVar('dbhost'), $applicationR->getVar('dbuser'),
            $applicationR->getVar('dbpass'),
            $applicationR->getVar('dbname'));

        $sql = "SELECT alias FROM cities WHERE alias is not null";
        $result = $conn->query($sql);

        $conn->close();
        unset($applicationR);
        $arSitemapList = [];
        $domain = $_SERVER['REQUEST_SCHEME'].'://'.str_replace('www.','',$_SERVER['SERVER_NAME']);
        //$arSitemapList[] = $domain.'/sitemap.xml';

        while ($row = $result->fetch_assoc()) {
            $xml = file_get_contents(DOCROOT . '/sitemap.xml');
            $myXmlString = str_replace('promo-yar.ru/', 'promo-yar.ru/' . $row['alias'] . '/', $xml);
            file_put_contents(DOCROOT . '/sitemap_' . $row['alias'] . '.xml', $myXmlString);
            $arSitemapList[] = $domain.'/sitemap_'.$row['alias'].'.xml';
        }

        $xml = new \SimpleXMLElement("<sitemapindex xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'/>");

        foreach ($arSitemapList as $sitemap) {
            $track = $xml->addChild('sitemap');
            $track->addChild('loc', $sitemap);
            $track->addChild('lastmod', date('c', time()));
        }

        file_put_contents(DOCROOT . '/sitemap_index.xml', $xml->asXML());
        unlink(DOCROOT . '/sitemap.xml');
    }
}

?>
