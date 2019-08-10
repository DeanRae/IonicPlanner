import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabMenuPage } from './tab-menu.page';
import { TabMenuPageRoutingModule } from './tab-menu.router.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabMenuPageRoutingModule,
  ],
  declarations: [TabMenuPage]
})
export class TabMenuPageModule {}
