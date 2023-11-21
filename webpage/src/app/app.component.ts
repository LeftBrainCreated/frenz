import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import ArtListData from '../assets/data/artList.json';
import CollectionData from '../assets/data/collections.json';
import RoadmapData from '../assets/data/roadmap.json';
import CreatorsData from '../assets/data/creators.json';
import { Asset, Collection } from './interfaces/Asset';
import { RoadmapItem } from './interfaces/RoadmapItem';
import { Creator } from './interfaces/Creator';
import { UtilService } from './services/util.service';
import { Web3Service } from './services/web3.service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'flowfrenz';

  ArtList: Asset[] = [];
  CollectionList: Collection[] = [];
  RoadmapItems: RoadmapItem[] = [];
  CreatorsList: Creator[] = [];
  randos: number[] = [];
  walletConnected = false;
  validChain = true;

  frontArt1!: Asset;
  frontArt2!: Asset;

  constructor(
    private util: UtilService,
    private web3: Web3Service,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.ArtList = ArtListData;
    this.RoadmapItems = RoadmapData;
    this.CollectionList = CollectionData;
    this.CreatorsList = CreatorsData;

    this.randos = this.util.getRandom(5, ArtListData.length);
    

    this.frontArt1 = this.ArtList[this.randos[0]];
    this.frontArt2 = this.ArtList[this.randos[1]];

    this.web3.changeConnectedStateObs.subscribe((connected) => {
      this.handleWeb3Changes(connected, this.validChain);
    })

    this.web3.invalidTargetChainObs.subscribe((invalidChain: boolean) => {
      this.handleWeb3Changes(this.walletConnected, !invalidChain);
    })
  }

  handleWeb3Changes(walletConnected: boolean, validChain: boolean) {
    this.walletConnected = walletConnected;
    this.validChain = validChain;

    this.cdr.detectChanges();
  }

  openMintDialog(): void {
    if (!this.walletConnected) {
      alert("Please Connect Your Wallet");
    } else if (!this.validChain) {
      alert("Invalid Chain Selected");
    } else {
      this.web3.initMintDialog.next(null);
    }
  }
}
