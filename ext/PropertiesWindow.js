Ext.define('Plugin.sitemap-xml.PropertiesWindow', {

    extend: 'Ext.Window',

    closeAction: 'hide',
    title: '',
    width: 710,
    height: 550,
    layout: 'vbox',
    modal: true,
    resizable: false,
    border: false,

    listId: 0,

    initComponent: function () {
        var _this = this;
        _this.server = null;
        _this.waitMess = Ext.MessageBox;

        this.dirSetList = Ext.create('Plugin.sitemap-xml.SiteTreeCheck', {
            name: 'dirs',
            from: '0',
            fieldLabel: _('Разделы'),
            rowLines: true,
            autoLoad: false,
            scroll: true,
            autoScroll: false,
            listeners: {
                checkchange: function (node, check) {
                    node.cascadeBy(function (child) {
                        child.set("checked", check);
                    });
                    _this.reInitEvents();
                },
                afteritemexpand: function (node, index, item, eOpts) {
                    _this.reInitEvents();
                },
                afteritemcollapse: function (node, index, item, eOpts) {
                    _this.reInitEvents();
                },
                load: function () {
                    if (_this.dirsList !== undefined) {
                        _this.dirSetList.getStore().getRootNode().cascadeBy(function (child) {
                            var dirs = _this.dirsList.split(",");
                            var id = child.get("id");
                            if (id !== null) {
                                if (dirs.indexOf("element-" + id) > -1) {
                                    child.set("parseElements", "N");
                                }
                                else {
                                    child.set("parseElements", "Y");
                                }
                            }
                        });
                    }
                }
            }
        });

        this.combo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: _('Сайт'),
            id: 'site',
            store: new Ext.data.JsonStore({
                autoDestroy: true,
                autoLoad: true,
                fields: ['id','name'],
                proxy: {
                    type: 'ajax',
                    url: '/cms/plugins/sitemap-xml/scripts/data_servers.php',                  
                    reader: {
                        type: 'json',
                        root: 'rows'
                    }                    
                }
            }),            
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            allowBlank: false,
            name: 'site',
            listeners: {
                'change': function (combo, newValue, oldValue, eOpts) {
                    _this.reShow(newValue);
                },
                'render': function (combo, eOpts) {
                    _this.reinitDirSet();
                }
            }
        });

        this.tabs = new Ext.TabPanel({
            deferredRender: false,
            activeTab: 0,
            plain: true,
            border: false,
            bodyStyle: 'background: none',
            height: 500,
            defaults: {bodyStyle: 'background:none; padding:5px'},
            items: [{
                title: _('Настройки'),
                layout: 'form',
                defaults: {anchor: '0'},
                itemId: "mainPanel",
                defaultType: 'textfield',
                items: [
                    {
                        xtype: 'panel',
                        html: '<div style="text-align: right;"><a href="/plugins/sitemap-xml/help/ru/index.html" target="_blank">' + _('Справка') + '</a></div>',
                        bodyStyle: 'background: none',
                        border: false,
                        scope: this
                    },
                    this.combo,
                    {
                        fieldLabel: _('Название'),
                        name: 'name',
                        allowBlank: false
                    }, {
                        fieldLabel: _('Путь к файлу'),
                        name: 'path',
                        allowBlank: false,
                        value: 'sitemap.xml',
                        regex: /[a-zA-Z0-9-_\.\/:]/,
                    },
                    {
                        xtype: 'checkbox',
                        name: 'robots',
                        boxLabel: _('Добавить правило в robots.txt после генерации'),
                        inputValue: 1,
                        uncheckedValue: 0,
                    }, {
                        xtype: 'checkbox',
                        name: 'google',
                        boxLabel: _('Оповестить Google об изменении сайта'),
                        inputValue: 1,
                        uncheckedValue: 0,
                    }, {
                        xtype: 'panel',
                        bodyStyle: 'background: none',
                        border: false,
                        html: '<p style="font-size:90%; margin: 0 0 10px;">' + _('Регистрация не требуется, но вы можете войти в') + ' <a href="https://www.google.com/webmasters/tools/">Google Webmaster Tools</a><br>' + _('и проверить статистику по сайту.') + '</p>',
                    }, {
                        xtype: 'checkbox',
                        name: 'yandex',
                        boxLabel: _('Оповестить Yandex об изменении сайта'),
                        inputValue: 1,
                        uncheckedValue: 0,
                    }, {
                        xtype: 'panel',
                        bodyStyle: 'background: none',
                        border: false,
                        html: '<p style="font-size:90%; margin: 0 0 10px;">' + _('Регистрация не требуется, но вы можете войти в') + ' <a href="https://webmaster.yandex.ru/">Yandex Webmaster Tools</a><br>' + _('и проверить статистику по сайту.') + '</p>',
                    }, {
                        xtype: 'checkbox',
                        name: 'bing',
                        boxLabel: _('Оповестить Bing об изменении сайта'),
                        inputValue: 1,
                        uncheckedValue: 0,
                    }, {
                        xtype: 'panel',
                        bodyStyle: 'background: none',
                        border: false,
                        html: '<p style="font-size:90%; margin: 0 0 10px;">' + _('Регистрация не требуется, но вы можете войти в') + ' <a href="http://www.bing.com/toolbox/webmaster/">Bing Webmaster Tools</a><br>' + _('и проверить статистику по сайту.') + '</p>',
                    },
                    {
                      fieldLabel: _('Сайт в формате https://domain.ru'),
                      name: 'domain',
                      allowBlank: false
                    }, {
					  xtype: 'checkbox',
                      boxLabel: _('Sitemap городов'),
                      name: 'cities',
                      inputValue: 1,
                      uncheckedValue: 0,
                    }
                ]
            },
                {
                    title: _('Разделы'),
                    layout: 'form',
                    defaults: {anchor: '0'},
                    defaultType: 'textfield',
                    hidden: true,
                    itemId: "sections",
                    overflowY: "auto",
                    items: [
                        this.dirSetList,
                    ]
                }]
        });

        this.form = new Ext.FormPanel({
            labelWidth: 140,
            border: false,
            width: 700,
            bodyStyle: 'background: none',
            method: 'POST',
            waitMsgTarget: true,
            url: '/cms/plugins/sitemap-xml/scripts/action_sitemapxml_lists.php',
            items: this.tabs
        });

        this.items = this.form;

        this.buttons = [{
            text: _('Ok'),
            scope: this,
            handler: this.submit
        }, {
            text: _('Отмена'),
            scope: this,
            handler: function () {
                this.hide();
            }
        }];

        this.callParent();
    },

    reinitDirSet: function () {
        var _this = this;
        var newValue = this.combo.getValue();

        if (newValue !== null && newValue !== undefined) {
            var currentTab = _this.tabs.getActiveTab();
            _this.tabs.child("#sections").tab.show();
            _this.tabs.setActiveTab(1);
            _this.tabs.setActiveTab(currentTab);
        }
        else {
            _this.tabs.child("#sections").tab.hide();
        }

        _this.reInitEvents();
    },

    reInitEvents: function () {
        var _this = this;
        var dom = Ext.dom.Query.select('.js-element-hide');
        dom.forEach(function (item, i, arr) {
            var el = Ext.get(dom[i]),
                id = item.getAttribute('data-id');

            Ext.EventManager.removeAll(el);
            el.on('click', function (e) {
                var status = item.getAttribute('data-status'),
                    checked = status == "Y" ? false : true;

                var node = _this.dirSetList.getStore().getNodeById(id);
                if (!checked) {
                    item.innerText = "Нет";
                    item.setAttribute("data-status", "N");
                    node.set("parseElements", "N");

                    node.cascadeBy(function (child) {
                        var id = child.get("id");
                        if (id !== null) {
                            child.set("parseElements", "N");
                            child.set("elements", "<a href='#' data-id='" + id + "' data-status='N' class='js-element-hide'>" + _('Нет') + "</a>");
                        }
                    });
                }
                else {
                    item.innerText = "Да";
                    item.setAttribute("data-status", "Y");
                    node.set("parseElements", "Y");

                    node.cascadeBy(function (child) {
                        var id = child.get("id");
                        if (id !== null) {
                            child.set("parseElements", "Y");
                            child.set("elements", "<a href='#' data-id='" + id + "' data-status='Y' class='js-element-hide'>" + _('Да') + "</a>");
                        }
                    });
                }

                _this.reInitEvents();
                e.preventDefault();
                return false;
            }, this);
        });
    },

    show: function (listId) {
        var _this = this;
        this.form.getForm().reset();
        this.tabs.setActiveTab(0);

        this.callParent();

        this.listId = listId;
        if (listId > 0) {
            _this.waitMess.wait(_("Загрузка данных..."));
            Ext.Ajax.request({
                url: '/cms/plugins/sitemap-xml/scripts/action_sitemapxml_lists.php',
                params: {
                    'action': 'get_list',
                    'id': this.listId
                },
                scope: this,
                success: function (resp) {
                    var obj = Ext.decode(resp.responseText);
                    this.setTitle(_('Свойства') + ': ' + obj.rows.name);
                    this.form.getForm().setValues(obj.rows);
                    _this.dirsList = obj.rows.dirs;
                }
            });
        } else {
            this.setTitle(_('Новый Sitemapxml'));
            this.dirSetList.getStore().getRootNode().removeAll();
            _this.tabs.child("#sections").tab.hide();
            _this.tabs.setActiveTab(0);
            this.listId = null;
        }
    },

    reShow: function (itemID) {
        var _this = this;
        this.tabs.setActiveTab(0);
        this.itemID = itemID;
        if (itemID > 0) {
            _this.waitMess.wait(_("Загрузка данных..."));
            Ext.Ajax.request({
                url: '/cms/plugins/sitemap-xml/scripts/action_sitemapxml_lists.php',
                params: {
                    'action': 'get_list',
                    'id': _this.listId
                },
                scope: _this,
                success: function (resp) {
                    var obj = Ext.decode(resp.responseText);
                    _this.dirsList = obj.rows.dirs;
                    _this.dirSetList.store.proxy.extraParams["dirsList"] = _this.dirsList;
                    _this.dirSetList.store.proxy.extraParams["itemID"] = itemID;
                    _this.dirSetList.store.proxy.extraParams["listID"] = _this.listId;

                    _this.dirSetList.getStore().load({
                        node: _this.dirSetList.getStore().getNodeById('root'),
                        callback: function () {
                            _this.reinitDirSet();
                            _this.waitMess.hide();
                        },
                        scope: _this.dirSetList
                    });
                }
            });
        }
    },

    submit: function () {
        var dirs_parse = [];
        var dom = Ext.dom.Query.select('.js-dirs');
        dom.forEach(function (item, i, arr) {
            if (!item.checked)
                dirs_parse.push(item.value);
        });

        this.dirSetList.getStore().getRootNode().cascadeBy(function (child) {
            var id = child.get("id"),
                checked = child.get("checked"),
                parseElements = child.get("parseElements");

            if (parseInt(id) > 0) {
                if (!checked)
                    dirs_parse.push("section-" + id);
                if (parseElements == "N")
                    dirs_parse.push("element-" + id);
            }
        });

        this.dirsList = dirs_parse.join(",");

        var params = {
            action: 'save_list',
            id: this.listId,
            dirs: this.dirsList,
        };

        this.form.getForm().submit({
            params: params,
            scope: this,
            waitMsg: _('Сохранение...'),
            success: function (resp) {
                this.fireEvent('listChanged', this.listId, this.form.getForm());
                this.hide();
            },
            failure: function (resp, form) {
                Ext.MessageBox.alert(_("Ошибка сохранения"), form.result.errors.join("<br>"));
            }
        });
    }
});
