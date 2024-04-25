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
  draggable: boolean;
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
  
  
  down($event: MouseEvent) {
    if (!this.entity.data.draggable)
      return;
    this.dragging=true;
    $event.preventDefault();
  }
  
  touchstart($event: TouchEvent) {
    if (!this.entity.data.draggable)
      return;
    this.dragging=true;
    $event.preventDefault();
  }
  
  @HostListener('window:touchend', ['$event'])
  draggingTouchUp($event: TouchEvent) {
    if (!this.dragging)
        return;
      
    
      this.dragging = false;
  }
  
  @HostListener('window:mouseup', ['$event'])
  draggingMouseUp($event: MouseEvent) {
    if (!this.dragging)
        return;
      
    
      this.dragging = false;
  }
  
  @HostListener('window:touchmove', ['$event'])
  touchMoved(e: TouchEvent) {
    if (!this.dragging)
      return;
    
    this.move({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  }
  
  @HostListener('window:mousemove', ['$event'])
  moved(e: MouseEvent) {
    if (!this.dragging)
      return;
    
    this.move({
      x: e.x,
      y: e.y
    });
  }
  
  move(pos: {x: number, y: number}) {
    const viewRect = this.viewSvg.getBoundingClientRect();
    
    this.entity.x = this.bound(((pos.x - viewRect.x) / viewRect.width) * 1.0 - 0.5, -.5, .5);
    this.entity.y = this.bound(((pos.y - viewRect.y) / viewRect.height) * 1.0 - 0.5, -.5, .5);
  }
  
  bound(value: number, lower: number, upper: number) {
    return Math.min(Math.max(lower, value), upper);
  }
  
}
