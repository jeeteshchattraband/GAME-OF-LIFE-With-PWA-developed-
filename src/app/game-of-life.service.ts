import {Injectable, OnDestroy} from '@angular/core';
import {Template} from './templates/template';
import {Ticker} from './algorithm/ticker';
import {ListLife} from './algorithm/list-life';
import {GolRule} from './templates/gol-rule';
import {Generation} from './algorithm/generation';
import {ConfigService} from './config/config.service';
import {GameBoardStyleConfig} from './config/game-board-style-config';
import {ConfigType} from './config/config-type';
import {Subscription} from 'rxjs';

@Injectable()
export class GameOfLifeService implements OnDestroy {

  private defaultRule = new GolRule('B3/S23');
  private template: Template;

  private readonly ticker: Ticker;
  private listLife: ListLife;
  private gbStyle: GameBoardStyleConfig;
  private gbStyleSubscription: Subscription;

  constructor(configService: ConfigService) {
    this.ticker = new Ticker(50);
    this.gbStyle = <GameBoardStyleConfig> configService.getConfig(ConfigType.GAME_BOARD_STYLE);
    this.listLife = new ListLife(this.defaultRule, this.ticker, this.gbStyle.maxGenerations);
    this.gbStyleSubscription = this.gbStyle.observe.subscribe(() => {
      this.listLife.setMaxGenerations(this.gbStyle.maxGenerations);
    });
  }

  public isGameStarted(): boolean {
    return this.ticker.isStarted();
  }

  public startGame() {
    this.ticker.start();
  }

  public stopGame() {
    this.ticker.stop();
  }

  public clear() {
    this.stopGame();
    this.listLife.reset();
  }

  public tick() {
    this.ticker.tick();
  }

  get delay() {
    return this.ticker.delay;
  }

  set delay(value: number) {
    this.ticker.delay = value;
  }

  state(x: number, y: number): boolean|Generation<boolean> {
    return this.listLife.state(x, y);
  }

  toggleCell(x: number, y: number) {
    this.listLife.toggleCell(x, y);
  }

  getCellStateObservable() {
    return this.listLife.getCellStateObservable();
  }

  applyTemplate(template: Template, gameboardX: number, gameboardY: number) {
    this.clear();
    this.template = template;
    this.listLife.setRule(template.getRule());
    const offsetX = Math.floor((gameboardX - template.getWidth()) / 2);
    const offsetY = Math.floor((gameboardY - template.getHeight()) / 2);
    this.listLife.setCells(offsetX, offsetY, template.getBlueprint());
    this.template = template;
  }

  getRule() {
    return this.listLife.getRule();
  }

  setRule(golRule: GolRule) {
    this.listLife.setRule(golRule);
  }

  clearTemplate() {
    this.template = null;
  }

  refresh(gameboardX: number, gameboardY: number) {
    if (this.template != null) {
      this.applyTemplate(this.template, gameboardX, gameboardY);
    }
  }

  isRefreshable() {
    return this.template != null;
  }

  ngOnDestroy() {
    this.gbStyleSubscription.unsubscribe();
  }
}
