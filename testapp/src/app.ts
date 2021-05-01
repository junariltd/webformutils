///<amd-module name='jowebutils.testapp.main'/>

import { mount } from '@odoo/owl';
import { FormTester } from './pages/FormTester';
// import { WidgetsTester } from './pages/WidgetsTester';

mount(FormTester, { target: document.getElementById('app')! });
