import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { MotrRestServiceProvider } from '../../providers/motr-rest-service/motr-rest-service';

@IonicPage()
@Component({
  selector: 'page-tops',
  templateUrl: 'tops.html',
})
export class TopsPage {
  pageCaption = "";
  segmentButtons: Array<string> = [];
  isSegmentBarVisible: boolean = true;
  segSelected:any = "";  
  topData: any = [];
  isCharactersTop: boolean = false;
  isProfessionTop: boolean = false;
  isGuildsTop: boolean = false;
  private loading = this.loadingCtrl.create({
    content: 'Загрузка данных'
  });

  professions: any = []; //--get from rest!!!
  choosedProf: number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private rest: MotrRestServiceProvider, public loadingCtrl: LoadingController) {
    this.pageCaption = this.navParams.get('pageCaption');
    
    this.segmentButtons.push("10");
    this.segmentButtons.push("50");
    this.segmentButtons.push("100");    
    this.segSelected = "10";    

    /*this.isCharactersTop = true;
    this.topData.push({position: 1, name:"Vasya pupkin", 
    class:"Ranger", baseLvl: 170,jobLvl:60, 
    image:"http://motr-online.com/images/emblems/36595.gif",
    guild:"Spill-the-blood",socialRang:150});*/

    /*this.isGuildsTop = true;
    this.topData.push({position: 1, name:"MoonRiders", 
    rate:1129, lvl: 50,
    image:"http://motr-online.com/images/emblems/1086.gif",
    members:"36/36",averageLvl: 171, exp:4294967295, GM:"zALz",
    castles:"Mersetzdeitz (gefg_cas05),Viblainn (schg_cas03),Mardol (arug_cas01)"});*/    
    this.isSegmentBarVisible = false;   
    
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
      );      
  }

  ngOnInit(){        
  }
  
  segmentButtonClicked(button: string){
    alert("Этот метод еще не готов");
  }

  getItems(event:any){

  }
}
