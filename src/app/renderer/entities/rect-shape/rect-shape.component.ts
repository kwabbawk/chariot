import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TEntity } from '../entity';

export interface RectShapeData {
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  fill: string;
  stroke?: string;
}

@Component({
  selector: 'app-rect-shape',
  standalone: true,
  imports: [],
  templateUrl: './rect-shape.component.html',
  styleUrl: './rect-shape.component.scss'
})
export class RectShapeComponent {
  
  @ViewChild('template', { read: TemplateRef })
  public set template(value: TemplateRef<any>) {
    setTimeout(() => this.entity.template = value, 0);
  }
  
  @Input()
  public entity!: TEntity<RectShapeData>;
  
  @Input()
  public viewSvg!: any;
  
}
