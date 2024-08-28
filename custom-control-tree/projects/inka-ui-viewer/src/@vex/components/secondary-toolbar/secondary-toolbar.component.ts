import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { map } from 'rxjs/operators';
import baselineArrowBack from '@iconify/icons-ic/baseline-arrow-back';

@Component({
  selector: 'vex-secondary-toolbar',
  templateUrl: './secondary-toolbar.component.html',
  styleUrls: ['./secondary-toolbar.component.scss']
})
export class SecondaryToolbarComponent implements OnInit {
  baselineArrowBack = baselineArrowBack;
  arr: string[] = ['/'];
  @Input() current: string;
  @Input() crumbs: string[];

  fixed$ = this.configService.config$.pipe(
    map(config => config.toolbar.fixed)
  );

  constructor(private configService: ConfigService) { }

  ngOnInit() {
  }
}
