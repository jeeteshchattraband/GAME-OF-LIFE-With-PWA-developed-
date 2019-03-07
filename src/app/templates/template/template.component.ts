import {Component, Input, OnInit} from '@angular/core';
import {Template} from '../template';
import {GameOfLifeService} from '../../game-of-life.service';
import {Router} from '@angular/router';
import {ConfigService} from '../../config/config.service';
import {TemplatesService} from '../templates.service';
import {ThemeService} from '../../config/theme.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
  providers: [GameOfLifeService, ConfigService, ThemeService]
})
export class TemplateComponent implements OnInit {

  private templatePromise: Promise<Template> = new Promise<Template>((resolve) => resolve(this.template));

  @Input()
  templateWrapper = true;

  @Input()
  preview = true;

  @Input()
  private template: Template;

  @Input()
  private rleFile: string;

  @Input()
  private theme = 'Preview';

  @Input()
  loadingText = 'Loading...';

  private showDetails = false;

  constructor(private gol: GameOfLifeService,
              private templatesService: TemplatesService,
              private router: Router,
              private configService: ConfigService,
              private themeService: ThemeService) {
  }

  ngOnInit(): void {
    if (this.rleFile != null) {
      this.templatePromise = this.templatesService.getTemplate(this.rleFile).toPromise();
      this.templatePromise.then((template: Template) => {
        this.template = template;
      });
    }
    this.themeService.activeTheme = this.themeService.findTheme(this.theme);
  }

  public isShowDetails(): boolean {
    return this.showDetails;
  }

  public toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  public getTemplate(): Template {
    return this.template;
  }

  public getTemplatePromise(): Promise<Template> {
    return new Promise<Template>((resolve) => resolve(this.template));
  }

}
