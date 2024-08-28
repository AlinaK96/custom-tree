import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractFilterComponent } from './abstract-filter.component';

describe('AbstractFilterComponent', () => {
  let component: AbstractFilterComponent;
  let fixture: ComponentFixture<AbstractFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbstractFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
