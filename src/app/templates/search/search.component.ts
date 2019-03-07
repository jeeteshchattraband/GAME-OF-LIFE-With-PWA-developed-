import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {Observable, Subject, Subscription} from 'rxjs';
import {TemplateQuery} from './template-query';
import {TypeaheadService} from './typeahead.service';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {SaveSearchService} from './save-search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {

  private tagRegex = new RegExp('(' + this.typeaheadService.getTagKeys().join('|') + '*):', 'ig');

  @Output()
  query = new EventEmitter<TemplateQuery>();
  @Input()
  loading = false;

  @ViewChild('searchBox')
  searchBox: ElementRef;
  @ViewChild('searchInput')
  searchInput: ElementRef;
  @ViewChild('typeahead')
  typeahead: NgbTypeahead;

  form: FormGroup;

  private formValueChanged = new Subject<void>();

  private subs: Subscription[] = [];

  constructor(private fb: FormBuilder,
              private typeaheadService: TypeaheadService,
              private saveSearchService: SaveSearchService) {
  }

  ngOnInit() {
    this.createForm();
    this.wireTagCreation();
    this.monitorFormChanges();
  }

  private createForm() {
    if (this.saveSearchService.get()) {
      this.form = this.saveSearchService.get();
      this.notifyQueryChange();
      return;
    }

    this.form = this.fb.group({
      query: null,
      tags: this.fb.array([])
    });
    this.saveSearchService.save(this.form);
  }

  private wireTagCreation() {
    this.subs.push(this.form.get('query').valueChanges.subscribe(query => {
      if (this.createTagOnMatch(query)) {
        this.typeahead.dismissPopup();
        this.form.get('query').patchValue(query.replace(this.tagRegex, ''));
      }
    }));
  }

  private monitorFormChanges() {
    this.subs.push(this.form.get('query').valueChanges.subscribe(() => this.formValueChanged.next()));
    this.subs.push(this.formValueChanged
      .pipe(debounceTime(1000))
      .subscribe(() => this.notifyQueryChange()));
    (this.form.get('tags') as FormArray).controls.forEach(t => this.monitorTagForChanges(t));
  }

  private monitorTagForChanges(tag: AbstractControl) {
    tag.get('sub').patchValue(tag.get('value').valueChanges.subscribe(() => this.formValueChanged.next()));
  }

  private notifyQueryChange() {
    this.query.next(Object.assign({}, this.form.value));
  }

  private createTagOnMatch(query: string): boolean {
    let tagCreated = false;
    let expressionResult;

    do {
      expressionResult = this.tagRegex.exec(query);
      if (expressionResult) {
        const key = expressionResult[1].toLowerCase();
        const newTag = this.fb.group({
          id: this.nextTagId(),
          key: key,
          type: this.typeaheadService.getTagType(key),
          value: '',
          active: true,
          sub: null
        });
        this.deactivateAllTags();
        (this.form.get('tags') as FormArray).push(newTag);
        this.monitorTagForChanges(newTag);
        tagCreated = true;

      }
    } while (expressionResult);

    return tagCreated;
  }

  private nextTagId(): number {
    const ids = (this.form.get('tags') as FormArray).controls.map(c => c.value.id);
    return ids.length ? Math.max(...ids) + 1 : 0;
  }

  getActiveTags() {
    return (this.form.get('tags') as FormArray).controls.filter(c => c.get('active').value);
  }

  geInactiveTags() {
    return (this.form.get('tags') as FormArray).controls.filter(c => !c.get('active').value);
  }

  private deactivateAllTags() {
    (this.form.get('tags') as FormArray).controls.filter(c => c.get('active').patchValue(false));
  }

  tagComplete() {
    this.searchInput.nativeElement.focus();
  }

  removeTag(formGroup: FormGroup) {
    const tags = (this.form.get('tags') as FormArray);
    const tagIndex = tags.value.findIndex(t => t.id === formGroup.value.id);
    tags.controls[tagIndex].get('sub').value.unsubscribe();
    tags.removeAt(tagIndex);
    this.formValueChanged.next();
  }

  showTypeahaead() {
    this.searchInput.nativeElement.dispatchEvent(new Event('input'));
    this.searchInput.nativeElement.focus();
  }

  autoComplete = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    return debouncedText$.pipe(
      map(term => this.typeaheadService.getTagKeys()
        .filter(t => !term || t.indexOf(term.toLowerCase()) > -1)
        .map(t => t + ':')
        .slice(0, 10)));
  }

  ngOnDestroy(): void {
    (this.form.get('tags') as FormArray).controls.forEach(t => t.get('sub').value.unsubscribe());
    this.subs.forEach(s => s.unsubscribe());
  }

}
