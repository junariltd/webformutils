///<amd-module name='jowebutils.forms.Fields'/>

import { Component, tags, hooks } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';
import { IFormContext, IFormFile } from './Form';

export type FieldType = 'char' | 'text' | 'date' | 'datetime' |
    'float' | 'integer' | 'boolean' | 'binary' | 'html' |
    'selection' | 'multiselect' | 'many2one' | 'many2many' ;

export type SelectionOption = [string, string];
    
export interface IFieldMeta {
    name: string;
    type: FieldType;
    string?: string;
    placeholder?: string;
    help?: string;
    tooltip?: string;
    invisible?: boolean;
    required?: boolean;
    readonly?: boolean;
    selection?: SelectionOption[];
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

    toBase64(file: File) {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })}

    async onChange(ev: Event) {
        const input = ev.target as HTMLInputElement;

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
        else if(this.props.field.type == 'binary'){ 
            if(input.files && input.files.length){                
                const file = input.files[0]
                const fileValue: IFormFile = {
                    file_name: file.name,
                }
                this.form.setValues({ [this.props.field.name]: fileValue })
                this.form.setFiles({ [this.props.field.name]: file })
            }
            else{
                this.form.setValues({ [this.props.field.name]: null })
                this.form.setFiles({ [this.props.field.name]: null })
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

    setValue(value: any) {
        this.form.setValues({ [this.props.field.name]: value });
    }

    setNullValue() {
        this.form.setValues({ [this.props.field.name]: null });
    }

    multiIsSelected(value: any) {
        const selectedValues = this.rawValue || [];
        return selectedValues.indexOf(value) > -1;
    }

    multiSelectValue(value: any) {
        const selectedValues = this.rawValue || [];
        if (!this.multiIsSelected(value)) {
            selectedValues.push(value);
            this.setValue(selectedValues);
        }
    }

    multiDeselectValue(value: any) {
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

class FieldWrapper extends Component {
    groupClass = {
        left: 'form-group joweb-field row',
        above: 'form-group joweb-field',
        none: 'form-group joweb-field'
    };
    labelClass = {
        left: 'col-sm-3 col-form-label',
        above: '',
        none: 'd-none'
    }
    inputClass = {
        left: 'col-sm-9',
        above: '',
        none: '',
    }
}
FieldWrapper.template = tags.xml /* xml */ `
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
`
export class CharField extends BaseField {}
CharField.components = { FieldWrapper }
CharField.template = tags.xml /* xml */ `
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
`
export class NumberField extends BaseField {}
NumberField.components = { FieldWrapper }
NumberField.template = tags.xml /* xml */ `
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
`
export class DateField extends BaseField {}
DateField.components = { FieldWrapper }
DateField.template = tags.xml /* xml */ `
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
`
export class DateTimeField extends BaseField {}
DateTimeField.components = { FieldWrapper }
DateTimeField.template = tags.xml /* xml */ `
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
`
export class TextField extends BaseField {}
TextField.components = { FieldWrapper }
TextField.template = tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <div t-if="form.mode == 'edit'" class="grow-wrap">
            <textarea
                class="form-control"
                t-att-name="props.field.name"
                t-att-required="props.field.required"
                t-att-value="formattedValue"
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
`
export class HtmlField extends BaseField {}
HtmlField.components = { FieldWrapper }
HtmlField.template = tags.xml /* xml */ `
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
`
export class BooleanField extends BaseField {}
BooleanField.components = { FieldWrapper }
BooleanField.template = tags.xml /* xml */ `
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
`
export class SelectField extends BaseField {}
SelectField.components = { FieldWrapper }
SelectField.template = tags.xml /* xml */ `
    <FieldWrapper t-props="props">
        <select
            t-if="form.mode == 'edit'"
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
        <div
            t-if="form.mode == 'view'"
            class="form-control-plaintext">
            <t t-esc="formattedValue" />
        </div>
    </FieldWrapper>
`
export class MultiSelectField extends BaseField {}
MultiSelectField.components = { FieldWrapper }
MultiSelectField.template = tags.xml /* xml */ `
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
`
export class BinaryField extends BaseField {}
BinaryField.components = { FieldWrapper }
BinaryField.template = tags.xml /* xml */ `
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
`
export class FormField extends Component<IFieldProps, IOWLEnv>{}
FormField.components = { CharField, TextField, HtmlField, NumberField, BooleanField,
    DateField, DateTimeField, SelectField, MultiSelectField, BinaryField }
FormField.template = tags.xml /* xml */ `
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
`