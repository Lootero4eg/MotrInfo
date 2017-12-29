import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { NewsPage } from '../pages/news/news';
import { DbSearchPage } from '../pages/dbsearch/dbsearch';
import { TopsPage } from '../pages/tops/tops';

@Component({
  templateUrl: 'app.html'
})
export class motrinfo_client {
  @ViewChild(Nav) nav: Nav;
  showSubmenu:boolean = false;
  rootPage: any = HomePage;
  selectedPage: any = this.rootPage;
  selectedCustomPageNumber: number = 0;
  //rootPage: any = DbSearchPage;
  menuItemStyle: any = [];
  menuItemSelecteStyle: any = [];

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();
    
    // used for an example of ngFor and navigation
    this.pages = [      
      { title: 'Новости', component: NewsPage },
      { title: 'База знаний', component: DbSearchPage }
    ];        
    /*this.menuItemStyle={'background-color' : '#125491','color':'white'};    
    this.menuItemSelecteStyle={'background-color' : '#ff6b00','color':'white'}; */    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ShowSubMenu(){
    this.showSubmenu = !this.showSubmenu;
  }

  goToPage(pageType:number,caption: string, adParams: any){
    this.selectedCustomPageNumber = pageType;
    this.selectedPage = TopsPage;
    this.nav.setRoot(TopsPage, {
      pageType: pageType,
      pageCaption: caption,
      additionalParams: adParams
    });
  }

  checkIfSelected(page):boolean{
    if(this.selectedPage == page.component)
      return true;          
    else
      return false;
  }

  checkIfSelectedForCustom(cust_page_num):boolean{
    if(this.selectedCustomPageNumber == cust_page_num)
      return true;
    else
      return false;
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.selectedCustomPageNumber = 0;
    this.selectedPage = page.component;    
    this.nav.setRoot(page.component);
  }
}
