///<amd-module name='jowebutils.owl_env'/>
define("jowebutils.owl_env", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
///<amd-module name='jowebutils.owl_app'/>
define("jowebutils.owl_app", ["require", "exports", "web.public.widget", "web.rpc", "web.session", "web.OwlCompatibility", "@odoo/owl"], function (require, exports, publicWidget, rpc, session, web_OwlCompatibility_1, owl_1) {
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
                env.services = {
                    rpc: function (params, options) {
                        const query = rpc.buildQuery(params);
                        return session.rpc(query.route, query.params, options);
                    }
                };
                env.session = session;
            },
            initOWLQWeb: async function () {
                const qweb = new owl_1.QWeb();
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
                const env = this.owl_component.env;
                env.qweb = qweb;
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
///<amd-module name='jowebutils.forms.Form'/>
define("jowebutils.forms.Form", ["require", "exports", "@odoo/owl"], function (require, exports, owl_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Form = void 0;
    class Form extends owl_2.Component {
        constructor() {
            super(...arguments);
            const setValues = this.setValues.bind(this);
            const formContextData = {
                values: this.props.initialValues,
                setValues
            };
            const formContextContainer = new owl_2.Context(formContextData);
            this.env.formContext = formContextContainer;
            this.formContext = formContextContainer.state;
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
            this.trigger('submitted', { values: this.formContext.values });
        }
    }
    exports.Form = Form;
    Form.template = owl_2.tags.xml /* xml */ `
    <form t-on-submit="onSubmit">
        <t t-slot="default" />
    </form>
`;
});
///<amd-module name='jowebutils.forms.Fields'/>
define("jowebutils.forms.Fields", ["require", "exports", "@odoo/owl"], function (require, exports, owl_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormField = exports.TagField = exports.SelectField = exports.BooleanField = exports.CharField = exports.BaseField = void 0;
    class BaseField extends owl_3.Component {
        constructor() {
            super(...arguments);
            this.state = owl_3.hooks.useState({
                value: null
            });
            this.form = owl_3.hooks.useContext(this.env.formContext);
        }
        onChange(ev) {
            const input = ev.target;
            this.setValue(input.value);
        }
        setValue(value) {
            this.form.setValues({ [this.props.field.name]: value });
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
        // setMode(mode: string) {
        //     this.state.mode = mode;
        //     this.renderElement();
        // }
        get rawValue() {
            return this.form.values[this.props.field.name];
        }
        get formattedValue() {
            return this.formatValue(this.rawValue);
        }
        formatValue(value) {
            if (this.props.field.type != 'boolean' && !value) {
                return '';
            }
            else if (this.props.field.type == 'selection'
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
    class FieldWrapper extends owl_3.Component {
    }
    FieldWrapper.template = owl_3.tags.xml /* xml */ `
    <div t-att-class="(!props.field.invisible ? 'form-group row joweb-field' : '')
            + (props.field.invisible ? ' d-none' : '')">
        <label t-if="!props.field.invisible" t-att-for="props.field.name"
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
    CharField.template = owl_3.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <input
            t-if="!props.field.readonly"
            type="text"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="formattedValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
        />
        <div t-if="!props.field.readonly">
            <small t-if="props.field.required" class="form-text text-muted">Required</small>
            <small t-if="!props.field.required" class="form-text text-muted" style="color: transparent !important;">_</small>
        </div>
        <div
            t-if="props.field.readonly"
            class="form-control disabled">
            <t t-esc="formattedValue" />
        </div>
        <div t-if="props.field.readonly">
            <small class="form-text text-muted" style="color: transparent !important;">_</small>
        </div>
    </FieldWrapper>
`;
    class BooleanField extends BaseField {
    }
    exports.BooleanField = BooleanField;
    BooleanField.components = { FieldWrapper };
    BooleanField.template = owl_3.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <input
            t-if="!props.field.readonly"
            type="checkbox"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="true"
            t-att-checked="rawValue"
            t-on-change="onChange"
        />
        <div t-if="!props.field.readonly">
            <small t-if="props.field.required" class="form-text text-muted">Required</small>
            <small t-if="!props.field.required" class="form-text text-muted" style="color: transparent !important;">_</small>
        </div>
        <div
            t-if="props.field.readonly"
            class="form-control disabled">
            <t t-esc="formattedValue" />
        </div>
        <div t-if="props.field.readonly">
            <small class="form-text text-muted" style="color: transparent !important;">_</small>
        </div>
    </FieldWrapper>
`;
    class SelectField extends BaseField {
    }
    exports.SelectField = SelectField;
    SelectField.components = { FieldWrapper };
    SelectField.template = owl_3.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <select
            t-if="!props.field.readonly"
            class="form-control"
            t-att-name="props.field.name"
            t-att-required="props.field.required"
            t-att-value="formattedValue"
            t-on-change="onChange"
            t-att-placeholder="props.field.placeholder"
        >
            <t t-foreach="props.field.selection" t-as="selectField">
                <t t-if="selectField[1] == formattedValue">
                    <option t-att-value="selectField[0]" selected="1"><t t-esc="selectField[1]"/></option>
                </t>
                <t t-if="selectField[1] != formattedValue">
                    <option t-att-value="selectField[0]"><t t-esc="selectField[1]"/></option>
                </t>
                
            </t>
        </select>
        <div t-if="!props.field.readonly">
            <small t-if="props.field.required" class="form-text text-muted">Required</small>
            <small t-if="!props.field.required" class="form-text text-muted" style="color: transparent !important;">_</small>
        </div>
        <div
            t-if="props.field.readonly"
            class="form-control disabled">
            <t t-esc="formattedValue" />
        </div>
        <div t-if="props.field.readonly">
            <small class="form-text text-muted" style="color: transparent !important;">_</small>
        </div>
    </FieldWrapper>
`;
    class TagField extends BaseField {
    }
    exports.TagField = TagField;
    TagField.components = { FieldWrapper };
    TagField.template = owl_3.tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <div class="form-control">
            <span class="badge badge-pill badge-primary"><t t-esc="formattedValue"/></span>
        </div>
        <small t-if="props.field.required" class="form-text text-muted">Required</small>
    </FieldWrapper>
`;
    class FormField extends owl_3.Component {
    }
    exports.FormField = FormField;
    FormField.components = { CharField, BooleanField, SelectField, TagField };
    FormField.template = owl_3.tags.xml /* xml */ `
    <div>
        <t t-if="props.field.type == 'char'">
            <CharField field="props.field"/>
        </t>
        <t t-if="props.field.type == 'boolean'">
            <BooleanField field="props.field"/>
        </t>
        <t t-if="props.field.type == 'selection'">
            <SelectField field="props.field"/>
        </t>
        <t t-if="props.field.type == 'many2one'">
            <CharField field="props.field"/>
        </t>
        <t t-if="props.field.type == 'tag'">
            <TagField field="props.field"/>
        </t>
    </div>
`;
});
///<amd-module name='jowebutils.forms.TagFieldInput'/>
define("jowebutils.forms.TagFieldInput", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//NEEDS CONVERSION
// export class TagInputField {
//   contextInput: JQuery<HTMLElement>;
//   tagInputContainer: JQuery<HTMLElement>;
//   tagInput: JQuery<HTMLElement>;
//   tagInputColorClass: BootstrapTagInputColors;
//   placeholder: string;
//   constructor(contextInput: JQuery<HTMLElement>, colorClass: BootstrapTagInputColors = 'primary') {
//     this.contextInput = contextInput;
//     this.contextInput.prop('hidden', true);
//     this.placeholder = this.contextInput.attr('placeholder') ?? '';
//     this.contextInput.after(`
//     <div class="bootstrap-tag-input-container">
//       <input class="bootstrap-tag-input" placeholder="${this.placeholder}">
//     </div>
//     `);
//     this.tagInputContainer = this.contextInput.next();
//     this.tagInput = this.tagInputContainer.children();
//     this.tagInputColorClass = colorClass;
//     this.initHandler();
//   }
//   private initHandler(): void {
//     this.tagInputContainer.click(() => {
//       this.tagInput.focus();
//     });
//     this.tagInput.keydown((e) => {
//       switch (e.keyCode) {
//         case 9:
//         case 13:
//           e.preventDefault();
//           if (this.tagInput.val()) {
//             this.createTag(String(this.tagInput.val()));
//             this.tagInput.removeAttr('placeholder');
//             this.tagInput.val('');
//           }
//           break;
//         case 8:
//           if (!this.tagInput.val()) {
//             this.tagInputContainer.find('.badge').last().remove();
//             this.serialize();
//           }
//           if (this.tagInputContainer.find('.badge').length == 0) this.tagInput.attr('placeholder', this.placeholder);
//           break;
//       }
//     });
//   }
//   private serialize(): void {
//     let serializedString: string = '';
//     this.tagInputContainer.children('.badge').each((index, el) => {
//       serializedString += `${$(el).text()};`;
//     });
//     this.contextInput.val(serializedString);
//   }
//   public createTag(label: string): void {
//     const template: string = `<p class="badge badge-pill badge-${this.tagInputColorClass} tag-badge">${label}<span>&times;</span></p>`;
//     this.tagInput.before(template);
//     const newBadge = this.tagInput.prev();
//     newBadge.find('span').click(() => {
//       newBadge.remove();
//       this.serialize();
//     });
//     this.serialize();
//   }
// }
