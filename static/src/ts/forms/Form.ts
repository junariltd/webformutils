///<amd-module name='jowebutils.forms.Form'/>

import { Component, tags, hooks, Context, QWeb } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';

export interface IValues { [fieldName: string]: any; }

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

    constructor() {
        super(...arguments);
        const setValues = this.setValues.bind(this);
        const formContextData = {
            values: this.props.initialValues,
            setValues
        };
        console.log('formData', formContextData);
        const formContextContainer = new Context(formContextData);
        this.env.formContext = formContextContainer;
        this.formContext = formContextContainer.state;
    }

    setValues(values: IValues) {
        console.log('form setValues', values);
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
        console.log('form onSubmit. Values: ', this.formContext.values);
        // Call custom 'submitted' event handler, if registered.
        this.trigger('submitted', { values: this.formContext.values });
    }

}
Form.template = tags.xml /* xml */ `
    <form t-on-submit="onSubmit">
        <t t-slot="default" />
    </form>
`