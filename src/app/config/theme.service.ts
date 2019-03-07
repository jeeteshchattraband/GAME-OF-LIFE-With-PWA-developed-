import {Injectable} from '@angular/core';
import {Theme} from './theme';
import {GameBoardStyleConfig} from './game-board-style-config';
import {ConfigType} from './config-type';
import {GameBoardConfig} from './game-board-config';
import {ConfigService} from './config.service';
import {ThemeDataService} from './theme-data.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private _activeTheme: Theme;

  constructor(private configService: ConfigService,
              private themeDataService: ThemeDataService) {
    this.activeTheme = this.findTheme('Default');
  }

  set activeTheme(theme: Theme) {
    this._activeTheme = theme;
    this.applyTheme(theme);
  }

  get activeTheme() {
    return this._activeTheme;
  }

  get themes(): Theme[] {
    return this.themeDataService.getThemes();
  }

  addTheme(theme: Theme) {
    this.themeDataService.addTheme(theme);
  }

  findTheme(name: string) {
    return this.themes.find(t => t.name.toUpperCase() === name.toUpperCase());
  }

  private applyTheme(theme: Theme) {
    const gbStyle = <GameBoardStyleConfig>this.configService.getConfig(ConfigType.GAME_BOARD_STYLE);
    gbStyle.generations = theme.generations;
    gbStyle.aliveCellColors = theme.alive;
    gbStyle.deadCellColors = theme.dead;
    gbStyle.borderColor = theme.borderColor;

    const gb = <GameBoardConfig>this.configService.getConfig(ConfigType.GAME_BOARD);
    gb.cellSpace = theme.border ? 1 : 0;
  }

}
