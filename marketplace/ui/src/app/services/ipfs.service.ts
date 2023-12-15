import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpfsService {

  public IpfsResult = new Subject<any>();

  constructor(
    private http: HttpClient
  ) { }

  async getIpfs(ipfsAddress: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      await this.sendRequest(
        'https://ipfs.flowfrenznft.com/ipfs/' + ipfsAddress,
        RequestMethod.GET)
        .then((result) => {
          this.IpfsResult.next({
            id: ipfsAddress,
            data: result
          });
          res(true);
        })
        .catch((ex: any) => {
          console.log(ex);
          rej(false);
        })
    })
  }



  private sendRequest(uri: string, method: RequestMethod = RequestMethod.GET, payload: any = null) {
    return new Promise((res, rej) => {
      var httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json, text/plain, */*',
          // 'Content-Type': 'application/json',
        })
      };



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

enum RequestMethod {
  GET,
  POST
}