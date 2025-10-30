/** @odoo-module **/

export class RowManager {
    constructor(state, writeBackCallback) {
        this.state = state;
        this.writeBack = writeBackCallback;
    }

    getDefaultValue(type) {
        switch(type) {
            case 'boolean': return false;
            case 'selection': return '';
            case 'image': return '';
            default: return '';
        }
    }
    addRow() {
        const row = {};
        for (const c of this.state.columns) {
            row[c.name] = this.getDefaultValue(c.type);
        }
        
        this.state.rows.push(row);
        this.writeBack();
    }
    
    removeRow(idx) {
        this.state.rows.splice(idx, 1);
        this.writeBack();
    }
    
    editCell(rowIdx, colName, ev, type) {
        if (type === 'boolean') {
            this.state.rows[rowIdx][colName] = ev.target.checked;
        } else {
            this.state.rows[rowIdx][colName] = ev.target.value;
        }
        this.writeBack();
    }
    
    handleImageUpload(rowIdx, colName, ev, notification) {
        const file = ev.target.files[0];
        if (!file) return;
        
        // Файлын хэмжээ шалгах (2MB-аас бага байх ёстой)
        if (file.size > 2 * 1024 * 1024) {
            notification.add('Image size must be less than 2MB', { type: "warning" });
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.rows[rowIdx][colName] = e.target.result;
            this.writeBack();
        };
        reader.readAsDataURL(file);
    }
    
    removeImage(rowIdx, colName) {
        this.state.rows[rowIdx][colName] = '';
        this.writeBack();
    }
}