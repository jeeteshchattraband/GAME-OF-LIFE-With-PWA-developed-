import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {TagType, TypeaheadService} from '../typeahead.service';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, of} from 'rxjs';
import {Author} from '../author';
import {Category} from '../category';
import {Rule} from '../rule';

@Component({
  selector: 'app-input-badge',
  templateUrl: './input-badge.component.html',
  styleUrls: ['./input-badge.component.css']
})
export class InputBadgeComponent implements OnInit, AfterViewInit {

  @Input()
  tag: FormGroup;
  @Input()
  active = true;
  @Output()
  complete = new EventEmitter<FormGroup>();
  @Output()
  remove = new EventEmitter<FormGroup>();
  @ViewChild('typeahead')
  typeahead: NgbTypeahead;
  @ViewChild('tagInput')
  tagElementRef: ElementRef;
  tagType = TagType;

  private enterKey = 13;

  constructor(private typeaheadService: TypeaheadService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.tag.get('active').value) {
      this.tagElementRef.nativeElement.focus();
    }
  }

  keyPressed($event: KeyboardEvent) {
    if ($event.keyCode === this.enterKey) {
      this.tag.get('active').patchValue(false);
      this.complete.next(this.tag);
    }
  }

  removeTag() {
    this.remove.next(this.tag);
  }

  getItems(decorator: (items$: Observable<any[]>) => Observable<any[]>) {
    switch (this.tag.get('key').value) {
      case 'author':
        return decorator(this.typeaheadService.getAuthors());
      case 'category':
        return decorator(this.typeaheadService.getCategories());
      case 'rule':
        return decorator(this.typeaheadService.getRules());
      default:
        return decorator(of([]));
    }
  }

  dropdownItems(): Observable<{ value: string, display: string }[]> {
    return this.getItems(
      (items$: Observable<any[]>) => {
        switch (this.tag.get('key').value) {
          case 'author':
            return items$.pipe(map((authors: Author[]) => authors.map(author => {
              return {
                value: author.display,
                display: author.display + ' (' + author.count + ')'
              };
            })));
          case 'category':
            return items$.pipe(map((categories: Category[]) => categories.map(category => {
              return {
                value: category.name,
                display: category.name + ' (' + category.count + ')'
              };
            })));
          case 'rule':
            return items$.pipe(map((rules: Rule[]) => rules.map(rule => {
              return {
                value: rule.name,
                display: rule.name + ' (' + rule.count + ')'
              };
            })));
          default:
            return items$;
        }
      }
    );
  }

  autoComplete = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    return this.getItems(
      (items$: Observable<any[]>) => {
        switch (this.tag.get('key').value) {
          case 'author':
            return debouncedText$.pipe(
              switchMap(term => items$.pipe(
                map((authors: Author[]) => authors
                  .map(author => author.display)
                  .filter(author => !term || author.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)))));
          case 'category':
            return debouncedText$.pipe(
              switchMap(term => items$.pipe(
                map((categories: Category[]) => categories
                  .map(category => category.name)
                  .filter(category => !term || category.indexOf(term.toLowerCase()) > -1)))));
          case 'rule':
            return debouncedText$.pipe(
              switchMap(term => items$.pipe(
                map((rules: Rule[]) => rules
                  .map(rule => rule.name)
                  .filter(name => !term || name.indexOf(term) > -1)))));
          default:
            return text$.pipe(
              map(() => [])
            );
        }
      }
    );
  }

}
