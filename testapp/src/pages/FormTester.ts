
///<amd-module name='jowebutils.testapp.FormTester'/>

import { Component, tags, hooks } from '@odoo/owl';
import { IOWLEnv } from '@jowebutils/owl_env';
import { Form, OwlEvent } from '@jowebutils/forms/Form';
import { FormField, IFieldMeta } from '@jowebutils/forms/Fields';
import { Tabs } from '@jowebutils/widgets/Tabs';

export interface IFormTesterState {
    initial_settings: { [setting: string]: any };
    settings_fields: { [type: string]: IFieldMeta[] };
    form_fields: IFieldMeta[];
}

export class FormTester extends Component<{}, IOWLEnv> {
    state: IFormTesterState;

    constructor() {
        super(...arguments);
        this.state = hooks.useState({
            initial_settings: {
                required: false,
                readonly: false,
                mode: 'edit',
            },
            settings_fields: {
                attribs: [
                    { name: 'required', type: 'boolean', string: 'Required' },
                    { name: 'readonly', type: 'boolean', string: 'Readonly' },
                    { name: 'placeholder', type: 'char', string: 'Placeholder Text' },
                ],
                mode: [
                    { name: 'mode', type: 'selection', string: 'Form Mode',
                        selection: [['view', 'View Mode'],['edit', 'Edit Mode']]},
                ]
            },
            form_fields: [
                { name: 'char_field', type: 'char', string: 'Char Field' },
                { name: 'text_field', type: 'text', string: 'Text Field' },
                { name: 'float_field', type: 'float', string: 'Float Field' },
                { name: 'integer_field', type: 'integer', string: 'Integer Field' },
                { name: 'boolean_field', type: 'boolean', string: 'Boolean Field' },
                { name: 'selection_field', type: 'selection', string: 'Selection Field',
                    selection: [['opt1','Option 1'],['opt2','Option 2'],['opt3','Option 3']] },
                { name: 'date_field', type: 'date', string: 'Date Field' },
                { name: 'datetime_field', type: 'datetime', string: 'Date & Time Field' },
            ],
            settings: {
            }
        });
    }

    onSettingsChanged(ev: OwlEvent) {
        const newSettings = ev.detail.values;
        console.log('settings', newSettings);
        this.state.form_fields.forEach((field) => {
            field.required = newSettings.required;
            field.readonly = newSettings.readonly;
            field.placeholder = newSettings.placeholder;
        })
    }

    onSubmitted(ev: OwlEvent) {
        console.log('submitted');
    }
}
FormTester.components = { Form, FormField, Tabs }
FormTester.template = tags.xml /* xml */ `
    <div class="container">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <h1 class="my-4">JOWebUtils Form Tester</h1>

                <div class="card shadow-sm mt-3">
                    <div class="card-header">
                        <b>Field Settings</b>
                    </div>
                    <Form name="'settings'" initialValues="state.initial_settings"
                            t-on-values-changed="onSettingsChanged">
                        <div class="card-body p-4">

                            <Tabs tabs="[
                                { tab: 'attribs', string: 'Field Attribs' },
                                { tab: 'mode', string: 'Form Mode' }
                            ]">
                                <t t-set-slot="attribs">
                                    <t t-foreach="state.settings_fields.attribs" t-as="field" t-key="field.name">
                                        <FormField form="'settings'" field="field" />
                                    </t>
                                </t>
                                <t t-set-slot="mode">
                                    <t t-foreach="state.settings_fields.mode" t-as="field" t-key="field.name">
                                        <FormField form="'settings'" field="field" />
                                    </t>
                                </t>
                            </Tabs>

                        </div>
                    </Form>
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
