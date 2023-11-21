import { Component, OnInit } from '@angular/core';
import { Web3Service } from 'services/web3.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  validChain: boolean = true;

  constructor(
    private web3: Web3Service
  ) {}

  ngOnInit(): void {
    this.web3.invalidTargetChainObs.subscribe((invalidChain) => {
      this.validChain = !invalidChain;
    })
  }

  openMintDialog(): void {
    this.web3.initMintDialog.next(null);
  }

}
