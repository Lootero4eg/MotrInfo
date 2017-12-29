import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { motrinfo_client } from './app.component';
import { HomePage } from '../pages/home/home';
import { NewsPage } from '../pages/news/news';
import { DbSearchPage } from '../pages/dbsearch/dbsearch';
import { TopsPage } from '../pages/tops/tops';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpModule } from '@angular/http';
import { MotrRestServiceProvider } from '../providers/motr-rest-service/motr-rest-service'; 

@NgModule({
  declarations: [
    motrinfo_client,
    HomePage,
    NewsPage,
    DbSearchPage,
    TopsPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(motrinfo_client),            
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    motrinfo_client,
    HomePage,
    NewsPage,
    DbSearchPage,
    TopsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},        
    MotrRestServiceProvider    
  ]
})
export class AppModule {}
