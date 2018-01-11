import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  ToastController
} from "ionic-angular";
import { MotrRestServiceProvider } from "../../providers/motr-rest-service/motr-rest-service";

@IonicPage()
@Component({
  selector: "page-tops",
  templateUrl: "tops.html"
})
export class TopsPage {
  headerImg: string = null;
  pageCaption: string = "";
  pageType: any = "";
  additionalParams: any = null;
  segmentButtons: Array<string> = [];
  isSegmentBarVisible: boolean = true;
  segSelected: any = "";
  topData: any = [];
  private _originalTopData: any = [];
  private _previousTopData: any = [];  
  private loading = this.loadingCtrl.create({
    content: "Загрузка данных"
  });
  errorMessage: string;
  searchText: string = "";
  isAnotherButtonPressed: boolean = false;
  professions: any = []; //--get from rest!!!
  choosedProf: number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private rest: MotrRestServiceProvider,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController
  ) {
    //console.log(this.navParams);
    this.headerImg = this.navParams.get("headerImg"); 
    this.pageCaption = this.navParams.get("pageCaption");
    this.pageType = this.navParams.get("pageType");
    this.additionalParams = this.navParams.get("additionalParams");    

    this.controlsVisibility(false);
    switch (this.pageType) {
      case 1://--persons list
        this.loading.present();        
        this.segmentButtons.push("10");
        this.segmentButtons.push("25");
        this.segmentButtons.push("50");
        this.segmentButtons.push("100");
        this.isSegmentBarVisible = true;
        this.getPersonsTop();
        break;

      case 2://--professions list
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
        this.topData.push(
          {proftype:1,profname:"3 профессия", professions: [
            { position:1,id:1,name:"Arch Bishop" },
            { position:2,id:2,name:"Ranger" }]}
          ,
          {proftype:2,profname:"2 перерожденные", professions: [
            { position:1,id:11,name:"Sniper" },
            { position:2,id:21,name:"Champion" }]}
          );
        break;

      case 3://--guilds list
        this.loading.present();        
        this.segmentButtons.push("10");
        this.segmentButtons.push("50");
        this.segmentButtons.push("100");
        this.segmentButtons.push("500");
        this.isSegmentBarVisible = true;
        this.getGuildsTop();
        break;

      case 4:
        this.loading.present();
        this.getGuildInfo(this.additionalParams);
        break;
    }    
  }

  ngOnInit() {}

  segmentButtonClicked(button: string) {    
    /*switch (this.pageType) {
      case 1:*/
        if (this._originalTopData != null && this._originalTopData.length > 0) {
          this.topData = [];
          this._previousTopData = [];
          for (let i = 0; i < +button; i++) {
            this.topData[i] = this._originalTopData[i];
          }          
        }
      /*break;
      
      case 3:        
        this.loading.present();
        this.topData = [];                
        this.getGuildsTop(+button);        
      break;      
    }*/
    if (this.isFilterNeeded()) this.getItems(null);
  }

  private getPersonsTop() {
    this.rest.getPersonsTop().then(data => {
      if (data.length > 0) {
        this._originalTopData = data;
        this.segSelected = "10";
        this.segmentButtonClicked(this.segSelected);
      } else this.errorMessage = "Not found message here!";

      this.loading.dismiss();
    }, error => (this.errorMessage = <any>error));
  }

  private getGuildsTop() {        
    this.rest.getGuildsTop(500).then(data => {
      if (data.length > 0) {
        this._originalTopData = data;        
        //this.topData = data;
        this.segSelected = "10";
        this.segmentButtonClicked(this.segSelected);
      } else this.errorMessage = "Not found message here!";

      this.loading.dismiss();
    }, error => (this.errorMessage = <any>error));
  }

  private getGuildInfo(gid: number) {        
    this.rest.getGuildInfo(gid).then(data => {      
        this.topData = data;      

      this.loading.dismiss();
    }, error => (this.errorMessage = <any>error));
  }

  //--search items
  getItems(event: any) {
    if (this.isFilterNeeded()) {
      if (this._previousTopData.length == 0)
        this._previousTopData = this.topData;
      //search
      let tmpArr: any = [];
      for (let i = 0; i < this._previousTopData.length; i++) {
        if (
          this._previousTopData[i].name
            .toLowerCase()
            .indexOf(this.searchText.toLowerCase()) >= 0
        )
          tmpArr.push(this._previousTopData[i]);
      }
      this.topData = tmpArr;
      this.recordsMessage(this.topData.length);
    } else {
      if (this._previousTopData != []) this.topData = this._previousTopData;
    }
  }

  guildClicked(guild_name: string, guild_id: number){
    if(!this.isAnotherButtonPressed){
      this.navCtrl.push(TopsPage, {
        pageType: 4,
        pageCaption: " Гильдия: " + guild_name,
        headerImg: `<img src='http://motr-online.com/images/emblems/${guild_id}.gif'>`,
        additionalParams: guild_id
      });    
    }
  }

  private isFilterNeeded() {
    return this.searchText == "" ? false : true;
  }

  private controlsVisibility(flag: boolean) {    
    this.isSegmentBarVisible = flag;    
  }

  private recordsMessage(cnt: number) {
    let record: string = "записей.";
    if (cnt == 1) record = "запись.";
    if (cnt > 1 && cnt < 5) record = "записи.";
    let msg: string = "Найдено " + cnt + " " + record;
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: "middle"
    });
    toast.present();
  }

  /*aal(){
    this.isAnotherButtonPressed = true;
    this.navCtrl.push(TopsPage, {
      pageType: 1,
      pageCaption: " test: ",
      headerImg: null    
    });
  }*/
}
