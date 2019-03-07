import {Template} from './template';
import {TemplateQuery} from './search/template-query';
import {Observable, of} from 'rxjs';

export class QueryProcessor {

  private static minTagLength = 3;
  private static minQueryLength = 4;

  public static process(templates: Template[], templateQuery: TemplateQuery): Observable<Template[]> {
    return of(this.processSync(templates, templateQuery));
  }

  private static processSync(templates: Template[], templateQuery: TemplateQuery): Template[] {
    if (!this.allowSearch(templates, templateQuery)) {
      return templates;
    }

    const filter = templateQuery.query ? templateQuery.query.trim() : '';
    const regex: RegExp = new RegExp(filter, 'i');
    return templates.filter((template: Template) => {
      return this.titleTagMatch(template, templateQuery)
        && this.patternTagMatch(template, templateQuery)
        && this.authorTagMatch(template, templateQuery)
        && this.ruleTagMatch(template, templateQuery)
        && this.categoryTagMatch(template, templateQuery)
        && this.genericMatch(filter, regex, template);
    });
  }

  private static allowSearch(templates: Template[], templateQuery: TemplateQuery): boolean {
    return !!templates && !!templateQuery;
  }

  private static titleTagMatch(template: Template, templateQuery: TemplateQuery): boolean {
    return this.tagMatch<string>(
      templateQuery,
      'title',
      template.getName(),
      (t: string, tag: string) => t.search(new RegExp(tag, 'i')) !== -1);
  }

  private static patternTagMatch(template: Template, templateQuery: TemplateQuery): boolean {
    return this.tagMatch<string>(
      templateQuery,
      'pattern',
      template.getPattern(),
      (templateValue, tagValue) => templateValue.includes(tagValue));
  }

  private static ruleTagMatch(template: Template, templateQuery: TemplateQuery): boolean {
    return this.tagMatch<string>(
      templateQuery,
      'rule',
      template.getRule().getFormattedRuleString(),
      (templateValue, tagValue) => templateValue.includes(tagValue.toUpperCase()));
  }

  private static authorTagMatch(template: Template, templateQuery: TemplateQuery): boolean {
    return this.tagMatch<string>(
      templateQuery,
      'author',
      template.getAuthor(),
      (templateValue, tagValue) => {
        if (!templateValue) {
          return !tagValue;
        }
        let allMatch = true;
        for (const name of tagValue.split(' ').filter(v => v)) {
          if (!templateValue.toLowerCase().includes(name.toLowerCase())) {
            allMatch = false;
          }
        }
        return allMatch;
      });
  }

  private static categoryTagMatch(template: Template, templateQuery: TemplateQuery): boolean {
    return this.tagMatch<string[]>(
      templateQuery,
      'category',
      template.getCategories(),
      (templateValue, tagValue) => !!templateValue.filter(v => v.indexOf(tagValue.toLowerCase()) > -1).length);
  }

  private static tagMatch<T>(templateQuery: TemplateQuery,
                             key: string,
                             templateValue: T,
                             equalityFn: (templateValue: T, tagValue: string) => boolean): boolean {
    const tagValues = templateQuery.tags
      .filter(t => t.key === key)
      .filter(t => t.value.length >= this.minTagLength)
      .map(t => t.value.trim());
    let tagMatched: boolean = !tagValues.length;
    for (const tagValue of tagValues) {
      if (equalityFn(templateValue, tagValue)) {
        tagMatched = true;
      }
    }

    return tagMatched;
  }

  private static genericMatch(filter: string, filterRegex: RegExp, template: Template) {
    if (!filter || filter.length < this.minQueryLength) {
      return true;
    }

    if (template.getName().search(filterRegex) !== -1) {
      return true;
    }
    if (template.getAuthor() != null && template.getAuthor().search(filterRegex) !== -1) {
      return true;
    }
    if (template.getFileName().search(filterRegex) !== -1) {
      return true;
    }
    if (template.getRule().getFormattedRuleString().search(filterRegex) !== -1) {
      return true;
    }
    if (filter.toUpperCase() === template.getRule().getFormattedRuleString()) {
      return true;
    }
    if (template.getComments().join(' ').search(filterRegex) !== -1) {
      return true;
    }
    if (!!template.getCategories().filter(v => v.indexOf(filter.toLowerCase()) > -1).length) {
      return true;
    }

    return false;
  }

}
