import { Component } from '@angular/core';
import { BaseEntityComponent } from '../base-entity/base-entity.component';
import { CommonModule } from '@angular/common';

export interface LimitCutConfig {
  number: number;
}

@Component({
  selector: 'app-limit-cut-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './limit-cut-icon.component.html',
  styleUrl: './limit-cut-icon.component.scss'
})
export class LimitCutIconComponent extends BaseEntityComponent<LimitCutConfig> {
  
  public getLcPositions(n: number): {x: number, y: number}[] {
    switch(+n) {
      case 1: 
        return [{x: 0, y: 0}];
      case 2: 
        return [{x: -0.01, y: 0}, {x: 0.01, y: 0}];
      case 3: 
        return [{x: 0, y: -0.01},{x: -0.01, y: 0.01}, {x: 0.01, y: 0.01}];
      case 4: 
        return [{x: -0.01, y: -0.01}, {x: 0.01, y: -0.01}, {x: -0.01, y: 0.01}, {x: 0.01, y: 0.01}];
      default:
        return [];
    }
  }
  
  
}
