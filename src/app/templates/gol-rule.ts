import {SortedSet} from '../algorithm/sorted-set';

export class GolRule {

  static COMMON_RULES: { name: string, rule: string }[] = [
    {name: 'Replicator', rule: 'B1357/S1357'},
    {name: 'Fredkin', rule: 'B1357/S02468'},
    {name: 'Seeds', rule: 'B2/S'},
    {name: 'Live Free or Die', rule: 'B2/S0'},
    {name: 'Life without death', rule: 'B3/S012345678'},
    {name: 'Flock', rule: 'B3/S12'},
    {name: 'Mazectric', rule: 'B3/S1234'},
    {name: 'Maze', rule: 'B3/S12345'},
    {name: 'Conway\'s Life', rule: 'B3/S23'},
    {name: '2x2', rule: 'B36/S125'},
    {name: 'HighLife', rule: 'B36/S23'},
    {name: 'Move', rule: 'B368/S245'},
    {name: 'Day & Night', rule: 'B3678/S34678'}
  ];

  survival: SortedSet<number> = new SortedSet((a: number, b: number) => {
    return a - b;
  });
  birth: SortedSet<number> = new SortedSet((a: number, b: number) => {
    return a - b;
  });

  private readonly formattedRuleString;

  constructor(private ruleString) {
    this.parseRuleString();
    this.formattedRuleString = this.toFormattedRuleString();
  }

  private parseRuleString() {
    let selectedRuleSet: SortedSet<number> = this.survival;
    for (let i = 0; i < this.ruleString.length; i++) {
      const char: string = this.ruleString[i];
      if (char >= '0' && char <= '9') {
        selectedRuleSet.add(+char);
      } else if (char === 'S' || char === 's') {
        selectedRuleSet = this.survival;
      } else if (char === 'B' || char === 'b') {
        selectedRuleSet = this.birth;
      } else if (char === '/') {
        selectedRuleSet = this.birth;
      } else {
        throw new Error('Index: ' + i + ' Unknown character: ' + char + ' on rule string: ' + this.ruleString);
      }
    }
  }

  public getRuleString() {
    return this.ruleString;
  }

  public getName() {
    const ruleString = this.getFormattedRuleString();
    const rule = GolRule.COMMON_RULES.find(r => r.rule === ruleString);
    return rule != null ? rule.name : null;
  }

  public getFormattedRuleString() {
    return this.formattedRuleString;
  }

  private toFormattedRuleString() {
    let formattedRuleString = 'B';
    this.birth.forEach((n: number) => {
      formattedRuleString += n;
    });
    formattedRuleString += '/S';
    this.survival.forEach((n: number) => {
      formattedRuleString += n;
    });
    return formattedRuleString;
  }

  public isAliveNextGeneration(currentState: boolean, neighbours: number): boolean {
    return (currentState && this.survival.has(neighbours)) || (!currentState && this.birth.has(neighbours));
  }
}
