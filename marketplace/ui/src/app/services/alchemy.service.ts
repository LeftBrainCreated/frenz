import { Injectable, isDevMode } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Asset } from '../interfaces/asset';
import { WebService } from './web.service';
import { RequestMethod } from '../enumerations/request-methods';
import { Collection } from '../interfaces/collection';


//* PROD Change
// const FRENZ_API_ROOT_URI = 'http://localhost/api/';
// const FRENZ_API_ROOT_URI = 'https://marketplace.flowfrenznft.com/api/';
const FRENZ_API_ROOT_URI = isDevMode ? 'http://localhost:8000/api/' : 'http://marketplace.flowfrenznft.com/api/';

@Injectable({
  providedIn: 'root'
})
export class AlchemyService extends WebService {

  public CollectionResults = new Subject<any>();
  public MarketplaceCollectionsObs = new Subject<any>();
  public OwnedAssetsObs = new Subject<any>();

  public whitelistedCollections: string[] = [];

  private httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    })
    , withCredentials: true
  }

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  async getCollectionsForMarketplace(): Promise<any> {
    return new Promise(async (res, rej) => {
      await this.sendRequest(
        `${FRENZ_API_ROOT_URI}collections`,
        RequestMethod.GET,
        this.httpOptions = this.httpOptions
      ).then((result) => {
        this.MarketplaceCollectionsObs.next(result);
        res(true);
      }).catch((ex: any) => {
        console.log(ex);
        rej(false);
      })
    })
  }

  async getNFTsForCollection(contractAddress: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      await this.sendRequest(
        `${FRENZ_API_ROOT_URI}collection/${contractAddress}`,
        RequestMethod.GET,
        this.httpOptions = this.httpOptions)
        .then((result) => {
          this.CollectionResults.next(result);
          res(true);
        })
        .catch((ex: any) => {
          console.log(ex);
          rej(false);
        })
    })
  }

  async getNFTsForWallet(walletAddress: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      if (walletAddress !== undefined) {
        await this.sendRequest(
          `${FRENZ_API_ROOT_URI}wallet/${walletAddress}`,
          RequestMethod.GET,
          this.httpOptions = this.httpOptions)
          .then((result) => {
            this.OwnedAssetsObs.next(result);
            res(true);
          })
          .catch((ex: any) => {
            console.log(ex);
            rej(false);
          });
      }

      res(true);
    });
  }

  async getNFTMetadata(contractAddress: string, tokenId: number | string): Promise<Asset> {
    return new Promise(async (res, rej) => {
      await this.sendRequest(
        `${FRENZ_API_ROOT_URI}collection/${contractAddress}/nft/${tokenId}`,
        RequestMethod.GET,
        this.httpOptions = this.httpOptions)
        .then((result: any) => {
          res(result);
        })
        .catch((ex: any) => {
          console.log(ex);
          rej();
        })
    })
  }

  async getOwnersForNft(contractAddress: string, tokenId: number): Promise<string> {
    return new Promise(async (res, rej) => {
      await this.sendRequest(
        `${FRENZ_API_ROOT_URI}collection/${contractAddress}/nft/${tokenId}/owner`,
        RequestMethod.GET,
        this.httpOptions = this.httpOptions)
        .then((result: any) => {
          res(result);
        })
        .catch((ex: any) => {
          console.log(ex);
          rej();
        })
    })
  }

  async createNewCollection(col:Collection): Promise<boolean> {
    try {
      const result: boolean = await this.sendRequest(
        `${FRENZ_API_ROOT_URI}collections/create`,
        RequestMethod.POST,
        col,
        this.httpOptions
      )

      return result;
    } catch (ex) {
      console.log(ex.message)
      return false;
    }
  }

  async getCollectionsOwnedByWallet(walletAddress: string): Promise<any> {
    try {
      const result = await this.sendRequest(
        `${FRENZ_API_ROOT_URI}collections/bydeployer/${walletAddress}`,
        RequestMethod.GET,
        this.httpOptions
      );
      return result;
    } catch (ex) {
      console.log(ex);
      throw ex;  // It's better to throw the error so the caller can handle it.
    }
  }
  
  // private sendRequest(uri: string, method: RequestMethod = RequestMethod.GET, payload: any = null) {
  //   return new Promise((res, rej) => {
  //     var httpOptions = {
  //       headers: new HttpHeaders({
  //         'Accept': 'application/json, text/plain, */*',
  //         'Content-Type': 'application/json',

  //         // 'Content-Length': reqBodyLength.toString(),
  //       })
  //       , withCredentials: true
  //     };



  //     switch (method) {
  //       case RequestMethod.GET:
  //         this.http.get(uri, httpOptions)
  //           .subscribe(async (body: any) => {

  //             res(body);
  //             // if (body.status == 'success' && body.data) {
  //             //   res(body);
  //             // } else {
  //             //   rej('invalid result')
  //             // }
  //           });
  //         break;

  //       case RequestMethod.POST:
  //         this.http.post(uri, JSON.stringify(payload), httpOptions)
  //           .subscribe(async (body: any) => {

  //             res(body);
  //             // if (body.status == 'success' && body.data) {
  //             //   res(body);
  //             // } else {
  //             //   rej('invalid result')
  //             // }
  //           });

  //         break;
  //     }
  //   })
  // }

}

// enum RequestMethod {
//   GET,
//   POST
// }