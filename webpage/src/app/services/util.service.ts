import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  public getRandom(qty: number, ceiling: number): any[] {
    const set = new Set()
    while(set.size < qty) {
      set.add(Math.floor(Math.random() * ceiling))
    }
    return Array.from(set);
  }

  public async fetchWithTimeout(url: string, options: any, timeout = 2000) {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
    ]);
  }

  public async getEthToUsdRate(): Promise<number | undefined> {
    try {
      const x = await this.fetchWithTimeout('https://api.coinbase.com/v2/prices/ETH-USD/spot', {
        method: 'GET',
      });
      if (x.status !== 200) {
        throw new Error('Non-200 response from coinbase');
      }
      const ethToUsdJson = await x.json();
      return parseFloat(ethToUsdJson.data.amount);
    } catch {
      return undefined;
    }
  }
  
  public async getERC20ToUSDRate(erc20: string): Promise<number | undefined> {
    if (erc20.toLowerCase() === 'eth' || erc20.toLowerCase() === 'oeth') {
      return undefined;
    }
    try {
      const x = await this.fetchWithTimeout(
        `https://api.coingecko.com/api/v3/coins/${erc20.toLowerCase()}`,
        {
          method: 'GET',
        }
      );
      if (x.status !== 200) {
        throw new Error('Non-200 response from coinbase');
      }
      const erc20ToUSD = await x.json();
      return parseFloat(erc20ToUSD?.market_data?.current_price?.usd ?? 0);
    } catch {
      return undefined;
    }
  }
}
