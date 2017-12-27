import { Component } from '@angular/core';
import { NavController ,LoadingController } from 'ionic-angular';
import { MotrRestServiceProvider } from '../../providers/motr-rest-service/motr-rest-service';

@Component({
  selector: 'page-news',
  templateUrl: 'news.html'
})
export class NewsPage {
  newsData: any = [];
  errorMessage: string = "По вашему запросу ничего не найдено";
  private loading = this.loadingCtrl.create({
    content: 'Загрузка данных'
  });

  constructor(public navCtrl: NavController, private rest: MotrRestServiceProvider,public loadingCtrl: LoadingController) {
    this.loading.present();    
  }

  ngOnInit() { 
    this.getNews();
  }
  
  private getNews() {
    this.rest.getNews()
       .then(
         data => {                     
           this.newsData = data;                   
           this.loading.dismiss();
         }
         ,
         error => this.errorMessage = <any>error);
  }

  private clearNewsEntry(s: string):string{
    return s.replace(/<td.*>([\s\S]*)(<\/td>)/,"$1");
  }
}
