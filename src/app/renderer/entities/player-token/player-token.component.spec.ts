import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerTokenComponent } from './player-token.component';

describe('PlayerTokenComponent', () => {
  let component: PlayerTokenComponent;
  let fixture: ComponentFixture<PlayerTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerTokenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
