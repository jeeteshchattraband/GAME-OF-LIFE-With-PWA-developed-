import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Author} from './author';
import {Cacheable} from 'ngx-cacheable';
import {Rule} from './rule';
import {Category} from './category';

@Injectable()
export class TypeaheadService {

  private AUTHOR_DATA = 'assets/parsed-authors.json';
  private CATEGORY_DATA = 'assets/parsed-categories.json';
  private RULE_DATA = 'assets/parsed-rules.json';


  private VALID_TAGS: Tag[] = [
    {
      key: 'author',
      type: TagType.TYPE_AHEAD
    },
    {
      key: 'category',
      type: TagType.DROP_DOWN
    },
    {
      key: 'pattern',
      type: TagType.TEXT
    },
    {
      key: 'rule',
      type: TagType.DROP_DOWN
    },
    {
      key: 'title',
      type: TagType.TEXT
    }
  ];

  private TAG_KEYS: string[] = this.VALID_TAGS.map(t => t.key);

  constructor(private http: HttpClient) {
  }

  getTagKeys(): string[] {
    return this.TAG_KEYS;
  }

  getTagType(key: string): TagType {
    return this.VALID_TAGS.find(t => t.key === key).type;
  }

  @Cacheable()
  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.AUTHOR_DATA);
  }

  @Cacheable()
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.CATEGORY_DATA);
  }


  @Cacheable()
  getRules(): Observable<Rule[]> {
    return this.http.get<Rule[]>(this.RULE_DATA);
  }

}

interface Tag {
  key: string;
  type: TagType;
}

export enum TagType {
  TYPE_AHEAD,
  DROP_DOWN,
  TEXT
}

