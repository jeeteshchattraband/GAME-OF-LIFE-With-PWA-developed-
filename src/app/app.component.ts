import {AfterContentInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {GameOfLifeService} from './game-of-life.service';
import {NavigationEnd, Router} from '@angular/router';
declare var ga: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(public router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }

  ngOnInit(): void {
  }


}
