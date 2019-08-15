import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule}   from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { HomeComponent } from './home/home.component';
import { HttpModule } from '@angular/http';
import { HttpService } from './helper/http-service';
// import { AuthServiceConfig,GoogleLoginProvider,FacebookLoginProvider,SocialLoginModule } from 'angular5-social-login';
import { AdsenseModule } from 'ng2-adsense';
// let config = new AuthServiceConfig([
//   {
//     id: GoogleLoginProvider.PROVIDER_ID,
//     provider: new GoogleLoginProvider("592880580958-27gd53r4ntrg7lvajtpt0r2t3qjpc8vq.apps.googleusercontent.com")//592880580958-q78d27ak7avi39r2o6qkq79kma7gac3b.apps.googleusercontent.com
//   },
//   {
//     id: FacebookLoginProvider.PROVIDER_ID,
//     provider: new FacebookLoginProvider("2179977705366598"),//2064847016895189,497691966909885  //2179977705366598 //246119742648620
//   }
// ]);
// export function getAuthServiceConfigs() {
//   return config;
// }
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
 //   SocialLoginModule,
    AdsenseModule.forRoot({
      adClient: 'ca-pub-7640562161899788',//ca-pub-7640562161899788
      adSlot: 2930227358,//7259870550
      adtest:'on',
    }),
  ],
  providers: [HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
