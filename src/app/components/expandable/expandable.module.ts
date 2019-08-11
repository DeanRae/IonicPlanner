import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpandableComponent } from './expandable.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [ExpandableComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [ExpandableComponent]
})
export class ExpandableModule { }
