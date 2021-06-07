/// <amd-module name="jowebutils.owl_env" />
declare module "jowebutils.owl_env" {
    import { Env } from "@odoo/owl/dist/types/component/component";
    import { Router } from "@odoo/owl/dist/types/router/router";
    export interface IOWLEnv extends Env {
        _t: (str: string) => string;
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
    export function getAllQueryStringValues(): URLSearchParams;
}
/// <amd-module name="jowebutils.utils" />
declare module "jowebutils.utils" {
    export function getCurrentUrlWithoutHost(): string;
    export function patch(C: any, patchName: string, patch: any): void;
    export function unpatch(C: any, patchName: string): void;
}
/// <amd-module name="jowebutils.forms.Attachments" />
declare module "jowebutils.forms.Attachments" {
    import { Component } from '@odoo/owl';
    import { IOWLEnv } from "jowebutils.owl_env";
    export interface IAttachmentsProps {
        buttonLabel: string;
        buttonClass: string;
        maxAttachments: number;
    }
    export interface IAttachmentsState {
        controlId: string;
        fileNames: string[];
    }
    export class Attachments extends Component<IAttachmentsProps, IOWLEnv> {
        state: IAttachmentsState;
        files: File[];
        constructor();
        onFileInputChange(ev: any): void;
        onRemove(ev: any): void;
    }
}
/// <amd-module name="jowebutils.forms.Form" />
declare module "jowebutils.forms.Form" {
    import { Component } from '@odoo/owl';
    import { IOWLEnv } from "jowebutils.owl_env";
    import { IFieldComponent } from "jowebutils.forms.Fields";
    export interface IValues {
        [fieldName: string]: any;
    }
    export interface IFileValues {
        [fieldName: string]: File | null;
    }
    export type IFormMode = 'edit' | 'view';
    export interface IFormContext {
        mode: IFormMode;
        values: IValues;
        setValues(values: IValues): void;
        setFiles(values: IFileValues): void;
        registerField(name: string, component: IFieldComponent): void;
    }
    export interface OwlEvent extends Event {
        detail: any;
    }
    export interface IFormFile {
        file_name: string;
        url?: string;
        file?: File;
        attachment_id?: number;
    }
    export interface IFormProps {
        name?: string;
        mode?: IFormMode;
        initialValues?: IValues;
    }
    export class Form extends Component<IFormProps, IOWLEnv> {
        name: string;
        formContext: IFormContext;
        fields: {
            [name: string]: IFieldComponent;
        };
        files: {
            [fieldName: string]: File;
        };
        constructor();
        willUpdateProps(nextProps: IFormProps): Promise<void>;
        willUnmount(): void;
        registerField(name: string, component: IFieldComponent): void;
        setValues(values: IValues): void;
        setFiles(values: IFileValues): void;
        valuesChanged(fieldsChanged: string[]): void;
        onSubmit(ev: Event): void;
    }
}
/// <amd-module name="jowebutils.forms.Fields" />
declare module "jowebutils.forms.Fields" {
    import { Component } from '@odoo/owl';
    import { IOWLEnv } from "jowebutils.owl_env";
    import { IFormContext } from "jowebutils.forms.Form";
    export type FieldType = 'char' | 'text' | 'date' | 'datetime' | 'float' | 'integer' | 'boolean' | 'binary' | 'html' | 'selection' | 'multiselect' | 'many2one' | 'many2many';
    export type SelectionOption = [string, string];
    export interface IFieldMeta {
        name: string;
        type: FieldType;
        string?: string;
        placeholder?: string;
        help?: string;
        tooltip?: string;
        invisible?: boolean;
        required?: boolean;
        readonly?: boolean;
        selection?: SelectionOption[];
    }
    export interface IFieldProps {
        form?: string;
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
        formName: string;
        state: IFieldState;
        form: IFormContext;
        constructor();
        toBase64(file: File): Promise<unknown>;
        onChange(ev: Event): Promise<void>;
        setValue(value: any): void;
        setNullValue(): void;
        multiIsSelected(value: any): boolean;
        multiSelectValue(value: any): void;
        multiDeselectValue(value: any): void;
        validate(): string[];
        getFieldMeta(): IFieldMeta;
        get rawValue(): any;
        get formattedValue(): any;
        formatValue(value: any): any;
    }
    export class CharField extends BaseField {
    }
    export class NumberField extends BaseField {
    }
    export class DateField extends BaseField {
    }
    export class DateTimeField extends BaseField {
    }
    export class TextField extends BaseField {
    }
    export class HtmlField extends BaseField {
    }
    export class BooleanField extends BaseField {
    }
    export class SelectField extends BaseField {
    }
    export class MultiSelectField extends BaseField {
    }
    export class BinaryField extends BaseField {
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
/// <amd-module name="jowebutils.forms.utils" />
declare module "jowebutils.forms.utils" {
    export function fileToBase64(file: File): Promise<string>;
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
        data: any[];
    }
    export class Table extends Component<ITableProps, IOWLEnv> {
        formatValue(value: any): any;
        onClickRow(ev: any): void;
    }
}
/// <amd-module name="jowebutils.widgets.Tabs" />
declare module "jowebutils.widgets.Tabs" {
    import { Component } from '@odoo/owl';
    import { IOWLEnv } from "jowebutils.owl_env";
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
    export class Tabs extends Component<ITabsProps, IOWLEnv> {
        state: ITabsState;
        constructor();
        onClickTab(ev: any): void;
    }
}
