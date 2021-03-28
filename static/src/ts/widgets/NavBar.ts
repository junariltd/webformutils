///<amd-module name='jowebutils.widgets.NavBar'/>

import { Component, tags } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';

export interface INavBarBreadcrumb {
    string: string;
    destination?: any;  // OWL destination or Browser URL if external = true
    external?: boolean;
}

export interface INavBarProps {
    breadcrumbs: INavBarBreadcrumb[];
}

export class NavBar extends Component<INavBarProps, IOWLEnv> {
    onClickBreadcrumb(ev: any) {
        ev.preventDefault();
        const breadcrumbIndex = ev.target.dataset.index;  // from data-index attribute
        const breadcrumb = this.props.breadcrumbs[breadcrumbIndex];
        // TODO: support external destinations (window.location insead of router.navigate)
        this.env.router.navigate(breadcrumb.destination);
    }
}
NavBar.template = tags.xml /* xml */ `
    <nav t-attf-class="navbar navbar-light navbar-expand-lg border py-0 mb-2 o_portal_navbar mt-3 rounded">
        <ol class="o_portal_submenu breadcrumb mb-0 py-2 flex-grow-1">
            <li class="breadcrumb-item"><a href="/my/home" aria-label="Home" title="Home"><i class="fa fa-home"/></a></li>
            <t t-foreach="props.breadcrumbs" t-as="item" t-key="item_index">
                <t t-if="item.destination"><li class="breadcrumb-item"><a class="breadcrumb-link"
                    t-on-click="onClickBreadcrumb"
                    t-att-data-index="item_index"
                    href=""><t t-esc="item.string" /></a></li></t>
                <t t-else=""><li class="breadcrumb-item"><t t-esc="item.string" /></li></t>
            </t>
        </ol>
    </nav>
`
