
///<amd-module name='jowebutils.widgets.Table'/>

import { Component, tags } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';

export interface ITableColumn {
    name: string;
    string: string;
    sortable: boolean;
    sorted: 'asc' | 'desc';
}

export interface ITableProps {
    cols: ITableColumn[];
    data: any[];
}

export class Table extends Component<ITableProps, IOWLEnv> {

    formatValue(value: any) {
        if (value instanceof Array && value.length == 2 && !isNaN(value[0])) {
            return value[1];  // many2one value (id, name). Return name.
        }
        return value;
    }

    onClickRow(ev: any) {
        ev.preventDefault();
        const rowIndex = ev.target.dataset.index;  // from data-index attribute
        this.trigger('row-clicked', {
            row: this.props.data[rowIndex]
        });
    }

    onClickHeader(ev: any) {
        ev.preventDefault();
        const colIndex = ev.target.closest('th').dataset.index;
        const col = this.props.cols[colIndex]
        if(col.sortable){
            this.trigger('col-header-clicked', {
                col: col
            })
        }
    }
}
Table.template = tags.xml /* xml */ `
    <div class="table-responsive border rounded border-top-0">
        <table class="table rounded mb-0 bg-white o_portal_my_doc_table jowebutils-table">
            <tr>
                <th t-foreach="props.cols" t-as="col" t-key="col.name" 
                    t-att-class="col.sortable ? 'cursor-pointer': ''"
                    t-on-click="onClickHeader"
                    t-att-data-index="col_index">
                    <t t-esc="col.string" /> 
                    <i t-if="col.sorted == 'desc'" class="fa fa-sort-desc ml-2"></i>
                    <i t-if="col.sorted == 'asc'" class="fa fa-sort-asc ml-2"></i>
                </th>
            </tr>
            <tr t-foreach="props.data" t-as="row">
                <td t-foreach="props.cols" t-as="col" t-key="col.name">
                    <t t-if="col_first">
                        <a class="table-row-link" href=""
                            t-on-click="onClickRow"
                            t-att-data-index="row_index"><t t-esc="formatValue(row[col.name])" /></a>
                    </t>
                    <t t-else="">
                        <t t-esc="formatValue(row[col.name])" />
                    </t>
                </td>
            </tr>
        </table>
    </div>
`
