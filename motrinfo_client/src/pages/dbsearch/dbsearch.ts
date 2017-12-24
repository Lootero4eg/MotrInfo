import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { HttpModule } from '@angular/http';
//import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'page-dbsearch',
  templateUrl: 'dbsearch.html'
})
export class DbSearchPage {
  selectedItem: any;
  icons: string[];
  items: Array<{title: string, note: string, icon: string}>;
  test: boolean = true;
  ajaxData: any = [];

constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    // Let's populate this page with some filler content for funzies
    /*this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    'american-football', 'boat', 'bluetooth', 'build'];

    this.items = [];
    for (let i = 1; i < 11; i++) {
      this.items.push({
        title: 'Item ' + i,
        note: 'This is item #' + i,
        icon: this.icons[Math.floor(Math.random() * this.icons.length)]
      });
  }*/

    this.http.get('http://motrinfo.000webhostapp.com/RestServer/index.php/searchByMonsterName/Eddga')
    .map(data => data.json())
    .subscribe( parsed_data => { this.ajaxData = parsed_data })
  }

  /*testAjax(){
    this.http.get('http://motrinfo.000webhostapp.com/RestServer/index.php/searchByMonsterName/Eddga')
    .map(data => data.json())
    .subscribe( parsed_data => { this.ajaxData = parsed_data })
  }*/

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(DbSearchPage, {
      item: item
    });
  }
}
