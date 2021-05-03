
///<amd-module name='jowebutils.widgets.Tabs'/>

import { Component, tags, useState } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';

export interface ITabDef {
    tab: string;
    string: string;
}

export interface ITabsProps {
    tabs: ITabDef[];
}

export interface ITabsState {
    activeTab: string;
}

// active

export class Tabs extends Component<ITabsProps, IOWLEnv> {
    state: ITabsState;

    constructor() {
        super(...arguments);
        if (!this.props.tabs) throw new Error('No tabs defined!');
        this.state = useState({
            activeTab: this.props.tabs[0].tab
        })
    }

    onClickTab(ev: any) {
        ev.preventDefault();
        const tab = ev.target.dataset.tab;
        this.state.activeTab = tab;
    }
}
Tabs.template = tags.xml /* xml */ `
    <div>
        <ul class="nav nav-tabs mb-4">
            <li t-foreach="props.tabs" t-as="tab" t-key="tab_index" class="nav-item">
                <a
                    t-att-class="'nav-link' + (tab.tab == state.activeTab ? ' active' : '')"
                    t-att-data-tab="tab.tab"
                    t-on-click="onClickTab"
                    href="#"><t t-esc="tab.string" /></a>
            </li>
        </ul>
        <div t-foreach="props.tabs" t-as="tab" t-key="tab_index"
            t-att-class="tab.tab == state.activeTab ? '' : 'd-none'">
            <t t-slot="{{tab.tab}}" />
        </div>
    </div>
`
