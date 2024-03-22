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
    public static function generateCitiesSitemaps($protocolDomain, $xmlPath)
    {
        $applicationR = \Cetera\Application::getInstance();
        $conn = new \mysqli($applicationR->getVar('dbhost'), $applicationR->getVar('dbuser'),
            $applicationR->getVar('dbpass'),
            $applicationR->getVar('dbname'));

        $sql = "SELECT alias FROM cities WHERE alias is not null";
        $result = $conn->query($sql);


        $protocolCheck = "http";
        if (str_contains($protocolDomain, 'https://') != false) {
            $protocolCheck = "https";
        }
        $domain = strrchr($protocolDomain, '://');

        $conn->close();
        unset($applicationR);
        $arSitemapList = [];

        if (file_exists(DOCROOT . '/'.$xmlPath)) {
            while ($row = $result->fetch_assoc()) {
                $xml = file_get_contents(DOCROOT . '/'.$xmlPath);
                $myXmlString = str_replace($domain.'/', $domain.'/' . $row['alias'] . '/', $xml);
                file_put_contents(DOCROOT . '/sitemap_' . $row['alias'] . '.xml', $myXmlString);
                $arSitemapList[] = $protocolDomain.'/sitemap_'.$row['alias'].'.xml';
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
}

?>
