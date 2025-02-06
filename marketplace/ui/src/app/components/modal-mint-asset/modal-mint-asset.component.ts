import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatStepper } from '@angular/material/stepper';
import { IpfsService } from 'src/app/services/ipfs.service';
import { Collection } from 'src/app/interfaces/collection';
import { NewAsset } from 'src/app/interfaces/newAsset';
import { Web3Service } from 'src/app/services/web3.service';
import { ContractService } from 'src/app/services/contract.service';
import { ContractConnectService } from 'src/app/services/contract-connect.service';
import { UiService } from 'src/app/services/ui.service';
import CREATOR_ABI_json from "src/app/contract-abi/ERC721Creator.json";
import { ethers } from 'ethers';
import { Erc721Service } from 'src/app/services/erc721.service';
import { AlchemyService } from 'services/alchemy.service';

const CREATOR_ABI = new ethers.Interface(CREATOR_ABI_json.abi);

@Component({
  selector: 'app-modal-mint-asset',
  templateUrl: './modal-mint-asset.component.html',
  styleUrls: ['./modal-mint-asset.component.scss']
})
export class ModalMintAssetComponent implements OnInit {

  private _collectionImageAddress: string;
  private _colImageIpfs: string;
  fileColImage: File = null;
  fileAsset: File = null;
  assetImageAddress = '';

  radioFileUpload: number = undefined;
  collectionSelectValue: string = "newCol";

  collectionAddress: string = '';
  colName: string = '';
  colSymbol: string = '';
  colDescription: string = '';

  asset: NewAsset;
  assetName: string = '';
  assetDescription: string = '';
  assetUrl: string = '';

  selectedCollection?: Collection;
  pendingTraitName: string = '';
  pendingTraitValue: string = '';
  walletCollections: Collection[] = [];
  traits: any[] = []

  defaultCollection: Collection = { 
    collectionName: '-- Please Select One --', 
    contractAddress: '',
    bannerImageUrl: '', 
    // collectionDefaultImage: '',
    collectionSlug: '',
    contractDeployer: '',
    creatorName: '',
    description: '',
    discrodUrl: '',
    imageUrl: '',
    ipfs: '',
    symbol: '',
    tokenType: '',
    twitterUsername: ''
  };

  constructor(
    private cdk: ChangeDetectorRef,
    private ipfs: IpfsService,
    private web3: Web3Service,
    private ui: UiService,
    private cc: ContractConnectService,
    private alchemy: AlchemyService
  ) { }

  ngOnInit(): void {
    this.collectionImageAddress = 'assets/images/no-image-x.png';
    this.ipfs.IpfsResult.subscribe((res) => {
      this.assetImageAddress = res.data.image;
      this.asset.image = this.assetImageAddress;
      // if (res.id == this.asset.tokenUri.gateway) {
      // }
    })

    // this.getCollectionsOwnedByWallet();
  }

  set collectionImageAddress(value: string) {
    if (value.indexOf('ipfs://') > -1) {
      this._collectionImageAddress = value.replace('ipfs://', 'https://ipfs.leftbrain.ninja/ipfs/') + '?pinataGatewayToken=ae_xrzJ4FW6yognMc3KKN3ANPoqSg72FrP3sRBttfcb4BAVYkV8dSB-9KKPCjJwA';
    } else if (value.indexOf('https://ipfs.io') > -1) {
      this._collectionImageAddress = value.replace('https://ipfs.io', 'https://ipfs.leftbrain.ninja') + '?pinataGatewayToken=ae_xrzJ4FW6yognMc3KKN3ANPoqSg72FrP3sRBttfcb4BAVYkV8dSB-9KKPCjJwA';
    } else {
      this._collectionImageAddress = value;
    }
  }

  get collectionImageAddress(): string {
    return this._collectionImageAddress;
  }

  checkSubmit(e: KeyboardEvent): void {
    if (e.key == "Enter") {
      this.addTrait();
    }
  }

  removeTrait(name: string): void {
    var t2: any[] = [];
    for (var i = 0; i < this.traits.length; i++) {
      if (this.traits[i].trait_type != name) {
        t2.push(this.traits[i]);
      }
    }

    this.traits = t2;
  }

  addTrait(): void {
    if (this.pendingTraitName !== '' && this.pendingTraitValue !== '') {
      var i = -1;
      this.traits.forEach((t) => {
        if (t.trait_type.toLowerCase() == this.pendingTraitName.toLowerCase()) {
          i = 1;
        }
      })

      if (i === 1) {
        console.log('Trait Already Exists');
      } else {
        this.traits.push({ trait_type: this.pendingTraitName, value: this.pendingTraitValue })
        this.pendingTraitName = '';
        this.pendingTraitValue = '';
      }
    } else {
      console.log('invalid Trait Properties');
    }
  }

  setSourceRadio(val: number) {
    this.radioFileUpload = val;
  }

  checkIpfsUrl(val: string) {
    if (val.indexOf("/") == -1) {
      this.assetImageAddress = 'https://ipfs.leftbrain.ninja/ipfs/' + val;
    } else {
      this.assetImageAddress = val.replace('https://ipfs.io/ipfs/', 'https://ipfs.leftbrain.ninja/ipfs/');
    }
    // console.log(this.fileAddress);
    this.cdk.detectChanges();
  }

  onFilechange(event: any) {
    console.log(event.target.files[0])
    switch (event.target.name) {
      case "inputColImage":
        this.fileColImage = event.target.files[0];
        break;

      case "inputAssetImage":
        this.fileAsset = event.target.files[0];
        break;

      default:
        console.error('unknown');
    }
  }

  uploadColImage() {
    if (this.fileColImage) {
      this.ipfs.sendFileToIPFS(this.fileColImage).then((resp: any) => {
        this.collectionImageAddress = 'https://ipfs.leftbrain.ninja/ipfs/' + resp.IpfsHash;
        this._colImageIpfs = resp.IpfsHash;
        this.cdk.detectChanges();
        console.log(resp);
      })
    } else {
      alert("Please select a file first")
    }
  }

  uploadAssetFile() {
    if (this.fileAsset) {
      this.ipfs.sendFileToIPFS(this.fileAsset).then((resp: any) => {
        this.assetImageAddress = 'https://ipfs.leftbrain.ninja/ipfs/' + resp.IpfsHash;
        this.cdk.detectChanges();
        console.log(resp);
      })
    } else {
      alert("Please select a file first")
    }
  }

  async submitNewAsset() {
    if (this.collectionSelectValue == "newCol") {
      this.collectionAddress = await this.deployNewCollection();
    }

    this.asset = {
      name: this.assetName,
      collectionName: this.selectedCollection.collectionName,
      description: this.assetDescription,
      image: this.assetImageAddress,
      attributes: this.traits,
      date: Math.floor(Date.now() / 1000)
    };
    
    var metaIpfs: string = await this.ipfs.createIpfsMetaFile(`${this.assetName} ${this.colName}`, this.asset)

    var dynamicCollectionContract = new Erc721Service(this.ui, this.cc);
    dynamicCollectionContract.initContract(this.collectionAddress, CREATOR_ABI_json.abi)
      .then((res) => {
        dynamicCollectionContract.createAsset(this.web3.web3.givenProvider.selectedAddress, metaIpfs)
        .then(() => {
          if (this.collectionSelectValue == "newCol") {
            this.ui.newMintModalOpenObs.next(false);
          }
        })
      })
  }

  async deployNewCollection(): Promise<string> {
    let col: Collection = {
      collectionName: this.colName,
      symbol: this.colSymbol,
      description: this.colDescription,
      contractAddress: null,
      bannerImageUrl: null,
      // collectionDefaultImage: ,
      collectionSlug:this.colName.replace(' ', '_'),
      contractDeployer: this.web3.web3.givenProvider.selectedAddress,
      creatorName:null,
      discrodUrl: '',
      imageUrl: this.collectionImageAddress,
      ipfs: this._colImageIpfs,
      tokenType: '',
      twitterUsername: ''
    }

    return await this.web3.loadWeb3().then(async () => {
      col.contractAddress = await this.web3.deployNewCollection(col);
      await this.alchemy.createNewCollection(col);


      console.log(`New Collection: ${col.collectionName} at ${col.contractAddress}`)
      return this.collectionAddress;
    }).catch((er) => {
      console.log(`error submitting new collection: ${er.toString()}`);

      return '';
    })
  }

  async setSelectedCollection(event: Event): Promise<any> {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex;

    this.selectedCollection = this.walletCollections[selectedIndex];
    this.collectionImageAddress = this.selectedCollection.imageUrl;
    this.colName = this.selectedCollection.collectionName;

    this.collectionAddress = this.selectedCollection.contractAddress;

    this.ui.snackBarObs.next({status: 'Warning', message: 'testing this thing'})
  }

  async getCollectionsOwnedByWallet(): Promise<any> {
    this.walletCollections = await this.alchemy.getCollectionsOwnedByWallet(window.ethereum.selectedAddress);
    this.walletCollections.unshift(this.defaultCollection);
    this.selectedCollection = this.walletCollections[0];
  }

  onCollectionSelectChange(): void {
    if (this.collectionSelectValue === 'existCol') {
      this.getCollectionsOwnedByWallet();
    }
  }

  resetToDefaultCollection() {
    this.selectedCollection = this.defaultCollection;
  }  

  stringIsNullOrEmpty(str: string) {
    return str === '' || str === null || str === undefined
  }
}

    // sepolia
    // Implementation deployed at: 0x79EeAF2e0D90F5D35AD1d79e8dd382B6BB0ef1A6
    // Beacon deployed at: 0x239C4c571bc8725245E554e5cf678a8508a71b53