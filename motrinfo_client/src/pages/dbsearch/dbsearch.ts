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
  isSearchList: boolean = false;
  ajaxData: any = [];
  monster_maindata: any = [];
  errorMessage: string;
  notFoundMessage: string = "К сожалению по запросу <b>{$name}</b> ничего не найдено!";
  searchType: string = "1";
  private nested_lvl :number = 0;


constructor(public navCtrl: NavController, public navParams: NavParams, private rest: MotrRestServiceProvider) {
    // If we navigated to this page, we will have an item available as a nav param
    //this.selectedItem = navParams.get('item');  
    console.log(this.navParams);
    
    this.nested_lvl = this.navParams.get('nestedLevel') != undefined ? this.navParams.get('nestedLevel') : 0;

    if(this.navParams.get('searchCaption') != undefined)
    this.searchCaption = this.navParams.get('searchCaption');

    if(this.navParams.get('searchType') != undefined)    
      this.searchType = this.navParams.get('searchType');      

    if(this.navParams.get('isSearchBar') != undefined)
      this.isSearchBar = this.navParams.get('isSearchBar');
      
    if(this.navParams.get('searchPattern') != undefined && this.nested_lvl < 2){
      this.searchPattern = this.navParams.get('searchPattern');             
    }

    if(this.navParams.get('selectedItem') != undefined && this.nested_lvl >= 2){
      this.selectedItem = this.navParams.get('selectedItem');      
    }

    
  }

  ngOnInit() { 
    if(this.nested_lvl == 1){
      this.isSearchBar = false;
      this.isSearchList = true;

      this.searchByName();      
    }
    
    if(this.nested_lvl == 2){      
      this.isSearchBar = false;
      this.isSearchList = false;

      this.searchById();      
    }
  }
  
  searchMonsterByName(monster_name) {
    this.rest.searchMonsterByName(monster_name)
       .then(
         data => {          
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
         data => {this.ajaxData = data; this.monster_maindata = this.getMonsterMainData(data.maindata)},
         error => this.errorMessage = <any>error);         
  }

  searchItemByName(item_name) {
    this.rest.searchItemByName(item_name)
       .then(
         data => this.ajaxData = data,
         error => this.errorMessage = <any>error);
  }

  getItemInfoById(item_id, itemType) {
    this.rest.getItemInfoById(itemType, item_id)
       .then(
         data => {
          if(data.length > 0)
           this.ajaxData = data;
           else
           this.errorMessage = "К сожалению по вашему запросу ничего не найдено!";
        },
         error => this.errorMessage = <any>error);
  }

  doSearch(){    
      this.itemTapped(this.searchPattern,"Поиск: "+this.searchPattern, 1);
  }

  searchByName(){                
    switch(this.searchType){
      case "1":
        this.searchMonsterByName(this.searchPattern); 
        break;

      case "2":
        this.searchItemByName(this.searchPattern);
        break;
    }    
  }

  searchById(){        
    //console.log(this.ajaxData);
    switch(this.searchType){
      case "1":
        this.getMonsterInfoById(this.selectedItem.Id); 
        break;

      case "2":
        this.getItemInfoById(this.selectedItem.Type, this.selectedItem.Id);
        break;
    }    
  }

  private getMonsterMainData(property_name: string){
    //console.log(this.ajaxData.maindata);
    this.monster_maindata = Object.keys(this.ajaxData.maindata);
    console.log(this.monster_maindata);
  }

  itemTapped(item: any, caption: string, nestedLevel: number) {    
    this.navCtrl.push(DbSearchPage, {      
      searchPattern: item,
      selectedItem: item,
      isSearchBar: this.isSearchBar,
      searchType: this.searchType,
      searchCaption: caption,
      nestedLevel: nestedLevel
    });
  }
}
