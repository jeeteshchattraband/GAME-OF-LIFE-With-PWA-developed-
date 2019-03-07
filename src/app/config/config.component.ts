import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ConfigService} from './config.service';
import {GameBoardStyleConfig} from './game-board-style-config';
import {ConfigType} from './config-type';
import {GameBoardConfig} from './game-board-config';
import {Theme} from './theme';
import {ThemeService} from './theme.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit, AfterViewInit {

  private gbStyleConfig: GameBoardStyleConfig;
  private gbConfig: GameBoardConfig;
  private changeDetectionEnabled = false;

  constructor(private configService: ConfigService,
              private themeService: ThemeService) {
  }

  ngOnInit() {
    this.gbStyleConfig = <GameBoardStyleConfig>this.configService.getConfig(ConfigType.GAME_BOARD_STYLE);
    this.gbConfig = <GameBoardConfig>this.configService.getConfig(ConfigType.GAME_BOARD);
  }

  ngAfterViewInit() {
    // The color picker will change "invalid values" sometimes causing additional themes to be created
    // Disabling custom change detection prevents this until after ngAfterViewInit
    this.changeDetectionEnabled = true;
  }

  get themes(): Theme[] {
    return this.themeService.themes;
  }

  get name(): string {
    return this.themeService.activeTheme.name;
  }

  set name(value: string) {
    this.themeService.activeTheme = this.themeService.findTheme(value);
  }

  get generations(): boolean {
    return this.themeService.activeTheme.generations;
  }

  set generations(value: boolean) {
    this.mutateTheme((theme) => theme.generations = value);
  }

  get alive(): string[] {
    return this.themeService.activeTheme.alive;
  }

  setAlive(index: number, value: string) {
    this.mutateTheme((theme) => theme.alive[index] = value);
  }

  pushAlive(value: string) {
    this.mutateTheme((theme) => theme.alive.push(value));
  }

  removeAlive(index: number) {
    this.mutateTheme((theme) => theme.alive.splice(index, 1));
  }

  get dead(): string[] {
    return this.themeService.activeTheme.dead;
  }

  setDead(index: number, value: string) {
    this.mutateTheme((theme) => theme.dead[index] = value);
  }

  pushDead(value: string) {
    this.mutateTheme((theme) => theme.dead.push(value));
  }

  removeDead(index: number) {
    this.mutateTheme((theme) => theme.dead.splice(index, 1));
  }

  get border(): boolean {
    return this.themeService.activeTheme.border;
  }

  set border(value: boolean) {
    this.mutateTheme((theme) => theme.border = value);
  }

  get borderColor(): string {
    return this.themeService.activeTheme.borderColor;
  }

  set borderColor(value: string) {
    this.mutateTheme((theme) => theme.borderColor = value);
  }

  private mutateTheme(mutateFn: (Theme) => void) {
    let theme: Theme = this.themeService.activeTheme;
    if (this.changeDetectionEnabled && !this.themeService.activeTheme.mutable) {
      let index = 0;
      let customName: string;
      do {
        index++;
        customName = theme.name + ' (' + index + ')';
      } while (this.themeService.findTheme(customName) != null);
      const customTheme = theme.clone(customName, true);
      this.themeService.addTheme(customTheme);
      theme = customTheme;
    }
    mutateFn(theme);
    this.themeService.activeTheme = theme;
  }

  trackBy(index, item) {
    return index;
  }

}
