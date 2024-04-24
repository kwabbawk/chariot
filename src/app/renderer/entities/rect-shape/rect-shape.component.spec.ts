import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RectShapeComponent } from './rect-shape.component';

describe('RectShapeComponent', () => {
  let component: RectShapeComponent;
  let fixture: ComponentFixture<RectShapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RectShapeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RectShapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
