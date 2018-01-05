import { Http, Response, Headers,RequestOptions } from "@angular/http";
//import { HttpModule } from "@angular/http";
import { Injectable } from "@angular/core";
//import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";
//import $ from 'jquery';

@Injectable()
export class MotrRestServiceProvider {
  private rest_url: string = "http://motrinfo.000webhostapp.com/RestServer/index.php/";
  private isDebug: boolean = true;

  constructor(public http: Http) {
    //console.log("Hello MotrRestServiceProvider Provider");
  }

  public searchMonsterByName(monster_name: string) {    
    return this.http
      .get(
        `${this.rest_url}searchByMonsterName/${monster_name}`
      )
      .toPromise()
      .then(data => data.json())
      .then(parsed_data => {
        if(this.isDebug)
          console.log(parsed_data);
        return parsed_data;
      });
  }

  public getMonsterInfoById(monster_id: string) {
    return this.http
      .get(
        `${this.rest_url}getMonsterInfoById/${monster_id}`        
      )
      .toPromise()
      .then(data => data.json())
      .then(parsed_data => {
        if(this.isDebug)
          console.log(parsed_data);
        return parsed_data;
      });
  }

  public searchItemByName(item_name: string) {    
    return this.http
      .get(
        `${this.rest_url}searchByItemName/${item_name}`
      )
      .toPromise()
      .then(data => data.json())
      .then(parsed_data => {
        if(this.isDebug)
          console.log(parsed_data);
        return parsed_data;
      });
  }

  public getItemInfoById(item_type: string, item_id: string) {
    return this.http
      .get(
        `${this.rest_url}getItemInfoById/${item_type}/${item_id}`        
      )
      .toPromise()
      .then(data => data.json())
      .then(parsed_data => {
        if(this.isDebug)
          console.log(parsed_data);
        return parsed_data;
      });
  }

  public getNews() {
    return this.http
      .get(
        `${this.rest_url}getNews`        
      )
      .toPromise()
      .then(data => data.json())
      .then(parsed_data => {
        if(this.isDebug)
          console.log(parsed_data);
        return parsed_data;
      });
  }

  public getPersonsTop() {
    return this.http
      .get(
        `${this.rest_url}getPersonsTop`        
      )
      .toPromise()
      .then(data => data.json())
      .then(parsed_data => {
        if(this.isDebug)
          console.log(parsed_data);
        return parsed_data;
      });
  }
  
  //--Пример парсинга на клиенте
  /*public test(){       
    let headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');    

    let options = new RequestOptions({ headers: headers });

    return this.http
      .get('http://motr-online.com/database/monsters/1115',options)
      .toPromise()
      .then(data => data)
      .then(parsed_data => {
        console.log(parsed_data);        
        let sda: any  = $.parseHTML(parsed_data._body);
        console.log($(sda).find('table.tableBord'));      
        return parsed_data;
      });
  }*/

  /*private handleError (error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }*/
}
