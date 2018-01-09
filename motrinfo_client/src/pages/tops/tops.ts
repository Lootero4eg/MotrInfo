import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { MotrRestServiceProvider } from '../../providers/motr-rest-service/motr-rest-service';
import $ from 'jquery';

@IonicPage()
@Component({
  selector: 'page-tops',
  templateUrl: 'tops.html',
})
export class TopsPage {
  pageCaption: string = "";
  pageType: any = "";
  segmentButtons: Array<string> = [];
  isSegmentBarVisible: boolean = true;
  segSelected:any = "";  
  topData: any = [];
  private _originalTopData: any = [];
  private _previousTopData: any = [];
  isCharactersTop: boolean = false;
  isProfessionTop: boolean = false;
  isGuildsTop: boolean = false;
  private loading = this.loadingCtrl.create({
    content: 'Загрузка данных'
  });
  errorMessage: string;
  searchText: string = "";

  professions: any = []; //--get from rest!!!
  choosedProf: number = 0;

  constructor(
      public navCtrl: NavController, public navParams: NavParams, 
      private rest: MotrRestServiceProvider, 
      public loadingCtrl: LoadingController, 
      public toastCtrl: ToastController) {
    console.log(this.navParams);
    this.pageCaption = this.navParams.get('pageCaption');
    this.pageType = this.navParams.get('pageType');
    
    this.controlsVisibility(false);
    switch(this.pageType){
      case 1:
        this.loading.present();
        this.isCharactersTop = true;        
        this.segmentButtons.push("10");
        this.segmentButtons.push("25");
        this.segmentButtons.push("50");
        this.segmentButtons.push("100");         
        this.isSegmentBarVisible = true;
        this.getPersonsTop();
      break;
    }   

    /*this.isCharactersTop = true;
    this.topData.push({position: 1, name:"Vasya pupkin", 
    class:"Ranger", baseLvl: 170,jobLvl:60, 
    guild_image:"http://motr-online.com/images/emblems/36595.gif",
    guild:"Spill-the-blood",socialRang:150});*/

    /*this.isGuildsTop = true;
    this.topData.push({position: 1, name:"MoonRiders", 
    rate:1129, lvl: 50,
    image:"http://motr-online.com/images/emblems/1086.gif",
    members:"36/36",averageLvl: 171, exp:4294967295, GM:"zALz",
    castles:"Mersetzdeitz (gefg_cas05),Viblainn (schg_cas03),Mardol (arug_cas01)"});*/    
    
    /*this.isSegmentBarVisible = false;   
    
    this.professions.push(
      {id:0,profname:"Все профессии"},
      {id:1,profname:"1 профессии"},
      {id:2,profname:"1 перерожденные профессии"},
      {id:3,profname:"2 профессии"},
      {id:4,profname:"2 перерожденные профессии"},
      {id:5,profname:"3 профессии"},
      {id:6,profname:"Разные профессии"},
      {id:7,profname:"Гомункулы"},
      {id:8,profname:"Беби профессии"}
    );

    this.isProfessionTop = true;
    this.topData.push(
      {proftype:1,profname:"3 профессия", professions: [
        { position:1,id:1,name:"Arch Bishop" },
        { position:2,id:2,name:"Ranger" }]}
      ,
      {proftype:2,profname:"2 перерожденные", professions: [
        { position:1,id:11,name:"Sniper" },
        { position:2,id:21,name:"Champion" }]}
      );*/      
  }

  ngOnInit(){        
  }
  
  segmentButtonClicked(button: string){
    //alert("Этот метод еще не готов");
    if(this._originalTopData != null && this._originalTopData.length>0){      
      this.topData = [];
      this._previousTopData = [];
      for(let i=0;i<+button;i++) {
        this.topData[i] = this._originalTopData[i];
      }
    }
    if(this.isFilterNeeded())
      this.getItems(null);
  }

  private getPersonsTop() {
    this.rest.getPersonsTop()
       .then(
         data => {          
           if(data.length > 0){
            //this.topData = data;
            this._originalTopData = data;
            this.segSelected = "10";
            this.segmentButtonClicked(this.segSelected);
           }
           else
            this.errorMessage = "Not found message here!";//this.notFoundMessage.replace(/{\$name}/,monster_name);
           
           this.loading.dismiss();
         }
         ,
         error => this.errorMessage = <any>error);
  }

  //--search items
  getItems(event:any){
    if(this.isFilterNeeded()){
      if(this._previousTopData.length == 0)      
        this._previousTopData = this.topData;
      //search
      let tmpArr: any = [];
      for(let i=0;i<this._previousTopData.length;i++){
        if(this._previousTopData[i].name.toLowerCase().indexOf(this.searchText.toLowerCase())>=0)
        tmpArr.push(this._previousTopData[i]);
      }
      this.topData = tmpArr;
      this.recordsMessage(this.topData.length);
    }
    else{
      if(this._previousTopData != [])
        this.topData = this._previousTopData;
    }

  }

  private isFilterNeeded(){
    return this.searchText == "" ? false : true;
  }

  private controlsVisibility(flag: boolean){
    this.isCharactersTop = flag;
    this.isGuildsTop = flag;
    this.isProfessionTop = flag;
    this.isSegmentBarVisible = flag;
  }

  private recordsMessage(cnt: number) {
    let record: string = "записей.";
    if(cnt == 1)
      record = "запись.";
    if(cnt > 1 && cnt < 5)
      record = "записи.";
    let msg: string = "Найдено " + cnt + " " + record;
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000, 
      position: 'middle'      
    });
    //toast.setPosition("middle");
    //toast.setCssClass("abcd");
    toast.present();
  }
}
