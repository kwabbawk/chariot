import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TEntity } from '../entity';

export interface CastBarData {
  label: string,
  progress: number
}

@Component({
  selector: 'app-cast-bar',
  standalone: true,
  imports: [],
  templateUrl: './cast-bar.component.html',
  styleUrl: './cast-bar.component.scss'
})
export class CastBarComponent {
  @ViewChild('template', { read: TemplateRef })
  public set template(value: TemplateRef<any>) {
    setTimeout(() => this.entity.template = value, 0);
  }
  
  @Input()
  public entity!: TEntity<CastBarData>;
  
  @Input()
  public viewSvg!: any;
  
}
