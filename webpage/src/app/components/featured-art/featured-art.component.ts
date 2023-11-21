import { Component, Input, OnInit } from '@angular/core';
import { Asset } from 'src/app/interfaces/Asset';

@Component({
  selector: 'app-featured-art',
  templateUrl: './featured-art.component.html',
  styleUrls: ['./featured-art.component.scss']
})
export class FeaturedArtComponent implements OnInit {

  @Input() art!: Asset;

  currencyIconPath = '';

  constructor() { }

  ngOnInit(): void {
    switch (this.art.currency) {
      case 'ethereum':
        this.currencyIconPath = '../../../assets/images/ethereum-logo.png';
    }
  }

}
