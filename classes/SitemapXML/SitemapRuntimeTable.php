<?php
/**
 * Created by PhpStorm.
 * User: garin
 * Date: 20.08.2016
 * Time: 22:11
 */

namespace SitemapXML;

class SitemapRuntimeTable
{
    const UNPROCESSED = 0;
    const PROCESSED = 1;
    const TABLE = "sitemapxml_parse";

    public static function clearByPid($PID)
    {
        $qb = \Cetera\DbConnection::getDbConnection()->createQueryBuilder();
        $qb->delete('sitemapxml_parse')
            ->where($qb->expr()->eq('listId', (int)$PID))
            ->execute();
        $qb->delete('sitemapxml_urls')
            ->where($qb->expr()->eq('listId', (int)$PID))
            ->execute();
    }

    public static function add($data)
    {
        $qb = \Cetera\DbConnection::getDbConnection()->createQueryBuilder();
        $r = $qb
            ->insert('sitemapxml_parse')
            ->values(
                array(
                    '`listId`' => intval($data["listId"]),
                    '`processed`' => intval($data["processed"]),
                    '`dirId`' => intval($data["dirId"]),
                )
            )
            ->execute();
    }

    public static function addUrl($data)
    {
        $qb = \Cetera\DbConnection::getDbConnection()->createQueryBuilder();
        try {
            $r = $qb
                ->insert('sitemapxml_urls')
                ->values(
                    array(
                        '`listId`' => intval($data["listId"]),
                        '`url`' => $qb->expr()->literal(trim($data["url"]), \PDO::PARAM_STR),
                        '`priority`' => $qb->expr()->literal(trim($data["priority"]), \PDO::PARAM_STR),
                        '`lastModified`' => $qb->expr()->literal(!empty($data["date"]) ? date('Y-m-d H:i:s', strtotime($data['date'])) : date("Y-m-d H:i:s"), \PDO::PARAM_STR)
                    )
                )
                ->execute();
        } catch (\Exception $e) {

        }
    }

    public static function setUrlProcessed($data)
    {
        $qb = \Cetera\DbConnection::getDbConnection()->createQueryBuilder();
        $r = $qb
            ->update('sitemapxml_urls')
            ->set('`processed`', self::PROCESSED)
            ->where($qb->expr()->in('id', $data))
            ->execute();
    }

    public static function removeDuplicate($listId)
    {
        $qb = \Cetera\DbConnection::getDbConnection();
        $qb->executeQuery('DELETE t1 FROM `sitemapxml_urls` t1, `sitemapxml_urls` t2 WHERE t1.listId=t2.listId AND t1.url=t2.url AND t1.id > t2.id AND t2.listId=' . $listId);
    }

    public static function setProcessed($id)
    {
        $qb = \Cetera\DbConnection::getDbConnection()->createQueryBuilder();
        $r = $qb
            ->update('sitemapxml_parse')
            ->set('`processed`', self::PROCESSED)
            ->where($qb->expr()->eq('id', $id))
            ->execute();
    }

    public static function getList($arSort = array(), $arFilter = array(), $arLimit = array(), $arSelect = array())
    {
        $qb = \Cetera\DbConnection::getDbConnection()->createQueryBuilder();
        if (empty($arSelect))
            $arSelect = "*";
        else
            $arSelect = implode(",", $arSelect);

        $qb = $qb
            ->select($arSelect)
            ->from(!empty($arFilter["table"]) ? $arFilter["table"] : static::TABLE);

        $first = true;
        if (count($arFilter)) {
            foreach ($arFilter as $key => $val) {
                if ($key == "table")
                    continue;

                if (strpos($key, "!") !== false) {
                    $key = preg_replace("#^!#is", "", $key) . (is_array($val) ? " NOT IN (" : " <> ");
                } elseif (strpos($key, ">=") !== false) {
                    $key = preg_replace("#^>=#is", "", $key) . " >= ";
                } elseif (strpos($key, "<=") !== false) {
                    $key = preg_replace("#^<=#is", "", $key) . " <= ";
                } elseif (strpos($key, ">") !== false) {
                    $key = preg_replace("#^>#is", "", $key) . " > ";
                } elseif (strpos($key, "<") !== false) {
                    $key = preg_replace("#^<#is", "", $key) . " < ";
                } else {
                    $key = $key . (is_array($val) ? " IN (" : " = ");
                }

                if ($first) {
                    $value = $val;
                    if (is_array($val)) {
                        $value = "";
                        foreach ($val as $v) {
                            $value .= $qb->createNamedParameter($v) . ",";
                        }
                        $value = trim($value, ",") . ")";
                    }
                    $qb = $qb->where($key . $value);
                } else {
                    $value = $val;
                    if (is_array($val)) {
                        $value = "";
                        foreach ($val as $v) {
                            $value .= $qb->createNamedParameter($v) . ",";
                        }
                        $value = trim($value, ",") . ")";
                    }
                    $qb = $qb->andWhere($key . $value);
                }

                $first = false;
            }
        }

        $first = true;
        if (count($arSort)) {
            foreach ($arSort as $key => $val) {
                if ($first)
                    $qb = $qb->orderBy($key, $val);
                else
                    $qb = $qb->addOrderBy($key, $val);

                $first = false;
            }
        }

        $arLimit['LIMIT'] = $arLimit['LIMIT'] ?? 0;
        $arLimit['TOP'] = $arLimit['TOP'] ?? 0;
        $arLimit['PAGE'] = $arLimit['PAGE'] ?? 0;


        if (intval($arLimit["LIMIT"]) > 0) {
            $qb = $qb->setMaxResults(intval($arLimit["LIMIT"]));
        }

        if (intval($arLimit["TOP"]) > 0) {
            $qb = $qb->setFirstResult(intval($arLimit["TOP"]));
        }

        if (intval($arLimit["PAGE"]) > 0 && intval($arLimit["PAGE_COUNT"]) > 0) {
            $qb = $qb->setFirstResult((intval($arLimit["PAGE"]) - 1) * intval($arLimit["PAGE_COUNT"]));
            $qb = $qb->setMaxResults(intval($arLimit["PAGE_COUNT"]));
        }

        $r = $qb->execute();

        return $r;
    }
}
