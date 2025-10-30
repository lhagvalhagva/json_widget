/** @odoo-module **/

import { useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Field } from "@web/views/fields/field";

class JsonTable extends Field {
    setup() {
        super.setup();
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.hideColumnControls = this.props.hideColumnControls || false;
        const v = this.props.record.data[this.props.name] || {};
        
        let columns = Array.isArray(v.columns) ? [...v.columns] : [];
        columns = columns.map(col => {
            if (typeof col === 'string') {
                return {
                    name: col,
                    type: 'text',
                    options: []
                };
            }
            return {
                name: col.name || col,
                type: col.type || 'text',
                options: col.options || []
            };
        });
        
        this.state = useState({
            columns: columns,
            rows: Array.isArray(v.rows) ? [...v.rows] : [],
            showImagePreviewModal: false,
            previewImageUrl: ""
        });
    }

    get value() {
        return {
            columns: this.state.columns,
            rows: this.state.rows,
        };
    }

    async _writeBack() {
        try {
            await this.props.record.update({ [this.props.name]: this.value });
        } catch (e) {
            this.notification.add(String(e.message || e), { type: "danger" });
        }
    }

    getDefaultValue(type) {
        switch(type) {
            case 'boolean': return false;
            case 'selection': return '';
            case 'image': return '';
            default: return '';
        }
    }

    addColumn() {
        const label = `Column ${this.state.columns.length + 1}`;
        const col = {
            name: label,
            type: 'text',
            options: []
        };
        this.state.columns.push(col);
        for (const r of this.state.rows) {
            r[label] = r[label] ?? this.getDefaultValue(col.type);
        }
        this._writeBack();
    }
    
    removeColumn(idx) {
        const col = this.state.columns[idx];
        this.state.columns.splice(idx, 1);
    
        for (const r of this.state.rows) {
            delete r[col.name];
        }
        this._writeBack();
    }
    
    renameColumn(idx, ev) {
        const col = this.state.columns[idx];
        const oldName = col.name;
        const newName = ev.target.value;
        if (!newName || newName === oldName) return;
    
        for (const r of this.state.rows) {
            r[newName] = r[oldName];
            delete r[oldName];
        }
        col.name = newName;
        this._writeBack();
    }
    
    changeColumnType(idx, ev) {
        const col = this.state.columns[idx];
        const newType = ev.target.value;
        col.type = newType;
        
        if (newType === 'selection' && !col.options) {
            col.options = [];
        }
        
        for (const r of this.state.rows) {
            r[col.name] = this.getDefaultValue(newType);
        }
        this._writeBack();
    }
    
    updateColumnOptions(idx, ev) {
        const col = this.state.columns[idx];
        col.options = ev.target.value.split(',').map(s => s.trim()).filter(s => s);
        this._writeBack();
    }

    addRow() {
        const row = {};
        for (const c of this.state.columns) {
            row[c.name] = this.getDefaultValue(c.type);
        }
        this.state.rows.push(row);
        this._writeBack();
    }
    
    removeRow(idx) {
        this.state.rows.splice(idx, 1);
        this._writeBack();
    }
    
    editCell(rowIdx, colName, ev, type) {
        if (type === 'boolean') {
            this.state.rows[rowIdx][colName] = ev.target.checked;
        } else {
            this.state.rows[rowIdx][colName] = ev.target.value;
        }
        this._writeBack();
    }
    
    handleImageUpload(rowIdx, colName, ev) {
        const file = ev.target.files[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            this.notification.add('Image size must be less than 2MB', { type: "warning" });
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.rows[rowIdx][colName] = e.target.result;
            this._writeBack();
        };
        reader.readAsDataURL(file);
    }
    
    removeImage(rowIdx, colName) {
        this.state.rows[rowIdx][colName] = '';
        this._writeBack();
    }
    
    // Image Preview функцүүд
    showImagePreview(imageUrl) {
        this.state.previewImageUrl = imageUrl;
        this.state.showImagePreviewModal = true;
    }

    hideImagePreview() {
        this.state.showImagePreviewModal = false;
        this.state.previewImageUrl = "";
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
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

JsonTable.template = "mw_json_table_widget.JsonTable";

registry.category("fields").add("json_table", {
    component: JsonTable,
    displayName: "JSON Table",
    extractProps: ({ options }) => {
        return {
            hideColumnControls: !!options.hide_column_controls,
        };
    },
});