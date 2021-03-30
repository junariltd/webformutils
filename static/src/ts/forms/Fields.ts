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
    field: IFieldMeta;
}

export type ValidationError = string;

export interface IFieldComponent {
    validate(): ValidationError[];
}

export interface IFieldState {
    value: any;
}

export class BaseField extends Component<IFieldProps, IOWLEnv> implements IFieldComponent {
    state: IFieldState;
    form: IFormContext;

    constructor() {
        super(...arguments);
        this.state = hooks.useState({
            value: null
        });
        this.form = hooks.useContext(this.env.formContext);
        this.form.registerField(this.props.field.name, this);
    }

    onChange(ev: Event) {
        const input = ev.target as HTMLInputElement;
        this.setValue(input.value);
    }

    setValue(value: any) {
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

    formatValue(value: any) {
        if (this.props.field.type != 'boolean' && !value) {
            return '';
        }
        else if (this.props.field.type == 'selection'
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
`
export class BooleanField extends BaseField {}
BooleanField.components = { FieldWrapper }
BooleanField.template = tags.xml /* xml */ `
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
`

export class TagField extends BaseField {}
TagField.components = { FieldWrapper }
TagField.template = tags.xml /* xml */ `
    <FieldWrapper field="props.field">
        <div class="form-control">
            <span class="badge badge-pill badge-primary"><t t-esc="formattedValue"/></span>
        </div>
        <small t-if="props.field.required" class="form-text text-muted">Required</small>
    </FieldWrapper>
`

export class FormField extends Component<IFieldProps, IOWLEnv>{}
FormField.components = { CharField, BooleanField, SelectField, TagField }
FormField.template = tags.xml /* xml */ `
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
        <t t-if="props.field.type == 'many2many'">
            <TagField field="props.field"/>
        </t>
    </div>
`