import { AfterViewInit, Component, ElementRef, EnvironmentInjector, HostListener, OnInit, ViewChild, ViewContainerRef, createComponent, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Entity, TEntity } from './entities/entity';
import { CommonModule } from '@angular/common';
import { ColorScheme, PlayerTokenComponent, PlayerTokenData } from './entities/player-token/player-token.component';
import { timeout } from 'rxjs';
import { EnemyTokenComponent, EnemyTokenData } from './entities/enemy-token/enemy-token.component';
import { EntityLayers } from '../encounter/game';

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
  
  public entities: Entity[] = [];
  
  @ViewChild('svg')
  public viewSvg!: ElementRef;
  
  
  constructor() {
    
    
    this.reset();
    
  }
  
  reset() {
    this.entities = [];
    this.createFullParty();
    // this.createBoss();
    
    console.log(this.entities);
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
  
  createFullParty() {
    
    const names = [
      "MT", "OT", "H1", "H2", "M1", "M2", "R1", "R2"
    ];
    
    for (let i = 0; i < 8; i++) {
      const [color, role] = i < 2 
        ? [ColorScheme.Tank, 'tank']
        : i < 4
          ? [ColorScheme.Healer, 'healer']
          : [ColorScheme.Dps, 'dps']
      
      const arc = 2 * Math.PI * (i+4) / 8;
      const r = 0.15;
          
      this.entities.unshift({
        tags: ['player', role],
        x: Math.sin(arc) * r,
        y: Math.cos(arc) * r + 0.3,
        component: PlayerTokenComponent,
        name: names[i],
        layer: EntityLayers.Player,
        data: {
          color: color,
          name: names[i]
        }
      } as TEntity<PlayerTokenData>);
    }
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
