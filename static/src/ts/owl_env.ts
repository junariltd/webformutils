///<amd-module name='jowebutils.owl_env'/>

import { Env } from "@odoo/owl/dist/types/component/component";
import { Router } from "@odoo/owl/dist/types/router/router";

export interface IOWLEnv extends Env {
    _t: (str: string) => string,
    router: Router;
    services: {
        rpc: (params: any, options?: any) => any;
    };
    session: {
        user_id: number;
        website_id: number;
        website_company_id: number;
        [key: string]: any;
    }
    loadedXmlDependencies: string[];
    [key: string]: any;
}
