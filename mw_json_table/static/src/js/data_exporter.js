/** @odoo-module **/

export class DataExporter {
    constructor(state) {
        this.state = state;
    }

    exportTable() {
        const { columns, rows } = this.state;
        const columnNames = columns.map(col => col.name);
        const header = columnNames.join(',');
        
        const csvRows = rows.map(row => {
            return columnNames.map(colName => {
                let cellValue = row[colName];
                
                if (typeof cellValue === 'boolean') {
                    cellValue = cellValue ? 'True' : 'False';
                } else if (cellValue === null || cellValue === undefined) {
                    cellValue = '';
                } else if (typeof cellValue === 'string' && cellValue.startsWith('data:image')) {
                    cellValue = 'Image Data';
                }
                
                return `"${String(cellValue).replace(/"/g, '""')}"`;
            }).join(',');
        });
        
        const csvContent = [header, ...csvRows].join('\n');
        
        const blob = new Blob(['\uFEFF' + csvContent], { 
            type: 'text/csv;charset=utf-8;' 
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}