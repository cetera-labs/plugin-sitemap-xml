Ext.require('Plugin.sitemap-xml.SiteTreeCheckModel');

Ext.define('Plugin.sitemap-xml.SiteTreeCheck', {

    extend: 'Ext.tree.TreePanel',

    rootVisible: false,
    line: false,
    autoScroll: true,

    loadMask: true,
    itemID: false,

    initComponent: function () {
        if (this.url)
            var url = this.url;
        else var url = '/cms/plugins/sitemap-xml/scripts/data_tree.php?1=1';
        if (this.exclude) url += '&exclude=' + this.exclude;
        if (this.rule) url += '&rule=' + this.rule;
        if (this.nolink) url += '&nolink=' + this.nolink;
        if (this.only) url += '&only=' + this.only;
        if (this.materials) url += '&materials=' + this.materials;
        if (this.exclude_mat) url += '&exclude_mat=' + this.exclude_mat;
        if (this.matsort) url += '&matsort=' + this.matsort;
        if (this.nocatselect) url += '&nocatselect=' + this.nocatselect;
        if (this.norootselect) url += '&norootselect=' + this.norootselect;
        if (this.itemID) url += '&itemID=' + this.itemID;

        this.store = new Ext.data.TreeStore({
            model: 'Plugin.sitemap-xml.SiteTreeCheckModel',
            rootVisible: false,
            proxy: {
                type: 'ajax',
                url: url
            },
            root: {
                text: 'root',
                id: '1',
                iconCls: 'tree-folder-visible',
                expanded: true
            }
        });

        this.columns = [{
            xtype: 'treecolumn',
            text: _('Раздел'),
            dataIndex: 'text',
            flex: 1,
            renderer: function (val, meta, rec) {
                /*if (rec.get('isLayover')) {
                 meta.style = 'color: gray; font-style: italic;';
                 }*/
                return val;
            }
        }, {
            text: _('Элементы'),
            dataIndex: 'elements',
            width: 100
        }];

        this.callParent();

        this.getSelectionModel().on({
            beforeselect: function (sm, node) {
                if (node.get('disabled')) return false;
            }
        });

        this.listeners = {
            'load': {
                fn: function (store, records, success) {
                    this.setLoading(false);
                },
                scope: this
            },
            'beforeload': {
                fn: function (store, records, success) {
                    this.setLoading(true);
                },
                scope: this
            }
        };
    },

    afterRender: function () {
        this.callParent();
    },

    getSelectedId: function () {
        var sn = this.getSelectionModel().getLastSelected();
        if (!sn) return false;
        var a = sn.getId().split('-');
        return a[1];
    }
});
