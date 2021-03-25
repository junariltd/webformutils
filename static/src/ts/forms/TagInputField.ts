///<amd-module name='jowebutils.forms.TagFieldInput'/>

import { Component, tags, hooks, Context, QWeb } from '@odoo/owl';
import { BaseField, FormField, IFieldMeta, IFieldProps, IFieldState } from './Fields';
import { IOWLEnv } from '../owl_env';
import { IFormContext } from './Form';

type BootstrapTagInputColors = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

export interface ITagState extends IFieldState {
    value: any;
    colour: any;
}

export class TagInputField extends Component<IFieldProps, IOWLEnv> {
    state: ITagState;
    form: IFormContext;
    input: HTMLInputElement;

    constructor() {
        super(...arguments);
        this.state = hooks.useState({
            value: null,
            colour: null,
        });
        this.form = hooks.useContext(this.env.formContext);
        this.input = hooks.useContext(this.env.input);
    }

    onChange(ev: Event) {
        const e = ev.target as KeyboardEvent | null;
        if (e){
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

    setValue(value: any) {
        this.form.setValues({ [this.props.field.name]: value });
    }

    // private serialize(): void {
    //     let serializedString: string = '';
    //     this.tagInputContainer.children('.badge').each((index, el) => {
    //         serializedString += `${$(el).text()};`;
    //     });
    //     this.contextInput.val(serializedString);
    // }

    // public createTag(label: string): void {
    //     const template: string = `<p class="badge badge-pill badge-${this.state.colour} tag-badge">${label}<span>&times;</span></p>`;
    //     this.input.before(template);
    //     const newBadge = this.input.childNodes.entries(0);
    //     newBadge.find('span').click(() => {
    //         newBadge.remove();
    //         this.serialize();
    //     });
    //     this.serialize();
    // }
}