import { Http, Response, Headers } from "@angular/http";
import { HttpModule } from "@angular/http";
import { Injectable } from "@angular/core";
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";

@Injectable()
export class MotrRestServiceProvider {
  private rest_url: string = "http://motrinfo.000webhostapp.com/RestServer/index.php/";

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
        console.log(parsed_data);
        return parsed_data;
      });
  }

  /*private handleError (error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }*/
}
