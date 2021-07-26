///<amd-module name='jowebutils.owl_app'/>

// Creates a OWL app entry point with the specified routes

import * as core from 'web.core';
import * as publicWidget from 'web.public.widget';
import * as rpc from 'web.rpc';
import * as session from 'web.session';

import { ComponentWrapper, WidgetAdapterMixin } from 'web.OwlCompatibility';
import { Component, tags, router, utils } from '@odoo/owl';
import { Route } from '@odoo/owl/dist/types/router/router';
import { IOWLEnv } from './owl_env';

class App extends Component {}
App.components = { RouteComponent: router.RouteComponent }
App.template = tags.xml`<RouteComponent />`;

export interface OWLAppDefinition {
    selector: string;
    routes: Partial<Route>[];
    xmlDependencies?: string[];
}

export function createOWLApp(appDef: OWLAppDefinition) {
    return publicWidget.Widget.extend(WidgetAdapterMixin, {
        selector: appDef.selector,

        init: function () {
            this.owl_component = new ComponentWrapper(this, App);
            const env = this.owl_component.env;
            env.router = new router.Router(this.owl_component.env, appDef.routes);
            this.populateOWLEnv();
        },

        populateOWLEnv: function () {
            // Populate OWL env from current odoo environment
            // Try to mimic odoo 14+ where possible, to make porting easier
            // https://github.com/odoo/odoo/blob/14.0/addons/web/static/src/js/common_env.js#L46

            const env = this.owl_component.env;
            env._t = core._t;
            env.services = {
                rpc: function(params: any, options: any) {
                    const query = rpc.buildQuery(params);
                    return session.rpc(query.route, query.params, options);
                }
            }
            env.session = session;
        },

        initOWLQWeb: async function () {
            const env: IOWLEnv = this.owl_component.env;
            const qweb = env.qweb;
            qweb.translateFn = core._t;
            const loadPromises = [];
            if (appDef.xmlDependencies) {
                for (let dep of appDef.xmlDependencies) {
                    loadPromises.push(utils.loadFile(dep));
                }
            }
            const templateFiles = await Promise.all(loadPromises);
            for (let templates of templateFiles) {
                qweb.addTemplates(templates);
            }
            env.loadedXmlDependencies = appDef.xmlDependencies || [];
        },

        start: async function () {
            await this.initOWLQWeb();
            await this.owl_component.env.router.start()
            this.owl_component.mount(this.el);
        }
    });
}