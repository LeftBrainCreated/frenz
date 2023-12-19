import { NgModule } from '@angular/core';

import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
    imports: [
        MatDialogModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule
    ],
    exports: [
        MatDialogModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule
    ]
})


export class MaterialModule { }