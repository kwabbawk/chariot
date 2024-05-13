import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Entity, TEntity } from './entities/entity';
import { CommonModule } from '@angular/common';
import { PlayerTokenComponent } from './entities/player-token/player-token.component';
import { EnemyTokenComponent, EnemyTokenData } from './entities/enemy-token/enemy-token.component';

@Component({
    selector: 'app-renderer',
    standalone: true,
    templateUrl: './renderer.component.html',
    styleUrl: './renderer.component.scss',
    imports: [FormsModule, CommonModule, PlayerTokenComponent]
})
export class RendererComponent {
  
  
  public cx = 0;
  public cy = 0;
  public visible = true;
  
  @Input()
  public entities: Entity[] = [];
  
  @ViewChild('svg')
  public viewSvg!: ElementRef;
  
  
  
  
  constructor() {
    
  }
  
  reset() {
    this.entities = [];
  }
  
  createBoss() {
    this.entities.unshift({
      x: 0,
      y: 0,
      component: EnemyTokenComponent,
      data: {
        fill: "lightgrey",
        stroke: "grey",
        size: 0.18
      }
    } as TEntity<EnemyTokenData>);
  }
  
  down($event: MouseEvent) {
    this.dragging=true;
    $event.preventDefault();
  }
  
  public dragging = false;

  @HostListener('window:mouseup', ['$event'])
  draggingMouseUp($event: MouseEvent) {
    if (!this.dragging)
        return;
      this.dragging = false;
  }
  
  @HostListener('window:mousemove', ['$event'])
  moved(e: MouseEvent) {
    if (!this.dragging)
      return;
    
    const viewRect = (this.viewSvg.nativeElement as HTMLElement).getBoundingClientRect();
    
    this.cx = this.bound(((e.x - viewRect.x) / viewRect.width) * 1.0 - 0.5, -.5, .5);
    this.cy = this.bound(((e.y - viewRect.y) / viewRect.height) * 1.0 - 0.5, -.5, .5);
  }
  
  bound(value: number, lower: number, upper: number) {
    return Math.min(Math.max(lower, value), upper);
  }
  
  
}
