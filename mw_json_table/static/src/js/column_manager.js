/** @odoo-module **/

export class ColumnManager {
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
        this.writeBack();
    }
    
    removeColumn(idx) {
        const col = this.state.columns[idx];
        this.state.columns.splice(idx, 1);
        for (const r of this.state.rows) {
            delete r[col.name];
        }
        this.writeBack();
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
        this.writeBack();
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
        this.writeBack();
    }
    
    updateColumnOptions(idx, ev) {
        const col = this.state.columns[idx];
        col.options = ev.target.value
            .split(',')
            .map(s => s.trim())
            .filter(s => s);
        this.writeBack();
    }
}