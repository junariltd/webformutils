/// <amd-module name="jowebutils.owl_env" />
declare module "jowebutils.owl_env" {
    import { Env } from "@odoo/owl/dist/types/component/component";
    import { Router } from "@odoo/owl/dist/types/router/router";
    export interface IOWLEnv extends Env {
        router: Router;
        services: {
            rpc: (params: any, options?: any) => any;
        };
        session: {
            user_id: number;
            website_id: number;
            website_company_id: number;
            [key: string]: any;
        };
        loadedXmlDependencies: string[];
        [key: string]: any;
    }
}
/// <amd-module name="jowebutils.owl_app" />
declare module "jowebutils.owl_app" {
    import { Route } from '@odoo/owl/dist/types/router/router';
    export interface OWLAppDefinition {
        selector: string;
        routes: Route[];
        xmlDependencies?: string[];
    }
    export function createOWLApp(appDef: OWLAppDefinition): any;
}
/// <amd-module name="jowebutils.forms.Form" />
declare module "jowebutils.forms.Form" {
    import { Component } from '@odoo/owl';
    import { IOWLEnv } from "jowebutils.owl_env";
    export interface IValues {
        [fieldName: string]: any;
    }
    export interface IFormContext {
        values: IValues;
        setValues: (values: IValues) => void;
    }
    export interface OwlEvent extends Event {
        detail: any;
    }
    export interface IFormProps {
        initialValues: IValues;
    }
    export class Form extends Component<IFormProps, IOWLEnv> {
        formContext: IFormContext;
        constructor();
        setValues(values: IValues): void;
        valuesChanged(fieldsChanged: string[]): void;
        onSubmit(ev: Event): void;
    }
}
/// <amd-module name="jowebutils.forms.Fields" />
declare module "jowebutils.forms.Fields" {
    import { Component } from '@odoo/owl';
    import { IOWLEnv } from "jowebutils.owl_env";
    import { IFormContext } from "jowebutils.forms.Form";
    export type FieldType = 'char' | 'text' | 'date' | 'datetime' | 'selection' | 'many2one' | 'boolean' | 'html' | 'attachments';
    export interface IFieldMeta {
        name: string;
        type: FieldType;
        string: string;
        placeholder?: string;
        invisible?: boolean;
        required?: boolean;
        readonly?: boolean;
        selection?: [string, string][];
    }
    export interface IFieldProps {
        field: IFieldMeta;
        onChange?: () => void;
    }
    export interface IFieldState {
        value: any;
    }
    export class BaseField extends Component<IFieldProps, IOWLEnv> {
        state: IFieldState;
        form: IFormContext;
        constructor();
        onChange(ev: Event): void;
        setValue(value: any): void;
        validate(): string[];
        get rawValue(): any;
        get formattedValue(): any;
        formatValue(value: any): any;
    }
    export class CharField extends BaseField {
    }
    export class BooleanField extends BaseField {
    }
}
