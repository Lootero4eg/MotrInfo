import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { MotrRestServiceProvider } from '../../providers/motr-rest-service/motr-rest-service';

@Component({
  selector: 'page-dbsearch',
  templateUrl: 'dbsearch.html'
})
export class DbSearchPage {
  searchCaption = "Поиск по базе знаний";
  searchPattern: string = "";
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
  searchType: string = "1";
  loading_done: boolean = false;
  private nested_lvl :number = 0;
  private loading = this.loadingCtrl.create({
    content: 'Загрузка данных'
  });

constructor(public navCtrl: NavController, public navParams: NavParams, private rest: MotrRestServiceProvider,public loadingCtrl: LoadingController) {    
    //console.log(this.navParams);
    
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
    console.log('ngInit');
    if(this.selectedItem != undefined && this.searchType == "1")
      this.isMonsterSelected = true;
    if(this.selectedItem != undefined && this.searchType == "2")
      this.isItemSelected = true;

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

    if(this.nested_lvl == 3){      
      this.isSearchBar = false;
      this.isSearchList = false;      
      this.searchType = this.selectedItem.searchType;
      this.isItemSelected = this.selectedItem.isItemSelected;
      this.isMonsterSelected = this.selectedItem.isMonsterSelected;      

      this.searchById();      
    }
  }
  
  private searchMonsterByName(monster_name) {
    this.rest.searchMonsterByName(monster_name)
       .then(
         data => {          
           if(data.length > 0)
            this.ajaxData = data;
           else
            this.errorMessage = this.notFoundMessage.replace(/{\$name}/,monster_name);
           
           this.loading.dismiss();
         }
         ,
         error => this.errorMessage = <any>error);
  }

  private getMonsterInfoById(monster_id) {
    this.rest.getMonsterInfoById(monster_id)
       .then(
         data => {
           this.ajaxData = data; 
           this.jobExp = data.maindata['Job EXP'];
           this.loading_done = true;
           this.loading.dismiss();
        },
         error => this.errorMessage = <any>error);         
  }

  private searchItemByName(item_name) {
    this.rest.searchItemByName(item_name)
       .then(
         data => {
           this.ajaxData = data;
           this.loading.dismiss();
         },
         error => this.errorMessage = <any>error);         
  }

  private getItemInfoById(itemType, item_id) {
    this.rest.getItemInfoById(itemType, item_id)
       .then(
         data => {          
            this.ajaxData = data;
            this.description = this.convertDescrColor(data.description);
            this.loading_done = true;
            this.loading.dismiss();
        },
         error => this.errorMessage = <any>error);
  }

  doSearch(){    
      this.itemTapped(this.searchPattern,"Поиск: " + this.searchPattern, 1);
  }

  searchByName(){                      
    this.loading.present();

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
    this.loading.present();

    switch(this.searchType){
      case "1":
        this.getMonsterInfoById(this.selectedItem.Id); 
        break;

      case "2":
        this.getItemInfoById(this.selectedItem.Type, this.selectedItem.Id);
        break;
    }    
  }

  searchByInnerMonsterId(id: string, name: string){
    let item: any = [];
    item.Id = id;
    item.searchType = "1";
    item = this.setSearchingType(item.searchType, item);    
    this.itemTapped(item, name, 3);
  }
  
  searchByInnerItemId(item){    
    item.searchType = "2";
    item = this.setSearchingType(item.searchType, item);    
    this.itemTapped(item, item.Name, 3);
  }

  private setSearchingType(type_id: string, object: any): any{
    //--set all false by default
    object.isMonsterSelected = false;
    object.isItemSelected = false;
    switch(type_id){
      case "1":
        object.isMonsterSelected = true;
        break;
      case "2":
        object.isItemSelected = true;
        break;
    }

    return object;
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
    return s.replace(/ffffff/g,'355f91');    
  }

  itemTapped(item: any, caption: string, nestedLevel: number) {         
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