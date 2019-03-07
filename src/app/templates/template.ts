import {Rle} from './rle';

export class Template {

  private rle: Rle;

  private readonly blueprint: { x: number, y: number }[];
  private readonly height: number;
  private readonly width: number;
  private cells: boolean[][];

  constructor(rle: Rle) {
    this.rle = rle;
    this.blueprint = rle.toBlueprint();
    this.height = this.determineHeight();
    this.width = this.determineWidth();
  }

  public getFileName() {
    return this.rle.getFileName();
  }

  public getName() {
    return this.rle.getName();
  }

  public getAuthor() {
    return this.rle.getAuthor();
  }

  public getComments(): string[] {
    return this.rle.getComments();
  }

  public getRule() {
    return this.rle.getRule();
  }

  public getPattern() {
    return this.rle.getPattern();
  }

  public getBoundingBox(): { x: number, y: number } {
    return this.rle.getBoundingBox();
  }

  public getCategories(): string[] {
    return this.rle.getCategories();
  }

  public getBlueprint(): { x: number, y: number }[] {
    return this.blueprint;
  }

  public getHeight() {
    return this.height;
  }

  public getWidth() {
    return this.width;
  }

  public toCells(): boolean[][] {
    if (this.cells != null) {
      return this.cells;
    }

    const cells: boolean[][] = [];
    for (let x = 0; x < this.height; x++) {
      cells[x] = [];
      for (let y = 0; y < this.width; y++) {
        cells[x][y] = false;
      }
    }
    this.blueprint.forEach((blueprintCell) => {
      cells[blueprintCell.x][blueprintCell.y] = true;
    });

    this.cells = cells;
    return cells;
  }

  private determineHeight(): number {
    let height = 0;
    this.getBlueprint().forEach((blueprintCell) => {
      if (blueprintCell.y > height) {
        height = blueprintCell.y;
      }
    });
    return height + 1;
  }

  private determineWidth(): number {
    let width = 0;
    this.getBlueprint().forEach((blueprintCell) => {
      if (blueprintCell.x > width) {
        width = blueprintCell.x;
      }
    });
    return width + 1;
  }
}


