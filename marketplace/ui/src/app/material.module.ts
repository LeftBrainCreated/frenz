import { NgModule } from '@angular/core';

import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    imports: [
        MatDialogModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        MatRadioModule,
        MatStepperModule,
        MatProgressSpinnerModule
    ],
    exports: [
        MatDialogModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        MatRadioModule,
        MatStepperModule,
        MatProgressSpinnerModule
    ]
})


export class MaterialModule { }