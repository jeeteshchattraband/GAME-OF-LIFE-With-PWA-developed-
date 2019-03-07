import {Component, OnDestroy, OnInit} from '@angular/core';
import {TemplatesService} from './templates.service';
import {BehaviorSubject, combineLatest, interval, Subscription} from 'rxjs';
import {TemplateQuery} from './search/template-query';
import {ViewMode} from './view-mode-button/view-mode.enum';
import {delay, delayWhen, mergeMap} from 'rxjs/operators';
import {QueryProcessor} from './query-processor';
import {ConfigService} from '../config/config.service';
import {TemplatesConfig} from '../config/templates-config';
import {ConfigType} from '../config/config-type';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit, OnDestroy {

  private templatesConfig: TemplatesConfig = <TemplatesConfig>this.configService.getConfig(ConfigType.TEMPLATES);
  private _updatingPage$ = new BehaviorSubject(false);
  updatingPage$ = this._updatingPage$.pipe(delayWhen(v => v ? interval(0) : interval(500)));
  private query$ = new BehaviorSubject<TemplateQuery>(null);
  filteredTemplates$ = combineLatest(this.templatesService.getTemplates(), this.query$)
    .pipe(
      delay(50),
      mergeMap(([templates, query]) => QueryProcessor.process(templates, query).pipe(delay(50))));
  wideViewMode = this.templatesConfig.viewMode === ViewMode.WIDE;
  theme = this.templatesConfig.theme;
  configSubscription: Subscription;

  constructor(private templatesService: TemplatesService,
              private configService: ConfigService) {
  }

  ngOnInit() {
    this.configSubscription = this.templatesConfig.observe.subscribe(() => {
      this.onConfigChange();
    });
  }

  queryChanged(templateQuery: TemplateQuery) {
    this.query$.next(templateQuery);
  }

  toTemplatesTop() {
    window.scroll(0, 0);
  }

  private onConfigChange() {
    this._updatingPage$.next(true);
    this.wideViewMode = this.templatesConfig.viewMode === ViewMode.WIDE;
    this.theme = this.templatesConfig.theme;
    this._updatingPage$.next(false);
  }

  get page(): number {
    return this.templatesService.page;
  }

  set page(value) {
    this.templatesService.page = value;
  }

  ngOnDestroy(): void {
    this.configSubscription.unsubscribe();
  }

}
