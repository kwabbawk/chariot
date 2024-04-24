import { AfterViewChecked, Component, HostListener, Input, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Entity, TEntity } from '../entity';

export enum ColorScheme {
  Tank,
  Healer,
  Dps
}

export interface PlayerTokenData {
  color: ColorScheme;
  name: string;
}

@Component({
  selector: '[app-player-token]',
  standalone: true,
  imports: [],
  templateUrl: './player-token.component.html',
  styleUrl: './player-token.component.scss'
})
export class PlayerTokenComponent implements AfterViewChecked {
  
  public radius = 0.04;
  
  public colorLookup: { [color: string]: { stroke: string, fill: string } } = {
    [ColorScheme.Tank]: { stroke: "blue", fill: "lightblue" },
    [ColorScheme.Healer]: { stroke: "green", fill: "lightgreen" },
    [ColorScheme.Dps]: { stroke: "red", fill: "lightcoral" }
  };
  
  public dragging = false;
  
  @ViewChild('template', { read: TemplateRef })
  public set template(value: TemplateRef<any>) {
    setTimeout(() => this.entity.template = value, 0);
  }
  
  @Input()
  public entity!: TEntity<PlayerTokenData>;
  
  @Input()
  public viewSvg!: any;
  
  
  ngAfterViewChecked() {
  }
  
  
  down($event: PointerEvent) {
    this.dragging=true;
    $event.preventDefault();
  }
  
  @HostListener('window:pointerup', ['$event'])
  draggingMouseUp($event: PointerEvent) {
    if (!this.dragging)
        return;
      this.dragging = false;
  }
  
  @HostListener('window:pointermove', ['$event'])
  moved(e: PointerEvent) {
    if (!this.dragging)
      return;
    
    const viewRect = this.viewSvg.getBoundingClientRect();
    
    this.entity.x = this.bound(((e.x - viewRect.x) / viewRect.width) * 1.0 - 0.5, -.5, .5);
    this.entity.y = this.bound(((e.y - viewRect.y) / viewRect.height) * 1.0 - 0.5, -.5, .5);
  }
  
  bound(value: number, lower: number, upper: number) {
    return Math.min(Math.max(lower, value), upper);
  }
  
}
