{
    'name': 'MW JSON Table Widget',
    'version': '1.0.0',
    'summary': 'JSON Table Widget for Odoo',
    'description': """A custom Odoo widget to display and edit JSON data in a table format.""",
    'author': 'Managewall LLC',
    'website': 'https://managewall.mn',
    'category': 'Extra Tools',
    'license': 'LGPL-3',
    'depends': ['base', 'web'],
    'assets': {
        'web.assets_backend': [
            'mw_json_table_widget/static/src/js/json_table.js',
            'mw_json_table_widget/static/src/xml/json_table.xml',
            'mw_json_table_widget/static/src/css/json_table.css',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}
