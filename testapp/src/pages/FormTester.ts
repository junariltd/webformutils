
///<amd-module name='jowebutils.testapp.FormTester'/>

import { Component, tags, hooks } from '@odoo/owl';
import { IOWLEnv } from '@jowebutils/owl_env';
import { Form, OwlEvent } from '@jowebutils/forms/Form';
import { FormField, IFieldMeta } from '@jowebutils/forms/Fields';
import { Tabs } from '@jowebutils/widgets/Tabs';

export interface IFormTesterState {
    initial_settings: { [setting: string]: any };
    labelPosition: string;
    settings_fields: { [type: string]: IFieldMeta[] };
    form_fields: IFieldMeta[];
    output: null | string;
}

export class FormTester extends Component<{}, IOWLEnv> {
    state: IFormTesterState;

    constructor() {
        super(...arguments);
        this.state = hooks.useState<IFormTesterState>({
            initial_settings: {
                required: false,
                readonly: false,
                invisible: false,
                labelPosition: 'left',
                mode: 'edit',
            },
            labelPosition: 'left',
            settings_fields: {
                attribs: [
                    { name: 'required', type: 'boolean', string: 'Required' },
                    { name: 'readonly', type: 'boolean', string: 'Readonly' },
                    { name: 'invisible', type: 'boolean', string: 'Invisible' },
                    { name: 'placeholder', type: 'char', string: 'Placeholder Text' },
                ],
                layout: [
                    { name: 'labelPosition', type: 'selection', string: 'Field Label Position',
                        selection: [['left', 'Left'],['above', 'Above']]},
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
                { name: 'file_field', type: 'binary', string: 'File Field' },
            ],
            output: null
        });
    }

    onSettingsChanged(ev: OwlEvent) {
        const newSettings = ev.detail.values;
        console.log('settings', newSettings);
        this.state.labelPosition = newSettings.labelPosition;
        this.state.form_fields.forEach((field) => {
            field.required = newSettings.required;
            field.readonly = newSettings.readonly;
            field.invisible = newSettings.invisible;
            field.placeholder = newSettings.placeholder;
        })
    }

    onSubmitted(ev: OwlEvent) {
        const formValues = ev.detail.values;
        this.state.output = JSON.stringify(formValues, null, 2);
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
                                { tab: 'layout', string: 'Layout &amp; Mode' }
                            ]">
                                <t t-set-slot="attribs">
                                    <t t-foreach="state.settings_fields.attribs" t-as="field" t-key="field.name">
                                        <FormField form="'settings'" field="field" />
                                    </t>
                                </t>
                                <t t-set-slot="layout">
                                    <t t-foreach="state.settings_fields.layout" t-as="field" t-key="field.name">
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
                                <FormField field="field" labelPosition="state.labelPosition" />
                            </t>
                            <button class="btn btn-primary" type="submit">Submit</button>
                        </div>
                    </Form>
                </div>

                <div class="card shadow-sm mt-3" t-if="state.output">
                    <div class="card-header">
                        <b>Form Output</b>
                    </div>
                    <div class="card-body p-4">
                        <div t-esc="state.output" style="white-space: pre;" />
                    </div>
                </div>

                <div style="height: 100px;"></div>

            </div>
        </div>
    </div>
`
