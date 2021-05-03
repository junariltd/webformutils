///<amd-module name='jowebutils.forms.Form'/>

import { Component, tags, Context } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';
import { IFieldComponent } from './Fields';

export interface IValues { [fieldName: string]: any; }

export interface IFormContext {
    values: IValues;
    setValues(values: IValues): void;
    registerField(name: string, component: IFieldComponent): void;
}

export interface OwlEvent extends Event {
    detail: any;
}

export interface IFormProps {
    name?: string;
    initialValues: IValues;
}

export class Form extends Component<IFormProps, IOWLEnv> {
    name: string;
    formContext: IFormContext;
    fields: { [name: string]: IFieldComponent };

    constructor() {
        super(...arguments);

        const setValues = this.setValues.bind(this);
        const registerField = this.registerField.bind(this);

        const formContextData = {
            values: this.props.initialValues || {},
            registerField,
            setValues
        };

        this.name = this.props.name || 'form';
        if (!this.env.formContext) {
            this.env.formContext = {};
        }
        else if (this.env.formContext[this.name]) {
            throw new Error('Duplicate form declared. Use the "name" property to uniquely identify forms.')
        }

        const formContextContainer = new Context(formContextData);
        this.env.formContext[this.name] = formContextContainer;
        this.formContext = formContextContainer.state;
        this.fields = {};
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

    valuesChanged(fieldsChanged: string[]) {
        this.trigger('values-changed', {
            fieldsChanged,
            values: this.formContext.values
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
            values, editableValues
        });
    }

}
Form.template = tags.xml /* xml */ `
    <form t-on-submit="onSubmit">
        <t t-slot="default" />
    </form>
`