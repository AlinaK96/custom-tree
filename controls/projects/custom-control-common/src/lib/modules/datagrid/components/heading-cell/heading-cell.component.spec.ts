import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadingCellComponent } from './heading-cell.component';

describe('HeadingCellComponent', () => {
  let component: HeadingCellComponent;
  let fixture: ComponentFixture<HeadingCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeadingCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadingCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
