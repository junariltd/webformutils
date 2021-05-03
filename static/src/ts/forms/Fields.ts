///<amd-module name='jowebutils.forms.Fields'/>

import { Component, tags, hooks } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';
import { IFormContext } from './Form';

export type FieldType = 'char' | 'text' | 'date' | 'datetime' |
    'selection' | 'many2one' | 'boolean' | 'html' | 'attachments' | 'tag' | 'many2many';

export interface IFieldMeta {
    name: string;
    type: FieldType;
    string: string;
    placeholder?: string;
    invisible?: boolean;
    required?: boolean;
    readonly?: boolean;
    selection?: [string, string][];
}

export interface IFieldProps {
    form?: string;
    field: IFieldMeta;
}

export type ValidationError = string;

export interface IFieldComponent {
    validate(): ValidationError[];
    getFieldMeta(): IFieldMeta;
}

export interface IFieldState {
    value: any;
}

export class BaseField extends Component<IFieldProps, IOWLEnv> implements IFieldComponent {
    formName: string;
    state: IFieldState;
    form: IFormContext;

    constructor() {
        super(...arguments);
        this.state = hooks.useState({
            value: null
        });
        this.formName = this.props.form || 'form';
        if (!this.env.formContext[this.formName]) {
            throw new Error('Form name does not exist: ' + this.formName);
        }
        this.form = hooks.useContext(this.env.formContext[this.formName]);
        this.form.registerField(this.props.field.name, this);
    }

    onChange(ev: Event) {
        const input = ev.target as HTMLInputElement;
        if (input.getAttribute('type') == 'checkbox') {
            this.setValue(input.checked == true);
        }
        else if (input.getAttribute('aria-label') === 'multiple'){
            this.setValueMultiple(input);
        }
        else {
            this.setValue(input.value);
        }
    }

    setValue(value: any) {
        this.form.setValues({ [this.props.field.name]: value });
    }

    setValueMultiple(input: any) {
        let values = Array.from(input.selectedOptions).map((v: any) => v.value);
        this.form.setValues({ [this.props.field.name]: values})
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

    formatValue(value: any) {
        if (this.props.field.type != 'boolean' && !value) {
            return '';
        }
        else if ((this.props.field.type == 'many2many') && value){
            return value;
        }
        else if ((this.props.field.type == 'selection' || this.props.field.type == 'many2many')
                && this.props.field.selection && value) {
            const match = this.props.field.selection.find((s) => s[0] == value)
            if (!match) return value;
            return match[1];
        }
        else if (this.props.field.type == 'datetime' && value) {
            return new Date(value).toLocaleString();
        }
        else if (value instanceof Array && value.length == 2 && !isNaN(value[0])) {
            return value[1]  // many2one value (id, name). Return name.
        }
        return value
    }

    // setHasError: function (hasError) {
    //     if (hasError) {
    //         this.$el.addClass('joweb-field-has-error')
    //     }
    //     else {
    //         this.$el.removeClass('joweb-field-has-error')
    //     }
    // }

    // renderElement: function () {
    //     this._super();
    //     if (this.state.field.tooltip) {
    //         this.$el.find('[data-toggle="tooltip"]').tooltip();
    //     }
    //     const onChange = this.state.field.onChange;
    //     if (onChange) {
    //         if (this.state.field.type == 'selection') {
    //             const control = this.$('select').first();
    //             control.change(onChange);
    //         }
    //         else {
    //             const control = this.$('input').first();
    //             control.change(onChange);
    //         }
    //     }

    //     if (this.state.field.type == "html") {
    //         const textarea = this.$('textarea.o_wysiwyg_loader').first();
    //         if (textarea && textarea.length > 0) {
    //             var $textarea = $(textarea);
    //             var editorKarma = $textarea.data('karma') || 0; // default value for backward compatibility
    //             var $form = $(document);
    //             var hasFullEdit = parseInt($("#karma").val()) >= editorKarma;
    //             var toolbar = [
    //                 ['style', ['style']],
    //                 ['font', ['bold', 'italic', 'underline', 'clear']],
    //                 ['para', ['ul', 'ol', 'paragraph']],
    //                 ['table', ['table']],
    //             ];
    //             if (hasFullEdit) {
    //                 toolbar.push(['insert', ['linkPlugin', 'mediaPlugin']]);
    //             }
    //             toolbar.push(['history', ['undo', 'redo']]);
    
    //             var options = {
    //                 height: 200,
    //                 minHeight: 80,
    //                 toolbar: toolbar,
    //                 styleWithSpan: false,
    //                 styleTags: _.without(weDefaultOptions.styleTags, 'h1', 'h2', 'h3'),
    //                 recordInfo: {
    //                     context: this._getContext(),
    //                     res_model: this.state.field.res_model,
    //                     res_id: +window.location.pathname.split('-').pop(),
    //                 },
    //             };
    //             if (!hasFullEdit) {
    //                 options.plugins = {
    //                     LinkPlugin: false,
    //                     MediaPlugin: false,
    //                 };
    //             }
    //             wysiwygLoader.load(this, $textarea[0], options).then(wysiwyg => {
    //                 $form.on('click', '', (e) => {
    //                     let insideEditor = $(e.target).closest("odoo-wysiwyg-container").length > 0;
    //                     if (!insideEditor) {
    //                         wysiwyg.save().then(val => {
    //                             this.setValue(val.html);
    //                         });
    //                     }
    //                 });
    //             });
    //         }
    //     }
    // }
}

class FieldWrapper extends Component<IFieldProps> {}
FieldWrapper.template = tags.xml /* xml */ `
    <div t-att-class="(!props.field.invisible ? 'form-group row joweb-field' : '')
            + (props.field.invisible ? ' d-none' : '')">
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
`

export class CharField extends BaseField {}
CharField.components = { FieldWrapper }
CharField.template = tags.xml /* xml */ `
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
        <div
            t-if="props.field.readonly"
            class="form-control disabled">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`
export class BooleanField extends BaseField {}
BooleanField.components = { FieldWrapper }
BooleanField.template = tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <label class="joweb-check">
            <input
                t-if="!props.field.readonly"
                type="checkbox"
                t-att-name="props.field.name"
                t-att-required="props.field.required"
                t-att-value="true"
                t-att-checked="rawValue"
                t-on-click="onChange"
            />
        </label>
        <div
            t-if="props.field.readonly"
            class="form-control disabled">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`

export class SelectField extends BaseField {}
SelectField.components = { FieldWrapper }
SelectField.template = tags.xml /* xml */ `
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
            <option value=""></option>
            <t t-foreach="props.field.selection" t-as="sel_option">
                <option
                    t-att-value="sel_option[0]"
                    t-att-selected="sel_option[0] == rawValue ? 'selected' :
                        rawValue != null &amp;&amp; rawValue.length == 2 &amp;&amp; sel_option[0] == rawValue[0] ? 'selected' : false"
                ><t t-esc="sel_option[1]"/></option>
            </t>
        </select>
        <div
            t-if="props.field.readonly"
            class="form-control disabled">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`

export class TagField extends BaseField {}
TagField.components = { FieldWrapper }
TagField.template = tags.xml /* xml */ `
<FieldWrapper field="props.field">
    <select multiple="multiple"
        t-if="!props.field.readonly"
        class="form-control"
        t-att-name="props.field.name"
        t-att-required="props.field.required"
        t-att-value="formattedValue"
        t-on-change="onChange"
        aria-label="multiple"
    >
        <option value="" t-att-selected="formattedValue.length == 0 ? 'selected' : false">No Roles</option>
        <t t-foreach="props.field.selection" t-as="sel_option">
            <option
                t-att-value="sel_option[0]"
                t-att-selected="formattedValue.includes(sel_option[0]) ? 'selected' : false"
            ><t t-esc="sel_option[1]"/></option>
        </t>
    </select>
    <div
        t-if="props.field.readonly"
        class="form-control disabled">
        <t t-esc="formattedValue" />
    </div>
</FieldWrapper>
`

export class FormField extends Component<IFieldProps, IOWLEnv>{}
FormField.components = { CharField, BooleanField, SelectField, TagField }
FormField.template = tags.xml /* xml */ `
    <div>
        <t t-if="props.field.type == 'char'">
            <CharField t-props="props" />
        </t>
        <t t-if="props.field.type == 'boolean'">
            <BooleanField t-props="props" />
        </t>
        <t t-if="props.field.type == 'selection' || props.field.type == 'many2one'">
            <SelectField t-props="props" />
        </t>
        <t t-if="props.field.type == 'many2many'">
            <TagField t-props="props" />
        </t>
    </div>
`