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
    initialValues: IValues;
}

export class Form extends Component<IFormProps, IOWLEnv> {
    formContext: IFormContext;
    fields: { [name: string]: IFieldComponent };

    constructor() {
        super(...arguments);

        const setValues = this.setValues.bind(this);
        const registerField = this.registerField.bind(this);

        const formContextData = {
            values: this.props.initialValues,
            registerField,
            setValues
        };

        const formContextContainer = new Context(formContextData);
        this.env.formContext = formContextContainer;
        this.formContext = formContextContainer.state;
        this.fields = {};
        console.log('form initialised');
    }

    registerField(name: string, component: IFieldComponent) {
        console.log('registering field', name);
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
        this.trigger('submitted', { values: this.formContext.values });
    }

}
Form.template = tags.xml /* xml */ `
    <form t-on-submit="onSubmit">
        <t t-slot="default" />
    </form>
`