import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleShapeComponent } from './circle-shape.component';

describe('CircleShapeComponent', () => {
  let component: CircleShapeComponent;
  let fixture: ComponentFixture<CircleShapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircleShapeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CircleShapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
