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
/// <amd-module name="jowebutils.querystring" />
declare module "jowebutils.querystring" {
    export function objectToQueryString(params: any): string;
    export function getQueryStringValue(param: string): string | null;
    export function getURLQueryStringValue(url: string, param: string): string | null;
}
/// <amd-module name="jowebutils.forms.Form" />
declare module "jowebutils.forms.Form" {
    import { Component } from '@odoo/owl';
    import { IOWLEnv } from "jowebutils.owl_env";
    import { IFieldComponent } from "jowebutils.forms.Fields";
    export interface IValues {
        [fieldName: string]: any;
    }
    export interface IFormContext {
        values: IValues;
        setValues(values: IValues): void;
        registerField(name: string, component: IFieldComponent): void;
    }
    export interface OwlEvent extends Event {
        detail: any;
    }
    export interface IFormProps {
        initialValues: IValues;
    }
    export class Form extends Component<IFormProps, IOWLEnv> {
        formContext: IFormContext;
        fields: {
            [name: string]: IFieldComponent;
        };
        constructor();
        registerField(name: string, component: IFieldComponent): void;
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
    export type FieldType = 'char' | 'text' | 'date' | 'datetime' | 'selection' | 'many2one' | 'boolean' | 'html' | 'attachments' | 'tag' | 'many2many';
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
    }
    export type ValidationError = string;
    export interface IFieldComponent {
        validate(): ValidationError[];
        getFieldMeta(): IFieldMeta;
    }
    export interface IFieldState {
        value: any;
    }
    export class BaseField extends Component<IFieldProps, IOWLEnv> implements IFieldComponent {
        state: IFieldState;
        form: IFormContext;
        constructor();
        onChange(ev: Event): void;
        setValue(value: any): void;
        setValueMultiple(input: any): void;
        validate(): string[];
        getFieldMeta(): IFieldMeta;
        get rawValue(): any;
        get formattedValue(): any;
        formatValue(value: any): any;
    }
    export class CharField extends BaseField {
    }
    export class BooleanField extends BaseField {
    }
    export class SelectField extends BaseField {
    }
    export class TagField extends BaseField {
    }
    export class FormField extends Component<IFieldProps, IOWLEnv> {
    }
}
/// <amd-module name="jowebutils.forms.TagFieldInput" />
declare module "jowebutils.forms.TagFieldInput" {
    import { Component } from '@odoo/owl';
    import { IFieldProps, IFieldState } from "jowebutils.forms.Fields";
    import { IOWLEnv } from "jowebutils.owl_env";
    import { IFormContext } from "jowebutils.forms.Form";
    export interface ITagState extends IFieldState {
        value: any;
        colour: any;
    }
    export class TagInputField extends Component<IFieldProps, IOWLEnv> {
        state: ITagState;
        form: IFormContext;
        input: HTMLInputElement;
        constructor();
        onChange(ev: Event): void;
        setValue(value: any): void;
    }
}
/// <amd-module name="jowebutils.widgets.NavBar" />
declare module "jowebutils.widgets.NavBar" {
    import { Component } from '@odoo/owl';
    import { IOWLEnv } from "jowebutils.owl_env";
    export interface INavBarBreadcrumb {
        string: string;
        destination?: any;
        external?: boolean;
    }
    export interface INavBarProps {
        breadcrumbs: INavBarBreadcrumb[];
    }
    export class NavBar extends Component<INavBarProps, IOWLEnv> {
        onClickBreadcrumb(ev: any): void;
    }
}
/// <amd-module name="jowebutils.widgets.Table" />
declare module "jowebutils.widgets.Table" {
    import { Component } from '@odoo/owl';
    import { IOWLEnv } from "jowebutils.owl_env";
    export interface ITableColumn {
        name: string;
        string: string;
    }
    export interface ITableProps {
        cols: ITableColumn[];
        data: any[][];
    }
    export class Table extends Component<ITableProps, IOWLEnv> {
        formatValue(value: any): any;
        onClickRow(ev: any): void;
    }
}
