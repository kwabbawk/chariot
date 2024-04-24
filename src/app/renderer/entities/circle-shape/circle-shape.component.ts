import { Component } from '@angular/core';
import { BaseEntityComponent } from '../base-entity/base-entity.component';

export interface CircleConfig {
  radius: number;
  stroke: string;
  fill: string;
}

@Component({
  selector: 'app-circle-shape',
  standalone: true,
  imports: [],
  templateUrl: './circle-shape.component.html',
  styleUrl: './circle-shape.component.scss'
})
export class CircleShapeComponent extends BaseEntityComponent<CircleConfig> {
  
}
