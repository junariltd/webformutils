///<amd-module name='jowebutils.forms.TagFieldInput'/>

import { Component, tags, hooks, Context, QWeb } from '@odoo/owl';
import { FormField, IFieldMeta } from './Fields';
import { IOWLEnv } from '../owl_env';

type BootstrapTagInputColors = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';


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