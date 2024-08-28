import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowFilterCellComponent } from './row-filter-cell.component';

describe('RowFilterCellComponent', () => {
  let component: RowFilterCellComponent;
  let fixture: ComponentFixture<RowFilterCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RowFilterCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RowFilterCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
