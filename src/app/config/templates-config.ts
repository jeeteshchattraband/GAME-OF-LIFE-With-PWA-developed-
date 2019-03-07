import {Config} from './config';
import {ConfigType} from './config-type';
import {ViewMode} from '../templates/view-mode-button/view-mode.enum';

export class TemplatesConfig extends Config {
  private _viewMode: ViewMode = ViewMode.STANDARD;
  private _theme = 'Preview';

  constructor() {
    super(ConfigType.TEMPLATES);
  }

  get viewMode(): ViewMode {
    return this._viewMode;
  }

  set viewMode(value: ViewMode) {
    this._viewMode = value;
    this.emitChange();
  }

  get theme(): string {
    return this._theme;
  }

  set theme(value: string) {
    this._theme = value;
    this.emitChange();
  }

}
