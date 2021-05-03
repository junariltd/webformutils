///<amd-module name='jowebutils.owl_env'/>
define("jowebutils.owl_env", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
///<amd-module name='jowebutils.forms.Fields'/>
define("jowebutils.forms.Fields", ["require", "exports", "@odoo/owl"], function (require, exports, owl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormField = exports.BinaryField = exports.SelectField = exports.BooleanField = exports.TextField = exports.DateTimeField = exports.DateField = exports.NumberField = exports.CharField = exports.BaseField = void 0;
    class BaseField extends owl_1.Component {
        constructor() {
            super(...arguments);
            this.state = owl_1.hooks.useState({
                value: null
            });
            this.formName = this.props.form || 'form';
            if (!this.env.formContext[this.formName]) {
                throw new Error('Form name does not exist: ' + this.formName);
            }
            this.form = owl_1.hooks.useContext(this.env.formContext[this.formName]);
            this.form.registerField(this.props.field.name, this);
        }
        onChange(ev) {
            const input = ev.target;
            if (input.getAttribute('type') == 'checkbox') {
                this.setValue(input.checked == true);
            }
            else if (input.getAttribute('aria-label') === 'multiple') {
                this.setValueMultiple(input);
            }
            else {
                this.setValue(input.value);
            }
        }
        setValue(value) {
            this.form.setValues({ [this.props.field.name]: value });
        }
        setValueMultiple(input) {
            let values = Array.from(input.selectedOptions).map((v) => v.value);
            this.form.setValues({ [this.props.field.name]: values });
        }
        validate() {
            const errors = [];
            const value = this.rawValue;
            const field = this.props.field;
            const required = field.required;
            if (required && typeof value != 'boolean' && !value) {
                errors.push("Field '" + field.string + "' is required.");
            }
            return errors;
        }
        getFieldMeta() {
            return this.props.field;
        }
        // setMode(mode: string) {
        //     this.state.mode = mode;
        //     this.renderElement();
        // }
        get rawValue() {
            return this.form.values[this.props.field.name];
        }
        get formattedValue() {
            let fVal = this.formatValue(this.rawValue);
            return fVal;
        }
        formatValue(value) {
            if (this.props.field.type != 'boolean' && !value) {
                return '';
            }
            else if ((this.props.field.type == 'many2many') && value) {
                return value;
            }
            else if ((this.props.field.type == 'selection' || this.props.field.type == 'many2many')
                && this.props.field.selection && value) {
                const match = this.props.field.selection.find((s) => s[0] == value);
                if (!match)
                    return value;
                return match[1];
            }
            else if (this.props.field.type == 'datetime' && value) {
                return new Date(value).toLocaleString();
            }
            else if (value instanceof Array && value.length == 2 && !isNaN(value[0])) {
                return value[1]; // many2one value (id, name). Return name.
            }
            return value;
        }
    }
    exports.BaseField = BaseField;
    class FieldWrapper extends owl_1.Component {
    }
    FieldWrapper.template = owl_1.tags.xml /* xml */ `
    <div t-att-class="(!props.field.invisible ? 'form-group row joweb-field' : '')
            + (props.field.invisible ? ' d-none' : '')
            + (props.field.required ? ' joweb-field-required' : '')">
        <label t-if="!props.field.invisible"
            t-att-for="props.field.name"
            class="col-sm-3 col-form-label"
            t-att-data-toggle="props.field.tooltip ? 'tooltip' : ''"
            t-att-data-placement="props.field.tooltip ? 'top' : ''"
            t-att-title="props.field.tooltip">
            <t t-esc="props.field.string"/>
        </label>
        <div class="col-sm-9">
            <t t-slot="default"/>
        </div>
    </div>
`;
    class CharField extends BaseField {
    }
    exports.CharField = CharField;
    CharField.components = { FieldWrapper };
    CharField.template = owl_1.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <input
            type="text"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="formattedValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        />
    </FieldWrapper>
`;
    class NumberField extends BaseField {
    }
    exports.NumberField = NumberField;
    NumberField.components = { FieldWrapper };
    NumberField.template = owl_1.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <input
            type="number"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="formattedValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        />
    </FieldWrapper>
`;
    class DateField extends BaseField {
    }
    exports.DateField = DateField;
    DateField.components = { FieldWrapper };
    DateField.template = owl_1.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <input
            type="date"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="rawValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        />
    </FieldWrapper>
`;
    class DateTimeField extends BaseField {
    }
    exports.DateTimeField = DateTimeField;
    DateTimeField.components = { FieldWrapper };
    DateTimeField.template = owl_1.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <input
            type="datetime-local"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="rawValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        />
    </FieldWrapper>
`;
    class TextField extends BaseField {
    }
    exports.TextField = TextField;
    TextField.components = { FieldWrapper };
    TextField.template = owl_1.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <div class="grow-wrap">
            <textarea
                class="form-control"
                t-att-name="props.field.name"
                t-att-required="props.field.required"
                t-att-value="formattedValue"
                t-on-change="onChange"
                t-att-placeholder="props.field.placeholder"
                t-att-disabled="props.field.readonly"
                onInput="this.parentNode.dataset.replicatedValue = this.value"
            />
        </div>
    </FieldWrapper>
`;
    class BooleanField extends BaseField {
    }
    exports.BooleanField = BooleanField;
    BooleanField.components = { FieldWrapper };
    BooleanField.template = owl_1.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <label class="joweb-check">
            <input
                type="checkbox"
                t-att-name="props.field.name"
                t-att-required="props.field.required"
                t-att-value="true"
                t-att-checked="rawValue"
                t-on-click="onChange"
                t-att-disabled="props.field.readonly"
            />
        </label>
    </FieldWrapper>
`;
    class SelectField extends BaseField {
    }
    exports.SelectField = SelectField;
    SelectField.components = { FieldWrapper };
    SelectField.template = owl_1.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <select
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="formattedValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        >
            <option value=""></option>
            <t t-foreach="props.field.selection || []" t-as="sel_option">
                <option
                    t-att-value="sel_option[0]"
                    t-att-selected="sel_option[0] == rawValue ? 'selected' :
                        rawValue != null &amp;&amp; rawValue.length == 2 &amp;&amp; sel_option[0] == rawValue[0] ? 'selected' : false"
                ><t t-esc="sel_option[1]"/></option>
            </t>
        </select>
    </FieldWrapper>
`;
    class BinaryField extends BaseField {
    }
    exports.BinaryField = BinaryField;
    BinaryField.components = { FieldWrapper };
    BinaryField.template = owl_1.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <input
            type="file"
            class="form-control-file"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="formattedValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        />
    </FieldWrapper>
`;
    class FormField extends owl_1.Component {
    }
    exports.FormField = FormField;
    FormField.components = { CharField, TextField, NumberField, BooleanField,
        DateField, DateTimeField, SelectField, BinaryField };
    FormField.template = owl_1.tags.xml /* xml */ `
    <div>
        <t t-if="props.field.type == 'char'">
            <CharField t-props="props" />
        </t>
        <t t-if="props.field.type == 'text'">
            <TextField t-props="props" />
        </t>
        <t t-if="props.field.type == 'float' || props.field.type == 'integer'">
            <NumberField t-props="props" />
        </t>
        <t t-if="props.field.type == 'boolean'">
            <BooleanField t-props="props" />
        </t>
        <t t-if="props.field.type == 'date'">
            <DateField t-props="props" />
        </t>
        <t t-if="props.field.type == 'datetime'">
            <DateTimeField t-props="props" />
        </t>
        <t t-if="props.field.type == 'selection' || props.field.type == 'many2one'">
            <SelectField t-props="props" />
        </t>
        <t t-if="props.field.type == 'binary'">
            <BinaryField t-props="props" />
        </t>
    </div>
`;
});
///<amd-module name='jowebutils.forms.Form'/>
define("jowebutils.forms.Form", ["require", "exports", "@odoo/owl"], function (require, exports, owl_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Form = void 0;
    class Form extends owl_2.Component {
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
                throw new Error('Duplicate form declared. Use the "name" property to uniquely identify forms.');
            }
            const formContextContainer = new owl_2.Context(formContextData);
            this.env.formContext[this.name] = formContextContainer;
            this.formContext = formContextContainer.state;
            this.fields = {};
        }
        willUnmount() {
            // Remove form context
            delete this.env.formContext[this.name];
        }
        registerField(name, component) {
            this.fields[name] = component;
        }
        setValues(values) {
            Object.assign(this.formContext.values, values);
            this.valuesChanged(Object.keys(values));
        }
        valuesChanged(fieldsChanged) {
            this.trigger('values-changed', {
                fieldsChanged,
                values: this.formContext.values
            });
        }
        onSubmit(ev) {
            ev.preventDefault();
            // Call custom 'submitted' event handler, if registered.
            const values = this.formContext.values;
            const editableValues = {};
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
    exports.Form = Form;
    Form.template = owl_2.tags.xml /* xml */ `
    <form t-on-submit="onSubmit">
        <t t-slot="default" />
    </form>
`;
});
///<amd-module name='jowebutils.widgets.Tabs'/>
define("jowebutils.widgets.Tabs", ["require", "exports", "@odoo/owl"], function (require, exports, owl_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tabs = void 0;
    // active
    class Tabs extends owl_3.Component {
        constructor() {
            super(...arguments);
            if (!this.props.tabs)
                throw new Error('No tabs defined!');
            this.state = owl_3.useState({
                activeTab: this.props.tabs[0].tab
            });
        }
        onClickTab(ev) {
            ev.preventDefault();
            const tab = ev.target.dataset.tab;
            this.state.activeTab = tab;
        }
    }
    exports.Tabs = Tabs;
    Tabs.template = owl_3.tags.xml /* xml */ `
    <div>
        <ul class="nav nav-tabs mb-4">
            <li t-foreach="props.tabs" t-as="tab" t-key="tab_index" class="nav-item">
                <a
                    t-att-class="'nav-link' + (tab.tab == state.activeTab ? ' active' : '')"
                    t-att-data-tab="tab.tab"
                    t-on-click="onClickTab"
                    href="#"><t t-esc="tab.string" /></a>
            </li>
        </ul>
        <div t-foreach="props.tabs" t-as="tab" t-key="tab_index"
            t-att-class="tab.tab == state.activeTab ? '' : 'd-none'">
            <t t-slot="{{tab.tab}}" />
        </div>
    </div>
`;
});
///<amd-module name='jowebutils.testapp.FormTester'/>
define("jowebutils.testapp.FormTester", ["require", "exports", "@odoo/owl", "jowebutils.forms.Form", "jowebutils.forms.Fields", "jowebutils.widgets.Tabs"], function (require, exports, owl_4, Form_1, Fields_1, Tabs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormTester = void 0;
    class FormTester extends owl_4.Component {
        constructor() {
            super(...arguments);
            this.state = owl_4.hooks.useState({
                initial_settings: {
                    required: false,
                    readonly: false,
                    invisible: false,
                    mode: 'edit',
                },
                settings_fields: {
                    attribs: [
                        { name: 'required', type: 'boolean', string: 'Required' },
                        { name: 'readonly', type: 'boolean', string: 'Readonly' },
                        { name: 'invisible', type: 'boolean', string: 'Invisible' },
                        { name: 'placeholder', type: 'char', string: 'Placeholder Text' },
                    ],
                    mode: [
                        { name: 'mode', type: 'selection', string: 'Form Mode',
                            selection: [['view', 'View Mode'], ['edit', 'Edit Mode']] },
                    ]
                },
                form_fields: [
                    { name: 'char_field', type: 'char', string: 'Char Field' },
                    { name: 'text_field', type: 'text', string: 'Text Field' },
                    { name: 'float_field', type: 'float', string: 'Float Field' },
                    { name: 'integer_field', type: 'integer', string: 'Integer Field' },
                    { name: 'boolean_field', type: 'boolean', string: 'Boolean Field' },
                    { name: 'selection_field', type: 'selection', string: 'Selection Field',
                        selection: [['opt1', 'Option 1'], ['opt2', 'Option 2'], ['opt3', 'Option 3']] },
                    { name: 'date_field', type: 'date', string: 'Date Field' },
                    { name: 'datetime_field', type: 'datetime', string: 'Date & Time Field' },
                    { name: 'file_field', type: 'binary', string: 'File Field' },
                ],
                output: null
            });
        }
        onSettingsChanged(ev) {
            const newSettings = ev.detail.values;
            console.log('settings', newSettings);
            this.state.form_fields.forEach((field) => {
                field.required = newSettings.required;
                field.readonly = newSettings.readonly;
                field.invisible = newSettings.invisible;
                field.placeholder = newSettings.placeholder;
            });
        }
        onSubmitted(ev) {
            const formValues = ev.detail.values;
            this.state.output = JSON.stringify(formValues, null, 2);
        }
    }
    exports.FormTester = FormTester;
    FormTester.components = { Form: Form_1.Form, FormField: Fields_1.FormField, Tabs: Tabs_1.Tabs };
    FormTester.template = owl_4.tags.xml /* xml */ `
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
`;
});
///<amd-module name='jowebutils.testapp.main'/>
define("jowebutils.testapp.main", ["require", "exports", "@odoo/owl", "jowebutils.testapp.FormTester"], function (require, exports, owl_5, FormTester_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // import { WidgetsTester } from './pages/WidgetsTester';
    owl_5.mount(FormTester_1.FormTester, { target: document.getElementById('app') });
});
///<amd-module name='jowebutils.widgets.Table'/>
define("jowebutils.widgets.Table", ["require", "exports", "@odoo/owl"], function (require, exports, owl_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Table = void 0;
    class Table extends owl_6.Component {
        formatValue(value) {
            if (value instanceof Array && value.length == 2 && !isNaN(value[0])) {
                return value[1]; // many2one value (id, name). Return name.
            }
            return value;
        }
        onClickRow(ev) {
            ev.preventDefault();
            const rowIndex = ev.target.dataset.index; // from data-index attribute
            this.trigger('row-clicked', {
                row: this.props.data[rowIndex]
            });
        }
    }
    exports.Table = Table;
    Table.template = owl_6.tags.xml /* xml */ `
    <div class="table-responsive border rounded border-top-0">
        <table class="table rounded mb-0 bg-white o_portal_my_doc_table jowebutils-table">
            <tr>
                <th t-foreach="props.cols" t-as="col" t-key="col.name"><t t-esc="col.string" /></th>
            </tr>
            <tr t-foreach="props.data" t-as="row">
                <td t-foreach="props.cols" t-as="col" t-key="col.name">
                    <t t-if="col_first">
                        <a class="table-row-link" href=""
                            t-on-click="onClickRow"
                            t-att-data-index="row_index"><t t-esc="formatValue(row[col.name])" /></a>
                    </t>
                    <t t-else="">
                        <t t-esc="formatValue(row[col.name])" />
                    </t>
                </td>
            </tr>
        </table>
    </div>
`;
});
///<amd-module name='jowebutils.testapp.WidgetsTester'/>
define("jowebutils.testapp.WidgetsTester", ["require", "exports", "@odoo/owl", "jowebutils.widgets.Table"], function (require, exports, owl_7, Table_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WidgetsTester = void 0;
    class WidgetsTester extends owl_7.Component {
        constructor() {
            super(...arguments);
            this.state = owl_7.hooks.useState({
                cols: [
                    { name: 'id', string: 'ID' },
                    { name: 'item', string: 'Item' },
                    { name: 'status', string: 'Status' }
                ],
                data: [
                    { id: '1', item: 'Milk', status: 'To Buy' },
                    { id: '2', item: 'Eggs', status: 'To Buy' },
                    { id: '3', item: 'Bacon', status: 'In Stock' },
                ]
            });
        }
    }
    exports.WidgetsTester = WidgetsTester;
    WidgetsTester.components = { Table: Table_1.Table };
    WidgetsTester.template = owl_7.tags.xml /* xml */ `
    <div class="container">
        <div class="row">
            <div class="col-md-10 offset-md-1">
                <h1 class="my-4">JOWebUtils Widgets Tester</h1>

                <div class="card shadow-sm mt-3">
                    <div class="card-header">
                        <b>Table</b>
                    </div>
                    <div class="card-body p-0">
                        <Table cols="state.cols" data="state.data" />
                    </div>
                </div>

            </div>
        </div>
    </div>
`;
});
///<amd-module name='jowebutils.owl_app'/>
define("jowebutils.owl_app", ["require", "exports", "web.public.widget", "web.rpc", "web.session", "web.OwlCompatibility", "@odoo/owl"], function (require, exports, publicWidget, rpc, session, web_OwlCompatibility_1, owl_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createOWLApp = void 0;
    class App extends owl_8.Component {
    }
    App.components = { RouteComponent: owl_8.router.RouteComponent };
    App.template = owl_8.tags.xml `<RouteComponent />`;
    function createOWLApp(appDef) {
        return publicWidget.Widget.extend(web_OwlCompatibility_1.WidgetAdapterMixin, {
            selector: appDef.selector,
            init: function () {
                this.owl_component = new web_OwlCompatibility_1.ComponentWrapper(this, App);
                const env = this.owl_component.env;
                env.router = new owl_8.router.Router(this.owl_component.env, appDef.routes);
                this.populateOWLEnv();
            },
            populateOWLEnv: function () {
                // Populate OWL env from current odoo environment
                // Try to mimic odoo 14+ where possible, to make porting easier
                // https://github.com/odoo/odoo/blob/14.0/addons/web/static/src/js/common_env.js#L46
                const env = this.owl_component.env;
                env.services = {
                    rpc: function (params, options) {
                        const query = rpc.buildQuery(params);
                        return session.rpc(query.route, query.params, options);
                    }
                };
                env.session = session;
            },
            initOWLQWeb: async function () {
                const env = this.owl_component.env;
                const qweb = env.qweb;
                const loadPromises = [];
                if (appDef.xmlDependencies) {
                    for (let dep of appDef.xmlDependencies) {
                        loadPromises.push(owl_8.utils.loadFile(dep));
                    }
                }
                const templateFiles = await Promise.all(loadPromises);
                for (let templates of templateFiles) {
                    qweb.addTemplates(templates);
                }
                env.loadedXmlDependencies = appDef.xmlDependencies || [];
            },
            start: async function () {
                await this.initOWLQWeb();
                await this.owl_component.env.router.start();
                this.owl_component.mount(this.el);
            }
        });
    }
    exports.createOWLApp = createOWLApp;
});
///<amd-module name='jowebutils.querystring'/>
define("jowebutils.querystring", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAllQueryStringValues = exports.getURLQueryStringValue = exports.getQueryStringValue = exports.objectToQueryString = void 0;
    function objectToQueryString(params) {
        if (!params)
            return '';
        return Object.keys(params).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&');
    }
    exports.objectToQueryString = objectToQueryString;
    function getQueryStringValue(param) {
        return getURLQueryStringValue(window.location.href, param);
    }
    exports.getQueryStringValue = getQueryStringValue;
    function getURLQueryStringValue(url, param) {
        return (new URL(url)).searchParams.get(param);
    }
    exports.getURLQueryStringValue = getURLQueryStringValue;
    function getAllQueryStringValues() {
        return (new URL(window.location.href)).searchParams;
    }
    exports.getAllQueryStringValues = getAllQueryStringValues;
});
///<amd-module name='jowebutils.forms.TagFieldInput'/>
define("jowebutils.forms.TagFieldInput", ["require", "exports", "@odoo/owl"], function (require, exports, owl_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TagInputField = void 0;
    class TagInputField extends owl_9.Component {
        constructor() {
            super(...arguments);
            this.state = owl_9.hooks.useState({
                value: null,
                colour: null,
            });
            this.form = owl_9.hooks.useContext(this.env.formContext);
            this.input = owl_9.hooks.useContext(this.env.input);
        }
        onChange(ev) {
            const e = ev.target;
            if (e) {
                switch (e.keyCode) {
                    case 9:
                    case 13:
                        e.preventDefault();
                        if (this.input.value) {
                            // this.createTag(String(this.input.value));
                            this.input.value = '';
                        }
                        break;
                    case 8:
                        if (!this.input.value) {
                            // this.serialize();
                        }
                }
            }
            this.setValue(this.input.value);
        }
        setValue(value) {
            this.form.setValues({ [this.props.field.name]: value });
        }
    }
    exports.TagInputField = TagInputField;
});
///<amd-module name='jowebutils.widgets.NavBar'/>
define("jowebutils.widgets.NavBar", ["require", "exports", "@odoo/owl"], function (require, exports, owl_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NavBar = void 0;
    class NavBar extends owl_10.Component {
        onClickBreadcrumb(ev) {
            ev.preventDefault();
            const breadcrumbIndex = ev.target.dataset.index; // from data-index attribute
            const breadcrumb = this.props.breadcrumbs[breadcrumbIndex];
            // TODO: support external destinations (window.location insead of router.navigate)
            this.env.router.navigate(breadcrumb.destination);
        }
    }
    exports.NavBar = NavBar;
    NavBar.template = owl_10.tags.xml /* xml */ `
    <nav t-attf-class="navbar navbar-light navbar-expand-lg border py-0 mb-2 o_portal_navbar mt-3 rounded">
        <ol class="o_portal_submenu breadcrumb mb-0 py-2 flex-grow-1">
            <li class="breadcrumb-item"><a href="/my/home" aria-label="Home" title="Home"><i class="fa fa-home"/></a></li>
            <t t-foreach="props.breadcrumbs" t-as="item" t-key="item_index">
                <t t-if="item.destination"><li class="breadcrumb-item"><a class="breadcrumb-link"
                    t-on-click="onClickBreadcrumb"
                    t-att-data-index="item_index"
                    href=""><t t-esc="item.string" /></a></li></t>
                <t t-else=""><li class="breadcrumb-item"><t t-esc="item.string" /></li></t>
            </t>
        </ol>
    </nav>
`;
});
