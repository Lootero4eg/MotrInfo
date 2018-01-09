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
        
    this.pages = [      
      { title: 'Новости', component: NewsPage },
      { title: 'База знаний', component: DbSearchPage }
    ];              
  }

  initializeApp() {
    this.platform.ready().then(() => {
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
    this.selectedCustomPageNumber = 0;
    this.selectedPage = page.component;    
    this.nav.setRoot(page.component);
  }
}
