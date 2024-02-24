import { Injectable } from '@angular/core';
import { RequestMethod } from '../enumerations/request-methods';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export abstract class WebService {

  constructor(
    protected http: HttpClient
  ) { }

  protected sendRequest(
    uri: string,
    method: RequestMethod = RequestMethod.GET,
    payload: any = null,
    httpOptions: any = {}
  ) {
    return new Promise((res, rej) => {
      switch (method) {
        case RequestMethod.GET:
          this.http.get(uri, httpOptions)
            .subscribe(async (body: any) => {
              res(body);
            });
          break;

        case RequestMethod.POST:
          this.http.post(uri, JSON.stringify(payload), httpOptions)
            .subscribe(async (body: any) => {
              res(body);
            });

          break;
      }
    })
  }

}
