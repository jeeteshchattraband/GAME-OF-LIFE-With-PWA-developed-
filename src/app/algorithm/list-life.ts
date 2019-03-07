import {SortedDictionary} from './sorted-dictionary';
import {IDictionaryPair} from 'typescript-collections/dist/lib/Dictionary';
import {SortedSet} from './sorted-set';
import {OnDestroy} from '@angular/core';
import {Ticker} from './ticker';
import {GolRule} from '../templates/gol-rule';
import {Coordinate} from './coordinate';
import {Generation} from './generation';
import {Observable, Subject, Subscription} from 'rxjs';

export class ListLife implements OnDestroy {

  private tickerSubscription: Subscription;
  private cellStateSubject: Subject<Coordinate<boolean | Generation<boolean>>> = new Subject();
  private cellStateObservable: Observable<Coordinate<boolean | Generation<boolean>>> = this.cellStateSubject.asObservable();

  // key is y, set is list of alive values
  private cellDictionary: SortedDictionary<number, SortedSet<number>> =
    new SortedDictionary((a: IDictionaryPair<number, SortedSet<number>>, b: IDictionaryPair<number, SortedSet<number>>) => {
      return a.key - b.key;
  });

  private generations: SortedSet<Coordinate<Generation<boolean>>> =
    new SortedSet<Coordinate<Generation<boolean>>>(null, (c: Coordinate<any>) => {
        return c.hash();
      }
  );

  private compareSetFn = (a: number, b: number) => {
    return a - b;
  }

  constructor(private rule: GolRule, private ticker: Ticker, private maxGenerations) {
    this.tickerSubscription = ticker.getObservable().subscribe(() => {
      this.incrementGenerations();
      this.step();
    });
  }

  public setRule(rule: GolRule) {
    this.rule = rule;
  }

  public getRule(): GolRule {
    return this.rule;
  }

  public setMaxGenerations(maxGenerations: number) {
    if (this.maxGenerations !== maxGenerations) {
      if (maxGenerations === 0) {
        this.generations.forEach((genCoordinate: Coordinate<Generation<boolean>>) => {
          this.cellStateSubject.next(new Coordinate(genCoordinate.x, genCoordinate.y, false));
          this.generations.remove(genCoordinate);
        });
      } else if (this.maxGenerations === 0) {
        this.cellDictionary.forEach((y: number, xCells: SortedSet<number>) => {
          xCells.forEach((x: number) => {
            this.generations.add(new Coordinate(x, y, new Generation(true)));
          });
        });
      }
    }
    this.maxGenerations = maxGenerations;
  }

  public getCellStateObservable(): Observable<Coordinate<boolean | Generation<boolean>>> {
    return this.cellStateObservable;
  }

  public setCells(offsetX: number, offsetY: number, blueprint: {x: number, y: number}[]): void {
    blueprint.forEach((cell: {x: number, y: number}) => {
      const x = cell.x + offsetX;
      const y = cell.y + offsetY;
      this.cellDictionary.getOptionalValue(y).orElse(() => {
        const set: SortedSet<number> = new SortedSet(this.compareSetFn);
        this.cellDictionary.setValue(y, set);
        return set;
      }).add(x);
      this.emitChange(x, y, true);
    });
  }

  public reset(): void {
    this.cellDictionary.forEach((y: number, xCells: SortedSet<number>) => {
      xCells.forEach((x: number) => {
        this.cellStateSubject.next(new Coordinate(x, y, false));
      });
      this.cellDictionary.remove(y);
    });
    this.generations.forEach((genCoordinate: Coordinate<Generation<boolean>>) => {
      this.cellStateSubject.next(new Coordinate(genCoordinate.x, genCoordinate.y, false));
      this.generations.remove(genCoordinate);
    });
  }

  public toggleCell(x: number, y: number): void {
    const xCells: SortedSet<number> = this.cellDictionary.getOptionalValue(y).orElse(() => {
      const set: SortedSet<number> = new SortedSet(this.compareSetFn);
      this.cellDictionary.setValue(y, set);
      return set;
    });
    xCells.has(x) ? xCells.remove(x) : xCells.add(x);
    this.emitChange(x, y, xCells.has(x));
  }

  public state(x: number, y: number): boolean|Generation<boolean> {
    if (this.maxGenerations > 0) {
      const genState = this.generations.getByHash(Coordinate.makeHash(x, y));
      if (genState != null) {
        return genState.value;
      }
    }

    let alive = false;
    const xCells: SortedSet<number> = this.cellDictionary.getValue(y);
    if (xCells != null) {
      alive = xCells.has(x);
    }
    return alive;

  }

  private step(): void {
    // Add missing neighbour sets
    this.cellDictionary.keys().forEach((y: number) => {
      if (this.cellDictionary.getValue(y).size() !== 0) {
        const aboveNeighbour = y - 1;
        const middleNeighbour = y;
        const belowNeighbour = y + 1;

        for (y = aboveNeighbour; y <= belowNeighbour; y++) {

          this.cellDictionary.getOptionalValue(aboveNeighbour).orElse(() => {
            const set: SortedSet<number> = new SortedSet(this.compareSetFn);
            this.cellDictionary.setValue(aboveNeighbour, set);
            return set;
          });
          this.cellDictionary.getOptionalValue(middleNeighbour).orElse(() => {
            const set: SortedSet<number> = new SortedSet(this.compareSetFn);
            this.cellDictionary.setValue(middleNeighbour, set);
            return set;
          });
          this.cellDictionary.getOptionalValue(belowNeighbour).orElse(() => {
            const set: SortedSet<number> = new SortedSet(this.compareSetFn);
            this.cellDictionary.setValue(belowNeighbour, set);
            return set;
          });
        }
      }
    });

    let nextToDictionary: [number, SortedSet<number>] = null;

    this.cellDictionary.keys().forEach((y: number) => {

      const prevCells: SortedSet<number> = this.cellDictionary.getOptionalValue(y - 1).orElse(() => new SortedSet(this.compareSetFn));
      const currCells: SortedSet<number> = this.cellDictionary.getOptionalValue(y).orElse(() => new SortedSet(this.compareSetFn));
      const nextCells: SortedSet<number> = this.cellDictionary.getOptionalValue(y + 1).orElse(() => new SortedSet(this.compareSetFn));

      const prevIterator: Iterator<number> = prevCells.iterator();
      let prevX: IteratorResult<number> = prevIterator.next();
      const currIterator: Iterator<number> = currCells.iterator();
      let currX: IteratorResult<number> = currIterator.next();
      const nextIterator: Iterator<number> = nextCells.iterator();
      let nextX: IteratorResult<number> = nextIterator.next();

      const cells: SortedSet<number> = new SortedSet(this.compareSetFn);

      while (!prevX.done || !currX.done || !nextX.done) {

        let x = Math.min(prevX.done ? Infinity : prevX.value,
                         currX.done ? Infinity : currX.value,
                         nextX.done ? Infinity : nextX.value);
        if (prevX.value === x) {
          prevX = prevIterator.next();
        }
        if (currX.value === x) {
          currX = currIterator.next();
        }
        if (nextX.value === x) {
          nextX = nextIterator.next();
        }
        // Check block to left, current block and block to right
        const leftNeighbour = x - 1;
        const rightNeighbour = x + 1;
        for (x = leftNeighbour; x <= rightNeighbour; x++) {
          if (cells.has(x)) {
            continue;
          }
          const alive: boolean = this.calculateLife(prevCells.has(x - 1), prevCells.has(x), prevCells.has(x + 1),
                                                    currCells.has(x - 1), currCells.has(x), currCells.has(x + 1),
                                                    nextCells.has(x - 1), nextCells.has(x), nextCells.has(x + 1));
          if (alive) {
            cells.add(x);
          }

          if (alive !== currCells.has(x)) {
            this.emitChange(x, y, alive);
          }
        }
      }

      if (nextToDictionary != null) {
        this.cellDictionary.setValue(nextToDictionary[0], nextToDictionary[1]);
      }

      nextToDictionary = [y, cells];
    });

    if (nextToDictionary != null) {
      this.cellDictionary.setValue(nextToDictionary[0], nextToDictionary[1]);
      nextToDictionary = null;
    }

    // TODO: This might be faster if removed in a lot of cases
    // Garbage collection
    this.cellDictionary.removeIf((cells: SortedSet<number>) => {
      return cells.size() === 0;
    });
  }

  private emitChange(x: number, y: number, alive: boolean) {
    if (this.maxGenerations > 0) {
      let genCoordinate = this.generations.getByHash(Coordinate.makeHash(x, y));
      if (genCoordinate == null) {
        genCoordinate = new Coordinate<Generation<boolean>>(x, y, new Generation(alive));
        this.generations.add(genCoordinate);
      } else {
        genCoordinate.value.value = alive;
      }
      this.cellStateSubject.next(genCoordinate);
    } else {
      this.cellStateSubject.next(new Coordinate<boolean>(x, y, alive));
    }
  }

  private incrementGenerations(): void {
    this.generations.forEach((genCoordinate: Coordinate<Generation<boolean>>) => {
      genCoordinate.value.increment();
      this.cellStateSubject.next(genCoordinate);
      if (!genCoordinate.value.value && genCoordinate.value.generation > this.maxGenerations) {
        this.generations.remove(genCoordinate);
      }
    });
  }

  private calculateLife(... cellBlock: boolean[]): boolean {
    const middleCell: boolean = cellBlock[4];
    // Don't count middle cell
    let neighbours = middleCell ? -1 : 0;
    cellBlock.forEach((n: boolean) => neighbours += n ? 1 : 0);

    return this.rule.isAliveNextGeneration(middleCell, neighbours);
  }

  ngOnDestroy(): void {
    this.tickerSubscription.unsubscribe();
  }

}
