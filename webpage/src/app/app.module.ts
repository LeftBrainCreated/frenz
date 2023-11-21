import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreatorTagComponent } from './components/creator-tag/creator-tag.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { FeaturedCollectionComponent } from './components/featured-collection/featured-collection.component';
import { PfpComponent } from './components/pfp/pfp.component';
import { FeaturedArtComponent } from './components/featured-art/featured-art.component';
import { RoadmapComponent } from './components/roadmap/roadmap.component';
import { RoadmapItemComponent } from './components/roadmap-item/roadmap-item.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { BlockchainAnimationComponent } from './components/blockchain-animation/blockchain-animation.component';
import { Web3Component } from './components/web3/web3.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    CreatorTagComponent,
    FooterComponent,
    HeaderComponent,
    FeaturedCollectionComponent,
    PfpComponent,
    FeaturedArtComponent,
    RoadmapComponent,
    RoadmapItemComponent,
    ComingSoonComponent,
    BlockchainAnimationComponent,
    Web3Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
  ],
  exports: [
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
