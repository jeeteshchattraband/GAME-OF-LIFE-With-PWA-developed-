import {Component, Input} from '@angular/core';
import {Template} from '../../template';

@Component({
  selector: 'app-template-detail',
  templateUrl: './template-detail.component.html',
  styleUrls: ['./template-detail.component.css']
})
export class TemplateDetailComponent {

  @Input()
  private template: Template;

  getTemplate() {
    return this.template;
  }

}
