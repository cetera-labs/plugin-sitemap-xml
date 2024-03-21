<?php

namespace SitemapXML;

class SitemapCities
{

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

        while ($row = $result->fetch_assoc()) {
            $xml = file_get_contents(DOCROOT . '/sitemap.xml');
            $myXmlString = str_replace('promo-yar.ru/', 'promo-yar.ru/' . $row['alias'] . '/', $xml);
            file_put_contents(DOCROOT . '/sitemap_' . $row['alias'] . '.xml', $myXmlString);
        }
    }
}

?>
