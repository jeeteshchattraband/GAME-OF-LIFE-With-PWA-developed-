import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sort',
  pure: false
})
export class SortPipe implements PipeTransform {

  transform(value: any, propName: string): any {
    if (value.length === 0 || propName.length === 0) {
      return value;
    }
    value.sort((v1, v2) => {
      return v1[propName].localeCompare(v2[propName]);
    });

    return value;
  }

}
