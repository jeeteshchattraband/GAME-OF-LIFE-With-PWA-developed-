import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ViewMode} from './view-mode.enum';
import {ConfigService} from '../../config/config.service';
import {ConfigType} from '../../config/config-type';
import {TemplatesConfig} from '../../config/templates-config';

@Component({
  selector: 'app-view-mode-button',
  templateUrl: './view-mode-button.component.html',
  styleUrls: ['./view-mode-button.component.css']
})
export class ViewModeButtonComponent implements OnInit {

  viewModes = [
    {
      key: ViewMode.STANDARD,
      name: 'Standard'
    },
    {
      key: ViewMode.WIDE,
      name: 'Wide'
    }
  ];

  formGroup: FormGroup;

  constructor(private fb: FormBuilder, private configService: ConfigService) {
  }

  ngOnInit() {
    const templatesConfig: TemplatesConfig = <TemplatesConfig>this.configService.getConfig(ConfigType.TEMPLATES);
    this.formGroup = this.fb.group({
      mode: templatesConfig.viewMode
    });
    this.formGroup.get('mode').valueChanges.subscribe(v => {
      templatesConfig.viewMode = v;
    });
  }

  getActive() {
    return this.viewModes.find(m => m.key === this.formGroup.get('mode').value).name;
  }

  setMode(key: ViewMode) {
    this.formGroup.get('mode').patchValue(key);
  }
}
