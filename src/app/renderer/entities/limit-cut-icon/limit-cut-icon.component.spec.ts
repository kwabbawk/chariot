import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitCutIconComponent } from './limit-cut-icon.component';

describe('LimitCutIconComponent', () => {
  let component: LimitCutIconComponent;
  let fixture: ComponentFixture<LimitCutIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LimitCutIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LimitCutIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
