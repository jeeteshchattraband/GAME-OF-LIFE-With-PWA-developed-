import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Injectable()
export class SaveSearchService {

  private form: FormGroup;

  constructor() {
  }

  save(form: FormGroup) {
    this.form = form;
  }

  get(): FormGroup {
    return this.form;
  }

}
