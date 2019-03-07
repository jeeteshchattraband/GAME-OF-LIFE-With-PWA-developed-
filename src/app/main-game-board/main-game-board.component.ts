import {Component, OnDestroy, OnInit} from '@angular/core';
import {Template} from '../templates/template';
import {TemplatesService} from '../templates/templates.service';
import {ActivatedRoute, Params} from '@angular/router';
import {ConfigService} from '../config/config.service';
import {GameBoardConfig} from '../config/game-board-config';
import {ConfigType} from '../config/config-type';

@Component({
  selector: 'app-main-game-board',
  templateUrl: './main-game-board.component.html',
  styleUrls: ['./main-game-board.component.css']
})
export class MainGameBoardComponent implements OnInit, OnDestroy {

  private template: Promise<Template>;

  private gameBoardConfig: GameBoardConfig;

  constructor(private configService: ConfigService,
              private templatesService: TemplatesService,
              private route: ActivatedRoute) {
  };

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.template = params['rle'] != null ? this.templatesService.getTemplate(params['rle']).toPromise() : null;
      }
    );

    this.gameBoardConfig = <GameBoardConfig>this.configService.getConfig(ConfigType.GAME_BOARD);
  }

  public getTemplatePromise(): Promise<Template> {
    return this.template;
  }

  public isFullScreen() {
    return this.gameBoardConfig.fullScreen;
  }

  ngOnDestroy() {
  }

}
