import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TEntity } from '../entity';

export interface EnemyTokenData {
  stroke: string,
  fill: string,
  size: number
}

@Component({
  selector: 'app-enemy-token',
  standalone: true,
  imports: [],
  templateUrl: './enemy-token.component.html',
  styleUrl: './enemy-token.component.scss'
})
export class EnemyTokenComponent {
  @ViewChild('template', { read: TemplateRef })
  public set template(value: TemplateRef<any>) {
    setTimeout(() => this.entity.template = value, 0);
  }
  
  @Input()
  public entity!: TEntity<EnemyTokenData>;
  
  @Input()
  public viewSvg!: any;
  
}
