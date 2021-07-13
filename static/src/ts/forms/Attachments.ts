///<amd-module name='jowebutils.forms.Attachments'/>

import { Component, tags, hooks } from '@odoo/owl';
import { IOWLEnv } from '../owl_env';

export interface IAttachmentsProps {
    buttonLabel: string;
    buttonClass: string;
    onFilesAdded: (files: File[]) => void;
    onFileRemoved: (index: Number) => void;
    attachments: File[];
    maxAttachments: number;
}

export interface IAttachmentsState {
    controlId: string;
}

export class Attachments extends Component<IAttachmentsProps, IOWLEnv> {
    controlId: string;

    constructor() {
        super(...arguments);
        this.controlId = 'attachments' + Math.floor(Math.random() * 1000)
    }

    onFileInputChange(ev: any) {
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

    onRemove(ev: any) {
        const index = ev.target.dataset['index']
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
Attachments.components = { }
Attachments.template = tags.xml /* xml */ `
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
`
