import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { motrinfo_client } from './app.component';
import { NewsPage } from '../pages/news/news';
import { DbSearchPage } from '../pages/dbsearch/dbsearch';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//import { Http } from '@angular/http';
import { HttpModule } from '@angular/http';
//import { HttpClientModule } from '@angular/common/http';
import { MotrRestServiceProvider } from '../providers/motr-rest-service/motr-rest-service'; 

@NgModule({
  declarations: [
    motrinfo_client,
    NewsPage,
    DbSearchPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(motrinfo_client),        
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    motrinfo_client,
    NewsPage,
    DbSearchPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},    
    //HttpClientModule,
    MotrRestServiceProvider
  ]
})
export class AppModule {}
