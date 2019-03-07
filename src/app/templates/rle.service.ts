import {Injectable} from '@angular/core';
import {Rle} from './rle';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Cacheable} from 'ngx-cacheable';
import {ArrayUtil} from '../algorithm/array-util';

@Injectable()
export class RleService {

  private RLE_DATA = 'assets/parsed-rle-data.json';

  constructor(private http: HttpClient) {
  }

  @Cacheable()
  public getRles(): Observable<Rle[]> {
    return this.http.get<any>(this.RLE_DATA).pipe(
      map(rleData => rleData.map(datum => new Rle(datum))),
      map(rleData => ArrayUtil.shuffle(rleData))
    );
  }

}
