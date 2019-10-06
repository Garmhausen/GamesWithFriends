import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../_models';
import { AuthService } from '../_services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  me: User;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    // this.authService.me().pipe(first()).subscribe(response => {
    //   this.me = response;
    // })
  }

}
