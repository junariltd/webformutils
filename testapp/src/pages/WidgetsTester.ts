
///<amd-module name='jowebutils.testapp.WidgetsTester'/>

import { Component, tags, hooks } from '@odoo/owl';
import { IOWLEnv } from '@jowebutils/owl_env';
import { Table } from '@jowebutils/widgets/Table';
import { ITableColumn } from '@jowebutils/widgets/Table';

export interface IWidgetsTesterState {
    cols: ITableColumn[];
    data: any[];
}
export class WidgetsTester extends Component<{}, IOWLEnv> {
    state: IWidgetsTesterState;

    constructor() {
        super(...arguments);
        this.state = hooks.useState({
            cols: [
                { name: 'id', string: 'ID' },
                { name: 'item', string: 'Item' },
                { name: 'status', string: 'Status' }
            ],
            data: [
                {id: '1', item: 'Milk', status: 'To Buy'},
                {id: '2', item: 'Eggs', status: 'To Buy'},
                {id: '3', item: 'Bacon', status: 'In Stock'},
            ]
        });
    }
    
}
WidgetsTester.components = { Table }
WidgetsTester.template = tags.xml /* xml */ `
    <div class="container">
        <div class="row">
            <div class="col-md-10 offset-md-1">
                <h1 class="my-4">JOWebUtils Widgets Tester</h1>

                <div class="card shadow-sm mt-3">
                    <div class="card-header">
                        <b>Table</b>
                    </div>
                    <div class="card-body p-0">
                        <Table cols="state.cols" data="state.data" />
                    </div>
                </div>

            </div>
        </div>
    </div>
`
