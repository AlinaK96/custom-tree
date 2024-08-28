import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseWebComponentComponent } from './base-web-component.component';

describe('BaseWebComponentComponent', () => {
  let component: BaseWebComponentComponent;
  let fixture: ComponentFixture<BaseWebComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseWebComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
