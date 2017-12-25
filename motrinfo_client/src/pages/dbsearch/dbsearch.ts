import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MotrRestServiceProvider } from '../../providers/motr-rest-service/motr-rest-service';
//import { Http } from '@angular/http';
//import 'rxjs/add/operator/map';
//import { HttpModule } from '@angular/http';
//import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'page-dbsearch',
  templateUrl: 'dbsearch.html'
})
export class DbSearchPage {
  searchCaption = "Поиск по базе данных";
  searchPattern: string = "";
  selectedItem: any;  
  isSearchBar: boolean = true;
  ajaxData: any = [];
  errorMessage: string;
  notFoundMessage: string = "К сожалению по запросу <b>{$name}</b> ничего не найдено!";
  searchType: string = "1";


constructor(public navCtrl: NavController, public navParams: NavParams, private rest: MotrRestServiceProvider) {
    // If we navigated to this page, we will have an item available as a nav param
    //this.selectedItem = navParams.get('item');  
    console.log(this.navParams);
    
    if(this.navParams.get('searchCaption') != undefined)
    this.searchCaption = this.navParams.get('searchCaption');

    if(this.navParams.get('searchType') != undefined)    
      this.searchType = this.navParams.get('searchType');      

    if(this.navParams.get('isSearchBar') != undefined)
      this.isSearchBar = this.navParams.get('isSearchBar');
      
    if(this.navParams.get('searchPattern') != undefined){
      this.searchPattern = this.navParams.get('searchPattern');
      this.searchByName();        
    }
  }

  ngOnInit() { 
    //this.searchItemByName("Golden"); 
  }
  
  searchMonsterByName(monster_name) {
    this.rest.searchMonsterByName(monster_name)
       .then(
         data => {
          // this.ajaxData = data
           if(data.length > 0)
           this.ajaxData = data;
           else
           this.errorMessage = this.notFoundMessage.replace(/{\$name}/,monster_name);
         }
         ,
         error => this.errorMessage = <any>error);
  }

  getMonsterInfoById(monster_id) {
    this.rest.getMonsterInfoById(monster_id)
       .then(
         data => this.ajaxData = data,
         error => this.errorMessage = <any>error);
  }

  searchItemByName(item_name) {
    this.rest.searchItemByName(item_name)
       .then(
         data => this.ajaxData = data,
         error => this.errorMessage = <any>error);
  }

  getItemInfoById(item_id) {
    this.rest.getMonsterInfoById(item_id)
       .then(
         data => {
          if(data.length > 0)
           this.ajaxData = data;
           else
           this.errorMessage = "К сожалению по вашему запросу ничего не найдено!";
        },
         error => this.errorMessage = <any>error);
  }

  nextStep(){
    this.itemTapped(this.searchPattern,"Поиск: "+this.searchPattern);
  }

  searchByName(){    
    this.isSearchBar = false;
    //this.searchMonsterByName(this.searchPattern);
    switch(this.searchType){
      case "1":
        this.searchMonsterByName(this.searchPattern); 
        break;

      case "2":
        this.searchItemByName(this.searchPattern);         
        break;
    }    
  }

  itemTapped(/*event, */item, caption) {    
    this.navCtrl.push(DbSearchPage, {
      searchPattern: item,
      isSearchBar: this.isSearchBar,
      searchType: this.searchType,
      searchCaption: caption
    });
  }
}
