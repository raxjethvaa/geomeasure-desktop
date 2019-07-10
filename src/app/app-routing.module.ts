import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule ,Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const router:Routes=[
  { path :'', component:HomeComponent, pathMatch:'full' }
  // { path :'', redirectTo:'/home', pathMatch:'full' },
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(router)
  ],
  exports:[
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
