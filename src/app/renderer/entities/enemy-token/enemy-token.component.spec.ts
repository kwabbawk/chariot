import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnemyTokenComponent } from './enemy-token.component';

describe('EnemyTokenComponent', () => {
  let component: EnemyTokenComponent;
  let fixture: ComponentFixture<EnemyTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnemyTokenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnemyTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
