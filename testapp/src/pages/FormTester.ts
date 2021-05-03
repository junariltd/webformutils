
///<amd-module name='jowebutils.testapp.FormTester'/>

import { Component, tags, hooks } from '@odoo/owl';
import { IOWLEnv } from '@jowebutils/owl_env';
import { Form, OwlEvent } from '@jowebutils/forms/Form';
import { FormField, IFieldMeta } from '@jowebutils/forms/Fields';

export interface IFormTesterState {
    settings_fields: { [fieldName: string]: IFieldMeta };
    form_fields: IFieldMeta[];
}

export class FormTester extends Component<{}, IOWLEnv> {
    state: IFormTesterState;

    constructor() {
        super(...arguments);
        this.state = hooks.useState({
            settings_fields: {
                required: { name: 'required', type: 'boolean', string: 'Required' }
            },
            form_fields: [
                { name: 'char_field', type: 'char', string: 'Char Field' },
                { name: 'boolean_field', type: 'boolean', string: 'Boolean Field' }
            ],
            settings: {
            }
        });
    }

    onSettingsChanged(ev: OwlEvent) {
        console.log('settings', ev.detail);
    }

    onSubmitted(ev: OwlEvent) {
        console.log('submitted');
    }
}
FormTester.components = { Form, FormField }
FormTester.template = tags.xml /* xml */ `
    <div class="container">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <h1 class="my-4">JOWebUtils Form Tester</h1>

                <div class="card shadow-sm mt-3">
                    <div class="card-header">
                        <b>Field Settings</b>
                    </div>
                    <div class="card-body p-4">
                        <Form name="'settings'" t-on-values-changed="onSettingsChanged">
                            <FormField form="'settings'" field="state.settings_fields.required" />
                        </Form>
                    </div>
                </div>

                <div class="card shadow-sm mt-3">
                    <div class="card-header">
                        <b>Form Output</b>
                    </div>
                    <Form t-on-submitted="onSubmitted">
                        <div class="card-body p-4">
                            <t t-foreach="state.form_fields" t-as="field" t-key="field.name">
                                <FormField field="field" />
                            </t>
                            <button class="btn btn-primary" type="submit">Submit</button>
                        </div>
                    </Form>
                </div>

            </div>
        </div>
    </div>
`
