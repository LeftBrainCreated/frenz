import { Injectable } from '@angular/core';
import { RequestMethod } from '../enumerations/request-methods';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class WebService {

  constructor(
    protected http: HttpClient
  ) { }

  protected async sendRequest(
    uri: string,
    method: RequestMethod = RequestMethod.GET,
    payload: any = null,
    httpOptions: any = {}
  ): Promise<any> {
    try {
      let response;
      
      switch (method) {
        case RequestMethod.GET:
          response = await firstValueFrom(this.http.get(uri, httpOptions));
          break;
        case RequestMethod.POST:
          response = await firstValueFrom(this.http.post(uri, JSON.stringify(payload), httpOptions));
          break;
        default:
          throw new Error(`Unsupported request method: ${method}`);
      }
  
      return response;
    } catch (error) {
      throw new Error(`Error in ${RequestMethod[method]} request: ${error.message}`);
    }
  }
  
}
