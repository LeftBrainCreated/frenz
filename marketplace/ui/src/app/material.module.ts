import { NgModule } from '@angular/core';

import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
    imports: [
        MatDialogModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        MatRadioModule,
        MatStepperModule
    ],
    exports: [
        MatDialogModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        MatRadioModule,
        MatStepperModule
    ]
})


export class MaterialModule { }