import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { UiService } from './ui.service';
import { OwnedAsset } from '../interfaces/marketplace-assets';
import { ListedAsset } from '../interfaces/marketplace-assets';
import ERC721Abi from '../contract-abi/GenericERC721.json';
import { Subject } from 'rxjs';
// import Web3 from 'web3';
import { ContractService } from './contract.service';
import { Erc721Service } from './erc721.service';

const contract_json = require("../contract-abi/marketplace.json");
const MP_CONTRACT_ADDRESS = '0x07a70FEA55F85D6e77A1c7bD16c02B0F5a8748E6';
const SHIB_CONTRACT_ADDRESS = '0x495eea66b0f8b636d441dc6a98d8f5c3d455c4c0';
const BONE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000001010';
const LOCALHOST_CHAIN_ID = 0;
const SHIBARIUM_CHAIN_ID = 2;
const ETHEREUM_CHAIN_ID = 1;
const GOERLI_CHAIN_ID = 3;

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService extends ContractService {
  targetedChainId: number;
  ownedAssets: OwnedAsset[] = [];
  listedAssets: ListedAsset[] = [];

  public ListingObs = new Subject<ListedAsset>();
  public listPriceSet = new Subject<any>();
  // private web3: Web3;

  constructor(
    uiService: UiService,
    web3Service: Web3Service
  ) {
    super(uiService);
    // this.mpContract = new Erc721Service(uiService);
    web3Service.loadWeb3().then(() => {
      web3Service.init(SHIBARIUM_CHAIN_ID);
      this.initializeContract(MP_CONTRACT_ADDRESS, contract_json);
    });
  }

  async getListedAssets(): Promise<boolean> {
    return new Promise(async (res, rej) => {
      await this.callToContract("fetchListedMarketItems")
        .then((result) => {
          this.listedAssets = [];
          // this.ListedAssetObs.next(result);
          result.forEach((r: any) => {
            this.listedAssets.push(this.convertListingToListedAsset(r));
          })
          res(true);
        })
        .catch((ex: any) => {
          console.log(ex);
          rej(false);
        });
    });
  }

  public async buyItem(contractAddress: string, tokenId: string | number, value: number) {
    await this.sendToContract("buyItem", this.web3.utils.toWei(value, 'ether').toString(), [
      contractAddress,
      tokenId
    ]).then((res) => {
      console.log(`Purchased NFT: CA: ${contractAddress} - ID: ${tokenId} - Price: ${value}`);
      return res;
    }).catch((ex) => {
      throw (ex);
    })
  }

  public async listNft(contractAddress: string, tokenId: string | number, price: number) {
    return new Promise((res, rej) => {
      this.checkForNftApproval(contractAddress, MP_CONTRACT_ADDRESS, tokenId.toString())
        .then(async () => {
          await this.sendToContract("listItem", null, [
            contractAddress,
            tokenId,
            this.web3.utils.toWei(price, 'ether').toString()
          ]).then((result) => {
            console.log(`Listing Created: CA: ${contractAddress} - ID: ${tokenId} - Price: ${price}`);
            res(result);
          }).catch((ex) => {
            rej(ex);
          })
        })
    })
  }

  public async updateListing(contractAddress: string, tokenId: string | number, price: number) {
    this.checkForNftApproval(contractAddress, MP_CONTRACT_ADDRESS, tokenId.toString())
      .then(async () => {
        await this.sendToContract("updateListing", null, [
          contractAddress,
          tokenId,
          this.web3.utils.toWei(price, 'ether').toString()
        ]).then((res) => {
          console.log(`Listing Created: CA: ${contractAddress} - ID: ${tokenId} - Price: ${price}`);
          return res;
        }).catch((ex) => {
          console.log(ex);
          return null;
        })
      })
  }

  public async cancelListing(contractAddress: string, tokenId: string | number) {
    await this.sendToContract("cancelListing", null, [contractAddress, tokenId])
      .then(() => {
        console.log(`Listing Removed: CA: ${contractAddress} - ID: ${tokenId}`);
      }).catch((ex) => {
        console.log(ex);
      })
  }

  public async getListing(ca: string, tokenId: string) {
    return new Promise<void>(async (res, rej) => {
      await this.callToContract("getListing", [ca, tokenId])
        .then(async (result) => {
          await this.getListingById(result['listingId'].toString());
          res();
        }).catch((ex) => {
          console.log(ex);
          rej(ex);
        })
    })
  }

  public async getListingById(listingId: string) {
    return new Promise(async (res, rej) => {
      await this.callToContract("getListingById", [listingId])
        .then((result) => {
          res(this.ListingObs.next(this.convertListingToListedAsset(result)));
        }).catch((ex) => {
          console.log(ex);
          rej(ex);
        })
    })
  }

  // public async fetchMyListings() {
  //   this.callToContract("fetchMyListings")
  //     .then((res) => {
  //       console.log(res);
  //       // res.forEach(element => {
  //       //   console.log
  //       // });
  //     })
  // }

  private convertListingToListedAsset(listing: any): ListedAsset {
    var la: ListedAsset = {
      listingId: listing['listing']['listingId'],
      contractAddress: listing['contractAddress'],
      active: listing['active'],
      price: Number(this.web3.utils.fromWei(listing['listing']['price'], "ether")),
      seller: listing['listing']['seller'],
      tokenId: listing['tokenId']
    };

    return la;
  }

  private checkForNftApproval(contractAddress: string, operator: string, tokenId: string): Promise<void> {
    return new Promise(async (res, rej) => {
      var c = new this.web3.eth.Contract(ERC721Abi, contractAddress);

      await this.callToContract(
        "getApproved", [tokenId]
      ).then(async (approval) => {
        if (approval != MP_CONTRACT_ADDRESS) {
          // get approval
          await this.sendToContract("approve", "0", [MP_CONTRACT_ADDRESS, tokenId])
            .then(() => {
              res();
            }).catch((ex) => {
              console.log(ex);
              rej();
            })
        } else {
          res();
        }
      })
    })
  }
}
