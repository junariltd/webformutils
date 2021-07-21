///<amd-module name='jowebutils.owl_env'/>
define("jowebutils.owl_env", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
///<amd-module name='jowebutils.owl_app'/>
define("jowebutils.owl_app", ["require", "exports", "web.core", "web.public.widget", "web.rpc", "web.session", "web.OwlCompatibility", "@odoo/owl"], function (require, exports, core, publicWidget, rpc, session, web_OwlCompatibility_1, owl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createOWLApp = void 0;
    class App extends owl_1.Component {
    }
    App.components = { RouteComponent: owl_1.router.RouteComponent };
    App.template = owl_1.tags.xml `<RouteComponent />`;
    function createOWLApp(appDef) {
        return publicWidget.Widget.extend(web_OwlCompatibility_1.WidgetAdapterMixin, {
            selector: appDef.selector,
            init: function () {
                this.owl_component = new web_OwlCompatibility_1.ComponentWrapper(this, App);
                const env = this.owl_component.env;
                env.router = new owl_1.router.Router(this.owl_component.env, appDef.routes);
                this.populateOWLEnv();
            },
            populateOWLEnv: function () {
                // Populate OWL env from current odoo environment
                // Try to mimic odoo 14+ where possible, to make porting easier
                // https://github.com/odoo/odoo/blob/14.0/addons/web/static/src/js/common_env.js#L46
                const env = this.owl_component.env;
                env._t = core._t;
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
                qweb.translateFn = core._t;
                const loadPromises = [];
                if (appDef.xmlDependencies) {
                    for (let dep of appDef.xmlDependencies) {
                        loadPromises.push(owl_1.utils.loadFile(dep));
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
        return Object.keys(params).map((key) => {
            const value = params[key] !== null ? params[key] : '';
            return encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }).join('&');
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
///<amd-module name='jowebutils.utils'/>
define("jowebutils.utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.unpatch = exports.patch = exports.getCurrentUrlWithoutHost = void 0;
    // Returns the current URL starting from the first "/"
    function getCurrentUrlWithoutHost() {
        return location.pathname + location.search + location.hash;
    }
    exports.getCurrentUrlWithoutHost = getCurrentUrlWithoutHost;
    // OWL Monkey-patching functions (in Odoo 14+ these are built in to the framework)
    // From https://github.com/odoo/owl/pull/314/commits/46095b7a967e75ee20a87cac018c540ace1f8447
    const patchMap = new WeakMap();
    function patch(C, patchName, patch) {
        let metadata = patchMap.get(C.prototype);
        if (!metadata) {
            metadata = {
                origMethods: {},
                patches: {},
                current: []
            };
            patchMap.set(C.prototype, metadata);
        }
        const proto = C.prototype;
        if (metadata.patches[patchName]) {
            throw new Error(`Patch [\${patchName}] already exists`);
        }
        metadata.patches[patchName] = patch;
        applyPatch(proto, patch);
        metadata.current.push(patchName);
        function applyPatch(proto, patch) {
            Object.keys(patch).forEach(function (methodName) {
                const method = patch[methodName];
                if (typeof method === "function") {
                    const original = proto[methodName];
                    if (!(methodName in metadata.origMethods)) {
                        metadata.origMethods[methodName] = original;
                    }
                    proto[methodName] = function (...args) {
                        this._super = original;
                        return method.call(this, ...args);
                    };
                }
            });
        }
    }
    exports.patch = patch;
    // we define here an unpatch function.  This is mostly useful if we want to
    // remove a patch.  For example, for testing purposes
    function unpatch(C, patchName) {
        const proto = C.prototype;
        let metadata = patchMap.get(proto);
        if (!metadata) {
            return;
        }
        patchMap.delete(proto);
        // reset to original
        for (let k in metadata.origMethods) {
            proto[k] = metadata.origMethods[k];
        }
        // apply other patches
        for (let name of metadata.current) {
            if (name !== patchName) {
                patch(C, name, metadata.patches[name]);
            }
        }
    }
    exports.unpatch = unpatch;
});
///<amd-module name='jowebutils.forms.Attachments'/>
define("jowebutils.forms.Attachments", ["require", "exports", "@odoo/owl"], function (require, exports, owl_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Attachments = void 0;
    class Attachments extends owl_2.Component {
        constructor() {
            super(...arguments);
            this.controlId = 'attachments' + Math.floor(Math.random() * 1000);
        }
        onFileInputChange(ev) {
            const maxAttachments = this.props.maxAttachments || 10;
            if (ev.target && ev.target.files && ev.target.files.length) {
                if (this.props.attachments.length + ev.target.files.length > maxAttachments) {
                    // TODO: something better!
                    alert('You may only upload up to ' + maxAttachments + ' files.');
                }
                else {
                    this.props.onFilesAdded(Array.from(ev.target.files));
                }
            }
        }
        onRemove(ev) {
            const index = ev.target.dataset['index'];
            if (index) {
                // this.state.fileNames.splice(index, 1);
                // this.files.splice(index, 1);
                // this.trigger('files-changed', {
                //     files: this.files
                // });
                this.props.onFileRemoved(index);
            }
        }
    }
    exports.Attachments = Attachments;
    Attachments.components = {};
    Attachments.template = owl_2.tags.xml /* xml */ `
    <div>
        <div class="row">
            <div class="joweb-attachments-file col-6 mb-4"
                t-foreach="props.attachments" t-as="file" t-key="file_index">
                <div class="card" style=" background-color: #EEEEEE !important;">
                    <div class="card-body" style="background-color: #EEEEEE !important;">
                        <t t-esc="file.name" />
                        <div style="position: absolute; top: 0; right: 0; color: #dc3545; font-size: 1.5rem;">
                            <span class="fa fa-trash-o joweb-attachments-del-btn"
                                title="Remove File"
                                t-on-click="onRemove"
                                t-att-data-index="file_index"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <label t-att-for="controlId"
                    t-att-class="props.buttonClass ? props.buttonClass : 'btn btn-primary mt-2'"
                    t-esc="props.buttonLabel ? props.buttonLabel : 'Add Attachment(s)'" />
                <input
                    t-att-id="controlId"
                    type="file"
                    class="form-control-file"
                    t-on-change="onFileInputChange"
                    multiple="1"
                    hidden="1"
                />
            </div>
        </div>
    </div>
`;
});
///<amd-module name='jowebutils.forms.Form'/>
define("jowebutils.forms.Form", ["require", "exports", "@odoo/owl"], function (require, exports, owl_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Form = void 0;
    class Form extends owl_3.Component {
        constructor() {
            super(...arguments);
            const setValues = this.setValues.bind(this);
            const setFiles = this.setFiles.bind(this);
            const registerField = this.registerField.bind(this);
            const formContextData = {
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
                throw new Error('Duplicate form declared. Use the "name" property to uniquely identify forms.');
            }
            const formContextContainer = new owl_3.Context(formContextData);
            this.env.formContext[this.name] = formContextContainer;
            this.formContext = formContextContainer.state;
            this.fields = {};
            this.files = {};
        }
        async willUpdateProps(nextProps) {
            this.formContext.mode = nextProps.mode || 'edit';
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
        setFiles(values) {
            Object.assign(this.files, values);
        }
        valuesChanged(fieldsChanged) {
            this.trigger('values-changed', {
                fieldsChanged,
                values: this.formContext.values,
                files: this.files
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
                values, editableValues,
                files: this.files
            });
        }
    }
    exports.Form = Form;
    Form.template = owl_3.tags.xml /* xml */ `
    <form t-on-submit="onSubmit">
        <t t-slot="default" />
    </form>
`;
});
///<amd-module name='jowebutils.forms.Fields'/>
define("jowebutils.forms.Fields", ["require", "exports", "@odoo/owl"], function (require, exports, owl_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormField = exports.BinaryField = exports.MultiSelectField = exports.SelectField = exports.BooleanField = exports.HtmlField = exports.TextField = exports.DateTimeField = exports.DateField = exports.NumberField = exports.CharField = exports.BaseField = void 0;
    class BaseField extends owl_4.Component {
        constructor() {
            super(...arguments);
            this.state = owl_4.hooks.useState({
                value: null
            });
            this.formName = this.props.form || 'form';
            if (!this.env.formContext[this.formName]) {
                throw new Error('Form name does not exist: ' + this.formName);
            }
            this.form = owl_4.hooks.useContext(this.env.formContext[this.formName]);
            this.form.registerField(this.props.field.name, this);
        }
        toBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }
        async onChange(ev) {
            const input = ev.target;
            if (this.props.field.type == 'boolean') {
                this.setValue(input.checked == true);
            }
            else if (this.props.field.type == 'many2one') {
                const value = input.value;
                if (value) {
                    this.setValue(Number(value));
                }
                else {
                    this.setValue(null);
                }
            }
            else if (this.props.field.type == 'date' || this.props.field.type == 'datetime') {
                // Make sure empty string is treated as null
                this.setValue(input.value || null);
            }
            else if (this.props.field.type == 'binary') {
                if (input.files && input.files.length) {
                    const file = input.files[0];
                    const fileValue = {
                        file_name: file.name,
                    };
                    this.form.setValues({ [this.props.field.name]: fileValue });
                    this.form.setFiles({ [this.props.field.name]: file });
                }
                else {
                    this.form.setValues({ [this.props.field.name]: null });
                    this.form.setFiles({ [this.props.field.name]: null });
                }
            }
            else if (this.props.field.type == 'multiselect' || this.props.field.type == 'many2many') {
                const value = input.value;
                if (input.checked == true) {
                    this.multiSelectValue(value);
                }
                else {
                    this.multiDeselectValue(value);
                }
            }
            else {
                this.setValue(input.value);
            }
        }
        setValue(value) {
            this.form.setValues({ [this.props.field.name]: value });
        }
        setNullValue() {
            this.form.setValues({ [this.props.field.name]: null });
        }
        multiIsSelected(value) {
            const selectedValues = this.rawValue || [];
            return selectedValues.indexOf(value) > -1;
        }
        multiSelectValue(value) {
            const selectedValues = this.rawValue || [];
            if (!this.multiIsSelected(value)) {
                selectedValues.push(value);
                this.setValue(selectedValues);
            }
        }
        multiDeselectValue(value) {
            const selectedValues = this.rawValue || [];
            const valueIdx = selectedValues.indexOf(value);
            if (valueIdx > -1) {
                selectedValues.splice(valueIdx, 1);
                this.setValue(selectedValues);
            }
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
    class FieldWrapper extends owl_4.Component {
        constructor() {
            super(...arguments);
            this.groupClass = {
                left: 'form-group joweb-field row',
                above: 'form-group joweb-field',
                none: 'form-group joweb-field'
            };
            this.labelClass = {
                left: 'col-sm-3 col-form-label',
                above: '',
                none: 'd-none'
            };
            this.inputClass = {
                left: 'col-sm-9',
                above: '',
                none: '',
            };
        }
    }
    FieldWrapper.template = owl_4.tags.xml /* xml */ `
    <div t-att-class="groupClass[props.labelPosition || 'left']
            + (props.field.invisible ? ' d-none' : '')
            + (props.field.required ? ' joweb-field-required' : '')">
        <label t-if="!props.field.invisible"
            t-att-for="props.field.name"
            t-att-class="props.labelClass || labelClass[props.labelPosition || 'left']"
            t-att-data-toggle="props.field.tooltip ? 'tooltip' : ''"
            t-att-data-placement="props.field.tooltip ? 'top' : ''"
            t-att-title="props.field.tooltip">
            <t t-esc="props.field.string"/>
        </label>
        <div t-att-class="props.inputClass || inputClass[props.labelPosition || 'left']">
            <t t-slot="default"/>
            <small t-if="props.field.help" id="passwordHelpBlock" class="form-text text-muted">
                <t t-esc="props.field.help" />
            </small>
        </div>
    </div>
`;
    class CharField extends BaseField {
    }
    exports.CharField = CharField;
    CharField.components = { FieldWrapper };
    CharField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <input
            t-if="form.mode == 'edit'"
            type="text"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="formattedValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        />
        <div
            t-if="form.mode == 'view'"
            class="form-control-plaintext">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`;
    class NumberField extends BaseField {
    }
    exports.NumberField = NumberField;
    NumberField.components = { FieldWrapper };
    NumberField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <input
            t-if="form.mode == 'edit'"
            type="number"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="formattedValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        />
        <div
            t-if="form.mode == 'view'"
            class="form-control-plaintext">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`;
    class DateField extends BaseField {
    }
    exports.DateField = DateField;
    DateField.components = { FieldWrapper };
    DateField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <input
            t-if="form.mode == 'edit'"
            type="date"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="rawValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        />
        <div
            t-if="form.mode == 'view'"
            class="form-control-plaintext">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`;
    class DateTimeField extends BaseField {
    }
    exports.DateTimeField = DateTimeField;
    DateTimeField.components = { FieldWrapper };
    DateTimeField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <input
            t-if="form.mode == 'edit'"
            type="datetime-local"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="rawValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        />
        <div
            t-if="form.mode == 'view'"
            class="form-control-plaintext">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`;
    class TextField extends BaseField {
    }
    exports.TextField = TextField;
    TextField.components = { FieldWrapper };
    TextField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <div t-if="form.mode == 'edit'" class="grow-wrap">
            <textarea
                class="form-control"
                t-att-name="props.field.name"
                t-att-required="props.field.required"
                t-att-value="rawValue"
                t-on-change="onChange"
                t-att-placeholder="props.field.placeholder"
                t-att-disabled="props.field.readonly"
                onInput="this.parentNode.dataset.replicatedValue = this.value"
                rows="5"
            />
        </div>
        <div
            t-if="form.mode == 'view'"
            class="form-control-plaintext">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`;
    class HtmlField extends BaseField {
    }
    exports.HtmlField = HtmlField;
    HtmlField.components = { FieldWrapper };
    HtmlField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <div t-if="form.mode == 'edit'" class="grow-wrap">
            <textarea
                class="form-control"
                t-att-name="props.field.name"
                t-att-required="props.field.required"
                t-att-value="rawValue"
                t-on-change="onChange"
                t-att-placeholder="props.field.placeholder"
                t-att-disabled="props.field.readonly"
                onInput="this.parentNode.dataset.replicatedValue = this.value"
                rows="5"
            />
        </div>
        <div
            t-if="form.mode == 'view'"
            class="form-control-plaintext joweb-html-field-content">
            <t t-raw="rawValue" />
        </div>
    </FieldWrapper>
`;
    class BooleanField extends BaseField {
    }
    exports.BooleanField = BooleanField;
    BooleanField.components = { FieldWrapper };
    BooleanField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <label class="joweb-check">
            <input
                t-if="form.mode == 'edit'"
                type="checkbox"
                t-att-name="props.field.name"
                t-att-required="props.field.required"
                t-att-value="true"
                t-att-checked="rawValue"
                t-on-click="onChange"
                t-att-disabled="props.field.readonly"
            />
        </label>
        <div
            t-if="form.mode == 'view'"
            class="form-control-plaintext">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`;
    class SelectField extends BaseField {
    }
    exports.SelectField = SelectField;
    SelectField.components = { FieldWrapper };
    SelectField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <select
            t-if="form.mode == 'edit'"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="Array.isArray(rawValue) &amp;&amp; rawValue.length ? rawValue[0] : rawValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
            t-att-disabled="props.field.readonly"
        >
            <option value=""></option>
            <t t-foreach="props.field.selection || []" t-as="sel_option">
                <option t-att-value="sel_option[0]"><t t-esc="sel_option[1]"/></option>
            </t>
        </select>
        <div
            t-if="form.mode == 'view'"
            class="form-control-plaintext">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`;
    class MultiSelectField extends BaseField {
    }
    exports.MultiSelectField = MultiSelectField;
    MultiSelectField.components = { FieldWrapper };
    MultiSelectField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <div class="card">  
            <div class="card-body p-2">
                <div class="form-check" t-foreach="props.field.selection || []" t-as="sel_option">
                    <label class="form-check-label">
                        <input
                            type="checkbox"
                            class="form-check-input"
                            t-att-value="sel_option[0]"
                            t-att-checked="multiIsSelected(sel_option[0])"
                            t-on-click="onChange"
                            t-att-disabled="props.field.readonly"
                        />
                        <t t-esc="sel_option[1]" />
                    </label>
                </div>
            </div>
        </div>
    </FieldWrapper>
`;
    class BinaryField extends BaseField {
    }
    exports.BinaryField = BinaryField;
    BinaryField.components = { FieldWrapper };
    BinaryField.template = owl_4.tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <t t-if="rawValue &amp;&amp; typeof rawValue == 'object' &amp;&amp; rawValue.file_name">
            <div class="card">
                <div class="card-body p-2" style="background-color: #e9ecef !important;">
                    <a t-if="rawValue.url"
                        t-att-href="rawValue.url" style="color: black;" target="_blank"><t t-esc="rawValue.file_name" /></a>
                    <span t-if="!rawValue.url"
                        ><t t-esc="rawValue.file_name" /></span>
                    <div t-if="!props.field.readonly" style="position: absolute; top: 0; right: 0; font-size: 1.3rem;">
                        <span class="fa fa-trash-o joweb-attachments-del-btn"
                            title="Remove File"
                            t-on-click="setNullValue" />
                    </div>
                </div>
            </div>
        </t>
        <t t-else="">
            <input
                type="file"
                class="form-control-file"
                t-att-name="props.field.name"
                t-att-required="props.field.required"
                t-on-change="onChange"
                t-att-placeholder="props.field.placeholder"
                t-att-disabled="props.field.readonly"
            />
        </t>
    </FieldWrapper>
`;
    class FormField extends owl_4.Component {
    }
    exports.FormField = FormField;
    FormField.components = { CharField, TextField, HtmlField, NumberField, BooleanField,
        DateField, DateTimeField, SelectField, MultiSelectField, BinaryField };
    FormField.template = owl_4.tags.xml /* xml */ `
    <div>
        <t t-if="props.field.type == 'char'">
            <CharField t-props="props" />
        </t>
        <t t-if="props.field.type == 'text'">
            <TextField t-props="props" />
        </t>
        <t t-if="props.field.type == 'html'">
            <HtmlField t-props="props" />
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
        <t t-if="props.field.type == 'multiselect' || props.field.type == 'many2many'">
            <MultiSelectField t-props="props" />
        </t>
        <t t-if="props.field.type == 'binary'">
            <BinaryField t-props="props" />
        </t>
    </div>
`;
});
///<amd-module name='jowebutils.forms.TagFieldInput'/>
define("jowebutils.forms.TagFieldInput", ["require", "exports", "@odoo/owl"], function (require, exports, owl_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TagInputField = void 0;
    class TagInputField extends owl_5.Component {
        constructor() {
            super(...arguments);
            this.state = owl_5.hooks.useState({
                value: null,
                colour: null,
            });
            this.form = owl_5.hooks.useContext(this.env.formContext);
            this.input = owl_5.hooks.useContext(this.env.input);
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
///<amd-module name='jowebutils.forms.utils'/>
define("jowebutils.forms.utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fileToBase64 = void 0;
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const res = reader.result;
                resolve(res.split(";base64,")[1]);
            };
            reader.onerror = error => reject(error);
        });
    }
    exports.fileToBase64 = fileToBase64;
});
///<amd-module name='jowebutils.widgets.NavBar'/>
define("jowebutils.widgets.NavBar", ["require", "exports", "@odoo/owl"], function (require, exports, owl_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NavBar = void 0;
    class NavBar extends owl_6.Component {
        onClickBreadcrumb(ev) {
            ev.preventDefault();
            const breadcrumbIndex = ev.target.dataset.index; // from data-index attribute
            const breadcrumb = this.props.breadcrumbs[breadcrumbIndex];
            // TODO: support external destinations (window.location insead of router.navigate)
            this.env.router.navigate(breadcrumb.destination);
        }
    }
    exports.NavBar = NavBar;
    NavBar.template = owl_6.tags.xml /* xml */ `
    <nav t-attf-class="navbar jowebutils_navbar navbar-light navbar-expand-lg border py-0 mb-2 o_portal_navbar mt-3 rounded">
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
///<amd-module name='jowebutils.widgets.Table'/>
define("jowebutils.widgets.Table", ["require", "exports", "@odoo/owl"], function (require, exports, owl_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Table = void 0;
    class Table extends owl_7.Component {
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
    Table.template = owl_7.tags.xml /* xml */ `
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
///<amd-module name='jowebutils.widgets.Tabs'/>
define("jowebutils.widgets.Tabs", ["require", "exports", "@odoo/owl"], function (require, exports, owl_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tabs = void 0;
    // active
    class Tabs extends owl_8.Component {
        constructor() {
            super(...arguments);
            if (!this.props.tabs)
                throw new Error('No tabs defined!');
            this.state = owl_8.useState({
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
    Tabs.template = owl_8.tags.xml /* xml */ `
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
