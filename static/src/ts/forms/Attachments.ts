///<amd-module name='jowebutils.forms.Attachments'/>

import { Component, tags, hooks } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';

export interface IAttachmentsProps {
    buttonLabel: string;
    buttonClass: string;
    maxAttachments: number;
}

export interface IAttachmentsState {
    controlId: string;
    fileNames: string[];
}

export class Attachments extends Component<IAttachmentsProps, IOWLEnv> {
    state: IAttachmentsState;
    files: File[];

    constructor() {
        super(...arguments);
        this.state = hooks.useState({
            controlId: 'attachments' + Math.floor(Math.random() * 1000),
            fileNames: []
        });
        this.files = [];
    }

    onFileInputChange(ev: any) {
        const maxAttachments = this.props.maxAttachments || 10;
        if (ev.target && ev.target.files && ev.target.files.length) {
            if (this.state.fileNames.length + ev.target.files.length > maxAttachments) {
                // TODO: something better!
                alert('You may only upload up to ' + maxAttachments + ' files.');
            }
            else {
                const fileNames = Array.from(ev.target.files).map((f: any) => f.name);
                this.state.fileNames.push(...fileNames);
                this.files.push(...ev.target.files);
                ev.target.value = '';
                this.trigger('files-changed', {
                    files: this.files
                });        
            }
        }
    }

    onRemove(ev: any) {
        const index = ev.target.dataset['index']
        if (index) {
            this.state.fileNames.splice(index, 1);
            this.files.splice(index, 1);
            this.trigger('files-changed', {
                files: this.files
            });
        }
    }

}
Attachments.components = { }
Attachments.template = tags.xml /* xml */ `
    <div>
        <div class="joweb-attachments-file"
            t-foreach="files" t-as="file" t-key="file_index">
            <t t-esc="file.name" />
            <span class="fa fa-trash-o joweb-attachments-del-btn"
                title="Remove File"
                t-on-click="onRemove"
                t-att-data-index="file_index"></span>
        </div>
        <label t-att-for="state.controlId"
            t-att-class="props.buttonClass ? props.buttonClass : 'btn btn-primary mt-2'"
            t-esc="props.buttonLabel ? props.buttonLabel : 'Add Attachment(s)'" />
        <input
            t-att-id="state.controlId"
            type="file"
            class="form-control-file"
            t-on-change="onFileInputChange"
            multiple="1"
            hidden="1"
        />
    </div>
`
