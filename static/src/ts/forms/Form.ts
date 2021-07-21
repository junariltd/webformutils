///<amd-module name='jowebutils.forms.Form'/>

import { Component, tags, Context } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';
import { IFieldComponent } from './Fields';

export interface IValues { [fieldName: string]: any; }
export interface IFileValues { [fieldName: string]: File | null; }
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
    file?: File;  // will only be used when setting initial form data. Should NOT be stored in state.
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
    fields: { [name: string]: IFieldComponent };

    // We store file data in a POJO because various
    // browser file functions don't like proxies
    files: { [fieldName: string]: File }

    constructor() {
        super(...arguments);

        const setValues = this.setValues.bind(this);
        const setFiles = this.setFiles.bind(this);
        const registerField = this.registerField.bind(this);

        const formContextData: IFormContext = {
            mode: this.props.mode || 'edit',
            values: this.props.initialValues || {},
            registerField,
            setValues,
            setFiles
        };

        this.name = this.props.name || 'form';
        if (!this.env.formContext) {
            this.env.formContext = {};
        }
        else if (this.env.formContext[this.name]) {
            console.warn(`Duplicate <Form /> declared "${this.name}". Use the "name" property to uniquely identify forms.`);
        }

        const formContextContainer = new Context(formContextData);
        this.env.formContext[this.name] = formContextContainer;
        this.formContext = formContextContainer.state;
        this.fields = {};
        this.files = {};
    }

    async willUpdateProps(nextProps: IFormProps) {
        this.formContext.mode = nextProps.mode || 'edit';
    }

    willUnmount() {
        // Remove form context
        delete this.env.formContext[this.name]
    }

    registerField(name: string, component: IFieldComponent) {
        this.fields[name] = component;
    }

    setValues(values: IValues) {
        Object.assign(this.formContext.values, values);
        this.valuesChanged(Object.keys(values));
    }

    setFiles(values: IFileValues) {
        Object.assign(this.files, values);
    }

    valuesChanged(fieldsChanged: string[]) {
        this.trigger('values-changed', {
            fieldsChanged,
            values: this.formContext.values,
            files: this.files
        });
    }

    onSubmit(ev: Event) {
        ev.preventDefault();
        // Call custom 'submitted' event handler, if registered.
        const values = this.formContext.values;
        const editableValues: IValues = {};
        for (const field in this.fields) {
            const meta = this.fields[field].getFieldMeta();
            if (!meta.readonly) {
                editableValues[field] = values[field];
            }
        }
        this.trigger('submitted', {
            values, editableValues,
            files: this.files
        });
    }

}
Form.template = tags.xml /* xml */ `
    <form t-on-submit="onSubmit">
        <t t-slot="default" />
    </form>
`