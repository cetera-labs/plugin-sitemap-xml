<?php
/*
Скрипт подключается в методе Application::initPlugins() и позволяет плагину встроить себя в интерфейс Back Office, зарегистрировать фильтр вывода и т.д.
*/
$t = $this->getTranslator();
$t->addTranslation(__DIR__.'/lang');

// Для пользователей этой группы добавим наш плагин в меню
if ($this->getBo() && $this->getUser() && $this->getUser()->allowAdmin()) {
    $this->getBo()->addModule(array(
        'id' => 'sitemapxml',
        'position' => MENU_SERVICE,
        'name' => 'Sitemap.xml',
        'icon' => '/cms/plugins/sitemap-xml/images/icon.gif',
        'iconCls' => 'x-fa fa-sitemap',
        'class' => 'Plugin.sitemap-xml.Panel'        
    ));
}
