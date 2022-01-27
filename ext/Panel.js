Ext.define('Plugin.sitemap-xml.Panel', {
    extend: 'Ext.grid.GridPanel',
    columns: [
        {header: _('ID'), width: 30, dataIndex: 'id'},
        {header: _('Изменено'), width: 300, dataIndex: 'lastUpdate'},
        {flex: 1, header: _('Название'), width: 350, dataIndex: 'name'},
        {header: _('Сайт'), width: 300, dataIndex: 'site_name'},
        {header: _('Последний запуск'), width: 300, dataIndex: 'lastRun'},
        {header: "", width: 300, dataIndex: 'run'},
    ],

    selModel: {
        mode: 'SINGLE',
        listeners: {
            'selectionchange': {
                fn: function (sm) {
                    var hs = sm.hasSelection();
                    Ext.getCmp('tb_sitemapxml_edit').setDisabled(!hs);
                    Ext.getCmp('tb_sitemapxml_delete').setDisabled(!hs);
                },
                scope: this
            }
        }
    },

    initComponent: function () {
        var _this = this;
        _this.waitMessage = Ext.MessageBox;

        this.store = new Ext.data.JsonStore({
            autoDestroy: true,
            remoteSort: true,
            fields: ['ID', 'lastUpdate', 'name', 'site_name', 'lastRun', 'run'],
            sortInfo: {field: "name", direction: "ASC"},
            totalProperty: 'total',
            proxy: {
                type: 'ajax',
                url: '/cms/plugins/sitemap-xml/scripts/data_sitemapxml_lists.php',
                simpleSortMode: true,
                reader: {
                    'root': 'rows',
                    'idProperty': 'id'
                }
            },
            listeners: {
                load: function () {
                    var dom = Ext.dom.Query.select('.js-run-parse');
                    dom.forEach(function (item, i, arr) {
                        var el = Ext.get(dom[i]),
                            id = item.getAttribute('data-id');
                        el.on('click', function (e) {
                            _this.runParse(id);
                            e.preventDefault();
                            return false;
                        }, this);
                    });
                }
            }
        });

        this.tbar = new Ext.Toolbar({
            items: [
                {
                    tooltip: Config.Lang.reload,
                    iconCls: 'icon-reload',
                    handler: function (btn) {
                        btn.up('grid').getStore().load();
                    }
                }, '-',
                {
                    id: 'tb_sitemapxml_new',
                    iconCls: 'icon-new',
                    text: Config.Lang.add,
                    tooltip: '<b>' + _('Добавить настройку') + '</b>',
                    handler: function () {
                        this.edit(0);
                    },
                    scope: this
                }, '-',
                {
                    id: 'tb_sitemapxml_edit',
                    disabled: true,
                    iconCls: 'icon-edit',
                    text: Config.Lang.edit,
                    tooltip: '<b>' + _('Изменить настройку') + '</b>',
                    handler: function () {
                        this.edit(this.getSelectionModel().getSelection()[0].getId());
                    },
                    scope: this
                },
                {
                    id: 'tb_sitemapxml_delete',
                    disabled: true,
                    iconCls: 'icon-delete',
                    text: Config.Lang.remove,
                    tooltip: '<b>' + _('Удалить настройку') + '</b>',
                    handler: function () {
                        this.delete_list();
                    },
                    scope: this
                }
            ]
        });

        this.on({
            'beforedestroy': function () {
                if (this.propertiesWin) this.propertiesWin.close();
                this.propertiesWin = false;
                if (this.chooseWin) this.chooseWin.close();
                this.chooseWin = false;
            },
            'celldblclick': function () {
                this.edit(this.getSelectionModel().getSelection()[0].getId());
            },
            scope: this
        });

        this.fireEvent('activate');
        this.callParent();
        this.reload();
    },

    border: false,
    loadMask: true,
    stripeRows: true,

    edit: function (id) {
        if (!this.propertiesWin) {
            this.propertiesWin = Ext.create('Plugin.sitemap-xml.PropertiesWindow');
            this.propertiesWin.on('listChanged', function (id, item) {
                this.reload();
            }, this);
        }
        this.propertiesWin.show(id);
    },

    delete_list: function () {
        Ext.MessageBox.confirm(_('Удалить Sitemapxml'), _('Вы уверены') + '?', function (btn) {
            if (btn == 'yes') this.call('delete_list');
        }, this);
    },

    call: function (action) {
        Ext.Ajax.request({
            url: '/cms/plugins/sitemap-xml/scripts/action_sitemapxml_lists.php',
            params: {
                'action': action,
                'id': this.getSelectionModel().getSelection()[0].getId()
            },
            scope: this,
            success: function (resp) {
                this.store.reload();
            }
        });
    },

    reload: function () {
        this.store.load();
    },

    runParse: function (id) {
        var data = {
            'id': id
        };
        this.parse(data);
    },

    parse: function (data) {
        var _this = this;
        data.step = 0;
        _this.waitMessage.wait(_("Удаление временных данных..."));
        this.parseSteps(data);
    },

    parseSteps: function (data) {
        var _this = this;
        data.action = "parse";
        Ext.Ajax.request({
            url: '/cms/plugins/sitemap-xml/scripts/action_sitemapxml_lists.php',
            params: data,
            scope: this,
			timeout: 260000,
            success: function (resp) {
                var obj = Ext.decode(resp.responseText);
                if (obj.errors !== undefined && obj.errors.length) {
                    _this.waitMessage.alert(_("Ошибка"), obj.errors.join("<br>"));
                }
                else if (parseInt(obj.step) < 100) {
                    if (obj.message !== undefined)
                        _this.waitMessage.wait(obj.message);
                    _this.parseSteps(obj);
                }
                else {
                    if (obj.message !== undefined)
                        _this.waitMessage.alert(_("Успешное выполнение"), obj.message);

                    _this.reload();
                }
            },
			failure: function(response, opts) {
				_this.waitMessage.alert(_("Ошибка"), response.status);
			}
        });
    }
});
