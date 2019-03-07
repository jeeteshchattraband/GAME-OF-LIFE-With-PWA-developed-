import {GameBoardConfig} from './game-board-config';
import {GameConfig} from './game-config';
import {ConfigType} from './config-type';
import {Config} from './config';
import {GameBoardStyleConfig} from './game-board-style-config';
import {TemplatesConfig} from './templates-config';

export class ConfigService {
  private config: Config[] = [new GameBoardConfig(), new GameConfig(), new GameBoardStyleConfig(), new TemplatesConfig()];

  getConfig(configType: ConfigType) {
    return this.config.find(c => c.configType === configType);
  }

}
