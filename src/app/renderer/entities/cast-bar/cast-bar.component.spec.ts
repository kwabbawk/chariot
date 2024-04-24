import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastBarComponent } from './cast-bar.component';

describe('CastBarComponent', () => {
  let component: CastBarComponent;
  let fixture: ComponentFixture<CastBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CastBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
