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
  searchPattern: string = "zargon";
  selectedItem: any;
  isSearchBar: boolean = true;
  isSearchList: boolean = false;
  isMonsterSelected = false;
  isItemSelected = false;
  ajaxData: any = [];
  jobExp: any = null;
  description: any = null;
  errorMessage: string;
  notFoundMessage: string = "К сожалению по запросу <b>{$name}</b> ничего не найдено!";
  searchType: string = "2";
  private nested_lvl :number = 0;


constructor(public navCtrl: NavController, public navParams: NavParams, private rest: MotrRestServiceProvider) {    
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

    if(this.navParams.get('isMonsterSelected') != undefined && this.nested_lvl >= 2){
      this.isMonsterSelected = this.navParams.get('isMonsterSelected');      
    }

    if(this.navParams.get('isItemSelected') != undefined && this.nested_lvl >= 2){
      this.isItemSelected = this.navParams.get('isItemSelected');      
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
         data => {this.ajaxData = data; this.jobExp = data.maindata['Job EXP']},
         error => this.errorMessage = <any>error);         
  }

  searchItemByName(item_name) {
    this.rest.searchItemByName(item_name)
       .then(
         data => this.ajaxData = data,
         error => this.errorMessage = <any>error);
  }

  getItemInfoById(itemType, item_id) {
    this.rest.getItemInfoById(itemType, item_id)
       .then(
         data => {          
            this.ajaxData = data;
            this.description = this.convertDescrColor(data.description);
        },
         error => this.errorMessage = <any>error);
  }

  doSearch(){    
      this.itemTapped(this.searchPattern,"Поиск: " + this.searchPattern, 1);
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
    switch(this.searchType){
      case "1":
        this.getMonsterInfoById(this.selectedItem.Id); 
        break;

      case "2":
        this.getItemInfoById(this.selectedItem.Type, this.selectedItem.Id);
        break;
    }    
  }

   searchByInnerMonsterId(monster_id: string, monster_name: string){
    this.selectedItem.Id = monster_id;
    this.searchType = "1";
    this.itemTapped(this.selectedItem, monster_name, 3);//на ините сделать смену типов и ласт юзед обжект      
  }

  getMonsterNameFromLink(s: string):string{
    return s.replace(/.*d=.*>(.*?)<.*$/,'$1');
  }

  getMonsterIdFromLink(s: string):string{
    return s.replace(/.*d=(.*?)".*$/,'$1');
  }

  getMapFromLink(s: string):string{    
    return s.replace(/.*maps\/.*">(.*?)(<.*)*$/,'$1');
  }

  getSkillFromLink(s: string):string{    
    return s.replace(/.*skills\/.*">(.*?)(<.*)*$/,'$1');
  }

  convertDescrColor(s: string): string{ 
    console.log(s);
    return s.replace(/ffffff/g,'000000');
  }

  itemTapped(item: any, caption: string, nestedLevel: number) {     
    this.isMonsterSelected = false;
    this.isItemSelected = false;
    if(item.Id != undefined && this.searchType == "1")
      this.isMonsterSelected = true;
    if(item.Id != undefined && this.searchType == "2")
      this.isItemSelected = true;
    this.navCtrl.push(DbSearchPage, {      
      searchPattern: item,
      selectedItem: item,
      isSearchBar: this.isSearchBar,
      searchType: this.searchType,
      searchCaption: caption,
      nestedLevel: nestedLevel,
      isMonsterSelected: this.isMonsterSelected,
      isItemSelected: this.isItemSelected
    });
  }
}