import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  file: File = null;
  assetImageAddress = '';
  collectionImageAddress = 'assets/images/no-image-x.png';

  assetName: string = '';
  collectionSelectValue: string = "newCol";
  collectionAddress: string = '';
  radioFileUpload: number = undefined;
  assetDescription: string = '';
  assetUrl: string = '';
  collectionName: string = '';
  collectionDescription: string = '';
  pendingTraitName: string = '';
  pendingTraitValue: string = '';
  walletCollections: Collection[] = [];
  traits: any[] = []
  asset: NewAsset;

  constructor(
    private cdk: ChangeDetectorRef,
    private ipfs: IpfsService,
    private web3: Web3Service,
    private ui: UiService,
    private cc: ContractConnectService,
    private alchemy: AlchemyService
  ) { }

  ngOnInit(): void {
    this.ipfs.IpfsResult.subscribe((res) => {
      this.assetImageAddress = res.data.image;
      this.asset.image = this.assetImageAddress;
      // if (res.id == this.asset.tokenUri.gateway) {
      // }
    })

    this.getCollectionsOwnedByWallet();
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
      this.assetImageAddress = val;
    }
    // console.log(this.fileAddress);
    this.cdk.detectChanges();
  }

  onFilechange(event: any) {
    console.log(event.target.files[0])
    this.file = event.target.files[0]
  }

  addCollectionImage() {

  }

  upload() {
    if (this.file) {
      this.ipfs.sendFileToIPFS(this.file).then((resp: any) => {
        // alert("Uploaded")
        this.assetImageAddress = 'https://ipfs.leftbrain.ninja/ipfs/' + resp.IpfsHash;
        this.cdk.detectChanges();
        // this.ipfs.getIpfs(resp.IpfsHash);
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

    this.asset.name = this.assetName;
    
    this.asset.description = this.assetDescription;
    this.asset.image = this.assetImageAddress;
    this.asset.attributes = this.traits;
    this.asset.date = Math.floor(Date.now() / 1000);

    var metaIpfs: string = await this.ipfs.createIpfsMetaFile(this.assetName + this.collectionName, this.asset)

    var dynamicCollectionContract = new Erc721Service(this.ui, this.cc);
    dynamicCollectionContract.initContract(this.collectionAddress, CREATOR_ABI)
      .then((res) => {
        dynamicCollectionContract.createAsset(this.web3.selectedAddress, metaIpfs)
      })
  }

  async deployNewCollection(): Promise<string> {
    let col: Collection = {
      collectionName: this.collectionName,
      description: this.collectionDescription,
      contractAddress: null,
      bannerImageUrl: null,
      collectionDefaultImage: null,
      collectionSlug:this.collectionName.replace(' ', '_'),
      contractDeployer: this.web3.selectedAddress,
      creatorName:null,
      discrodUrl: '',
      imageUrl: '',
      ipfs: '',
      symbol: '',
      tokenType: '',
      twitterUsername: ''
    }

    return await this.web3.loadWeb3().then(async () => {
      this.collectionAddress = await this.web3.deployNewCollection();

      return this.collectionAddress;
    }).catch((er) => {
      console.log(`error submitting new collection: ${er.toString()}`);

      return '';
    })
  }

  async getCollectionsOwnedByWallet(): Promise<any> {
    this.walletCollections = await this.alchemy.getCollectionsOwnedByWallet(this.web3.selectedAddress);
  }

}

    // sepolia
    // Implementation deployed at: 0x24f69aB4d6fc3724C3418b8db13f3e353DF5696c
    // Beacon deployed at: 0x2a7CbB054ab1ED97E5fa023B58Cb42585903B737