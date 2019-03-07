import {GolRule} from './gol-rule';

export class Rle {

  private readonly fileName: string;
  private readonly name: string;
  private readonly author: string;
  private readonly pattern: string;
  private readonly rule: GolRule;
  private readonly comments: string[];
  private readonly boundingBox: { x: number, y: number };
  private readonly categories: string[];

  constructor(rleData: {
    filename: string,
    name: string,
    author: string,
    rule: string,
    comments: string[],
    boundingBox: { x: number, y: number },
    pattern: string,
    categories: string[]
  }) {
    this.fileName = rleData.filename;
    this.name = rleData.name;
    this.author = rleData.author;
    this.rule = new GolRule(rleData.rule);
    this.comments = rleData.comments;
    this.boundingBox = rleData.boundingBox;
    this.pattern = rleData.pattern;
    this.categories = rleData.categories;
  }

  public getFileName(): string {
    return this.fileName;
  }

  public getName(): string {
    return this.name;
  }

  public getAuthor(): string {
    return this.author;
  }

  public getRule(): GolRule {
    return this.rule;
  }

  public getComments(): string[] {
    return this.comments;
  }

  public getPattern(): string {
    return this.pattern;
  }

  public getBoundingBox(): { x: number, y: number } {
    return this.boundingBox;
  }

  public getCategories(): string[] {
    return this.categories;
  }

  // TODO: this can be faster.. ditch regex and do '!' last
  public toBlueprint(): { x: number, y: number }[] {
    const blueprint: { x: number, y: number }[] = [];
    const rlePattern: string = this.getPattern();
    let done = false;
    let index = 0;
    let y = 0;
    let x = -1;
    while (done !== true) {
      const subRlePattern = rlePattern.substr(index, rlePattern.length);
      if (subRlePattern[0] === '!') {
        // end of pattern
        done = true;
        continue;
      }

      const match: RegExpExecArray = /^[0-9]*(b|o|\$)/.exec(subRlePattern);
      if (match != null) {
        const part = match[0];
        let count = 1;
        if (part.length !== 1) {
          count = +part.substr(0, part.length - 1);
        }
        if (part[part.length - 1] === 'b') { // dead cell
          x = x + count;
        } else if (part[part.length - 1] === 'o') { // alive cell
          for (let i = 0; i < count; i++) {
            x++;
            blueprint.push({x: x, y: y});
          }
        } else if (part[part.length - 1] === '$') { // new line
          y = y + count;
          x = -1;
        } else {
          console.log('Parse failure: ' + subRlePattern + ' on part ' + part);
          done = true;
        }
        index = index + part.length;
      } else {
        console.log('Parse failure: ' + subRlePattern);
        done = true;
      }
    }
    return blueprint;
  }

}
