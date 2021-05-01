
///<amd-module name='jowebutils.testapp.FormTester'/>

import { Component, tags } from '@odoo/owl';
import { IOWLEnv } from '@jowebutils/owl_env';

export class FormTester extends Component<{}, IOWLEnv> {

}
FormTester.template = tags.xml /* xml */ `
    <div class="container">
        <div class="row">
            <div class="col-md-6 offset-md-3">
                <h1 class="my-4">JOWebUtils Form Tester</h1>

                <div class="card shadow-sm mt-3">
                    <div class="card-header">
                        <b>Form Settings</b>
                    </div>
                    <div class="card-body p-4">
                        <span>Settings here</span>
                        <hr/>
                    </div>
                </div>

                <div class="card shadow-sm mt-3">
                    <div class="card-header">
                        <b>Form Output</b>
                    </div>
                    <div class="card-body p-4">
                        <span>Field Here...</span>
                        <hr/>
                    </div>
                </div>

            </div>
        </div>
    </div>
`
