import { Injectable, isDevMode } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { WebService } from './web.service';
import { RequestMethod } from '../enumerations/request-methods';


//* PROD Change
// const FRENZ_API_ROOT_URI = 'http://localhost/api/';
// const FRENZ_API_ROOT_URI = 'https://marketplace.flowfrenznft.com/api/';
const FRENZ_API_ROOT_URI = isDevMode ? 'http://localhost:8000/api/' : 'http://marketplace.flowfrenznft.com/api/';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends WebService {

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

  async isMarketplaceCreator(walletAddress: string): Promise<boolean> {
    try {
      const result = await this.sendRequest(
        `${FRENZ_API_ROOT_URI}isCreator/${walletAddress}`,
        RequestMethod.GET,
        this.httpOptions
      );
      
      return result;
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}
