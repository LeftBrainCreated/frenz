import { Injectable, isDevMode } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { WebService } from './web.service';
import { RequestMethod } from '../enumerations/request-methods';
import * as fs from 'fs'

//* PROD Change
// const FRENZ_API_ROOT_URI = 'http://localhost/api/';
// const FRENZ_API_ROOT_URI = 'https://marketplace.flowfrenznft.com/api/';
const FRENZ_API_ROOT_URI = isDevMode ? 'http://localhost:8000/api/' : 'http://marketplace.flowfrenznft.com/api/';

@Injectable({
  providedIn: 'root'
})
export class IpfsService extends WebService {

  public IpfsResult = new Subject<any>();

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  async getIpfs(ipfsAddress: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      var httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        })
      };

      await this.sendRequest(
        'https://ipfs.leftbrain.ninja/ipfs/' + ipfsAddress,
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

  public async createIpfsMetaFile(fileName: string, metadata: any): Promise<string> {
    return new Promise(async (res, rej) => {
      const blob = new Blob([metadata.toString()], { type: 'application/json' });
      const file = new File([blob], fileName + '.txt', { type: 'application/json' });

      res(await this.sendFileToIPFS(file));
    })
  }

  public async sendFileToIPFS(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const params = new FormData();
      params.append('file', file);
      params.append('pinataMetadata', JSON.stringify({ name: 'file name here' }));
      params.append('pinataOptions', JSON.stringify({
        cidVersion: 0,
      }));

      const httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json, text/plain, */*'
        })
      };

      // this.sendRequest(
      //   FRENZ_API_ROOT_URI + 'pinata/ipfs/upload',
      //   RequestMethod.POST,
      //   params,
      //   httpOptions
      // ).then((res) => {
      //   resolve(res);
      // }).catch((err) => {
      //   reject(err);
      // });

      this.http.post<string>(FRENZ_API_ROOT_URI + 'pinata/ipfs/upload', params, httpOptions)
        .subscribe({
          next: (res: string) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }



}