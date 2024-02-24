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
import { UiService } from 'src/app/services/ui.service';
import CREATOR_ABI_json from "src/app/contract-abi/ERC721Creator.json";
import { ethers } from 'ethers';
import { Erc721Service } from 'src/app/services/erc721.service';

const CREATOR_ABI = new ethers.Interface(CREATOR_ABI_json.abi);

@Component({
  selector: 'app-modal-mint-asset',
  templateUrl: './modal-mint-asset.component.html',
  styleUrls: ['./modal-mint-asset.component.scss']
})
export class ModalMintAssetComponent implements OnInit {
  file: File = null;
  fileAddress = 'assets/images/no-image-x.png';

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
    private ui: UiService
  ) { }

  ngOnInit(): void {
    this.ipfs.IpfsResult.subscribe((res) => {
      this.fileAddress = res.data.image;
      this.asset.image = this.fileAddress;
      // if (res.id == this.asset.tokenUri.gateway) {
      // }
    })
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
      this.fileAddress = 'https://ipfs.leftbrain.ninja/ipfs/' + val;
    } else {
      this.fileAddress = val;
    }
    // console.log(this.fileAddress);
    this.cdk.detectChanges();
  }

  onFilechange(event: any) {
    console.log(event.target.files[0])
    this.file = event.target.files[0]
  }

  upload() {
    if (this.file) {
      this.ipfs.sendFileToIPFS(this.file).then((resp: any) => {
        // alert("Uploaded")
        this.fileAddress = 'https://ipfs.leftbrain.ninja/ipfs/' + resp.IpfsHash;
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
      this.collectionAddress = await this.web3.deployNewCollection();
    }
    this.asset.name = this.assetName;
    this.asset.description = this.assetDescription;
    this.asset.image = this.fileAddress;
    this.asset.attributes = this.traits;
    this.asset.date = Math.floor(Date.now() / 1000);

    var metaIpfs: string = await this.ipfs.createIpfsMetaFile(this.assetName + this.collectionName, this.asset)

    var dynamicCollectionContract = new Erc721Service(this.ui);
    dynamicCollectionContract.initializeContract(this.collectionAddress, CREATOR_ABI)
      .then((res) => {
        dynamicCollectionContract.createAsset(this.web3.selectedAddress, metaIpfs)
      })
  }
}

