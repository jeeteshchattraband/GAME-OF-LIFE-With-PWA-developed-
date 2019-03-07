import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {GameOfLifeService} from 'app/game-of-life.service';
import {Template} from '../templates/template';
import {ConfigService} from '../config/config.service';
import {GameBoardConfig} from '../config/game-board-config';
import {ConfigType} from '../config/config-type';
import {GameBoardStyleConfig} from '../config/game-board-style-config';
import {Coordinate} from '../algorithm/coordinate';
import {Generation} from '../algorithm/generation';
import {merge, Subscription} from 'rxjs';
import {Line} from '../algorithm/line';
import {WindowService} from "../window.service";

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input()
  private preview = false;

  @Input()
  private template: Promise<Template>;

  @Input()
  private fullScreen = false;

  @ViewChild('golCanvas') canvasRef: ElementRef;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private mouseDown = false;
  private lastSelectedCell: { x: number, y: number } = null;

  private gbConfig: GameBoardConfig;
  private gbStyleConfig: GameBoardStyleConfig;

  private cellStateSubscription: Subscription;
  private gameBoardConfigSubscription: Subscription;
  private windowSizeSubscription: Subscription;

  constructor(private gameOfLifeService: GameOfLifeService,
              private windowService: WindowService,
              private configService: ConfigService) {
  }

  ngOnInit() {
    this.gbConfig = <GameBoardConfig>this.configService.getConfig(ConfigType.GAME_BOARD);
    this.gbStyleConfig = <GameBoardStyleConfig>this.configService.getConfig(ConfigType.GAME_BOARD_STYLE);
  }

  ngAfterViewInit() {
    this.initCanvas();
    this.canvasFillContainer();

    this.drawWorld();
    this.cellStateSubscription = this.gameOfLifeService.getCellStateObservable().subscribe(
      (cell: Coordinate<boolean | Generation<boolean>>) => {
        if (cell.x < this.gbConfig.columns + this.gbConfig.xScreenOffset && cell.y < this.gbConfig.rows + this.gbConfig.yScreenOffset) {
          let alive: boolean;
          let generation: number;
          if (typeof (cell.value) === 'boolean') {
            alive = cell.value;
            generation = null;
          } else {
            alive = cell.value.value;
            generation = cell.value.generation;
          }
          this.drawCell(
            cell.x - this.gbConfig.xScreenOffset,
            cell.y - this.gbConfig.yScreenOffset,
            alive,
            generation
          );
        }
      }
    );

    this.gbConfig.refreshable = false;
    if (this.template != null) {
      this.template.then((template: Template) => {
        this.canvasFillContainer();
        this.canvasFitToBoundingBox(template.getBoundingBox());
        this.drawWorld();
        this.gameOfLifeService.applyTemplate(
          template,
          this.gbConfig.columns,
          this.gbConfig.rows
        );
        this.gbConfig.refreshable = true;
      });
    } else {
      this.gameOfLifeService.clearTemplate();
    }

    this.gameBoardConfigSubscription = merge(this.gbConfig.observe, this.gbStyleConfig.observe).subscribe(() => {
      this.canvasFillContainer();
      this.drawWorld();
    });

    this.windowSizeSubscription = this.windowService.sizeChanges().subscribe(() => this.onScreenResize());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fullScreen'] != null && !changes['fullScreen'].firstChange
      && changes['fullScreen'].currentValue !== changes['fullScreen'].previousValue) {
      this.onScreenResize();
    }
  }

  onScreenResize() {
    this.canvasFillContainer();
    this.drawWorld();
  }

  initCanvas() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d');
  }

  private canvasFillContainer() {
    this.gbConfig.silent = true;
    this.canvas.style.height = '100%';
    this.canvas.style.width = '100%';
    this.gbConfig.screenSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.canvas.style.height = this.gbConfig.height + 'px';
    this.canvas.height = this.gbConfig.height;
    this.canvas.style.width = this.gbConfig.width + 'px';
    this.canvas.width = this.gbConfig.width;
    this.gbConfig.silent = false;
  }

  canvasFitToBoundingBox(boundingBox: { x: number, y: number }) {
    this.gbConfig.silent = true;
    const maxZoom = 10;
    this.gbConfig.zoom =
      Math.floor(
        Math.min((this.gbConfig.width / boundingBox.x) - this.gbConfig.cellSpace,
          (this.gbConfig.height / boundingBox.y) - this.gbConfig.cellSpace,
          maxZoom)
      );
    this.gbConfig.xScreenOffset = 0;
    this.gbConfig.yScreenOffset = 0;
    this.gbConfig.silent = false;
  }

  drawWorld() {
    this.gbConfig.silent = true;

    // Fill background
    this.ctx.fillStyle = this.gbStyleConfig.borderColor;
    this.ctx.fillRect(0, 0, this.gbConfig.width, this.gbConfig.height);

    for (let x = 0; x < this.gbConfig.columns; x++) {
      for (let y = 0; y < this.gbConfig.rows; y++) {
        const cellState: boolean | Generation<boolean> = this.gameOfLifeService.state(
          x + this.gbConfig.xScreenOffset,
          y + this.gbConfig.yScreenOffset
        );
        if (typeof (cellState) === 'boolean') {
          this.drawCell(x, y, cellState, null);
        } else {
          this.drawCell(x, y, cellState.value, cellState.generation);
        }
      }
    }
    this.gbConfig.silent = false;
  }

  drawCell(x: number, y: number, alive: boolean, generation: number) {
    const rectX = this.gbConfig.cellSpace + (this.gbConfig.cellSpace * x) + (this.gbConfig.cellSize * x);
    const rectY = this.gbConfig.cellSpace + (this.gbConfig.cellSpace * y) + (this.gbConfig.cellSize * y);
    const rectW = this.gbConfig.cellSize;
    const rectH = this.gbConfig.cellSize;
    const aliveColor = this.gbStyleConfig.aliveCellColors[
      Math.min(generation == null ? this.gbStyleConfig.aliveCellColors.length - 1 : generation,
        this.gbStyleConfig.aliveCellColors.length - 1)
      ];
    const baseDeadColor = this.gbStyleConfig.deadCellColors[this.gbStyleConfig.deadCellColors.length - 1];
    const deadColor = this.gbStyleConfig.deadCellColors[
      Math.min(generation == null ? this.gbStyleConfig.deadCellColors.length - 1 : generation,
        this.gbStyleConfig.deadCellColors.length - 1)
      ];
    this.ctx.clearRect(rectX, rectY, rectW, rectH);
    this.ctx.fillStyle = baseDeadColor;
    this.ctx.fillRect(rectX, rectY, rectW, rectH);
    if (alive) {
      this.ctx.fillStyle = aliveColor;
    } else {
      this.ctx.fillStyle = deadColor;
    }
    this.ctx.fillRect(rectX, rectY, rectW, rectH);
  }

  toggleCell(cell: { x: number, y: number }) {
    const toggleCellFn = (x, y) => this.gameOfLifeService.toggleCell(x + this.gbConfig.xScreenOffset, y + this.gbConfig.yScreenOffset);
    if (this.cellMissed(cell)) {
      Line.draw(
        this.lastSelectedCell.x, this.lastSelectedCell.y,
        cell.x, cell.y,
        toggleCellFn);
    } else {
      toggleCellFn(cell.x, cell.y);
    }

    this.lastSelectedCell = cell;
  }

  private cellMissed(cell: { x: number, y: number }): boolean {
    return this.lastSelectedCell
      && (Math.abs(this.lastSelectedCell.x - cell.x) > 1 || Math.abs(this.lastSelectedCell.y - cell.y) > 1);
  }

  onCanvasEntered() {
    if (!this.preview) {
      return;
    }
    this.gameOfLifeService.startGame();

    return false;
  }

  onCanvasMouseUp(event: MouseEvent) {
    this.mouseDown = false;
    this.lastSelectedCell = null;

    return false;
  }

  onCanvasExited() {
    if (!this.preview) {
      this.mouseDown = false;
      return;
    }
    this.gameOfLifeService.clear();
    this.template.then((template: Template) => {
      this.gameOfLifeService.applyTemplate(template, this.gbConfig.columns, this.gbConfig.rows);
    });

    return false;
  }

  onCanvasMouseDown(event: MouseEvent) {
    if (this.preview) {
      return;
    }
    this.toggleCell(this.getSelectedCell(event));
    this.mouseDown = true;

    return false;
  }

  onCanvasMouseMove(event: MouseEvent) {
    if (this.mouseDown) {
      const cell: { x: number, y: number } = this.getSelectedCell(event);
      if (cell.x !== this.lastSelectedCell.x || cell.y !== this.lastSelectedCell.y) {
        this.toggleCell(cell);
      }
    }

    return false;
  }

  private getSelectedCell(event: MouseEvent): { x: number, y: number } {
    let posX = 0;
    let posY = 0;

    if (event.pageX || event.pageY) {
      posX = event.pageX;
      posY = event.pageY;
    } else if (event.clientX || event.clientY) {
      posX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    let element: HTMLElement = <HTMLElement>event.target;
    let left = 0;
    let top = 0;
    while (element.offsetParent) {
      left += element.offsetLeft;
      top += element.offsetTop;
      element = <HTMLElement>element.offsetParent;
    }

    const x = Math.ceil(((posX - left) / (this.gbConfig.cellSize + this.gbConfig.cellSpace)) - 1);
    const y = Math.ceil(((posY - top) / (this.gbConfig.cellSize + this.gbConfig.cellSpace)) - 1);

    return {x: x, y: y};
  };

  ngOnDestroy(): void {
    if (this.cellStateSubscription != null) {
      this.cellStateSubscription.unsubscribe();
    }
    if (this.cellStateSubscription != null) {
      this.gameBoardConfigSubscription.unsubscribe();
    }
  }

}
