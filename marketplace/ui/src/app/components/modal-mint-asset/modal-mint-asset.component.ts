import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators, FormsModule, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';



@Component({
  selector: 'app-modal-mint-asset',
  templateUrl: './modal-mint-asset.component.html',
  styleUrls: ['./modal-mint-asset.component.scss']
})
export class ModalMintAssetComponent {
  assetName: string = '';
  collectionRadioValue: number = undefined;
  assetDescription: string = '';
  assetUrl: string = '';
  collectionName: string = '';
  collectionDescription: string = '';
  pendingTraitName: string = '';
  pendingTraitValue: string = '';
  traits: any[] = []

  constructor(
    private cdk: ChangeDetectorRef
  ) { }

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

}
