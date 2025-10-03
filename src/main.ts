import { bootstrapApplication } from '@angular/platform-browser';
import { Component, inject } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, FormsModule],
  template: `
  <h1>Angular SPA</h1>
  <form (ngSubmit)="login()" #f="ngForm">
    <input name="email" [(ngModel)]="email" required placeholder="E-Mail">
    <input type="password" name="password" [(ngModel)]="password" required placeholder="Passwort">
    <button>Weiter</button>
  </form>
  <form (ngSubmit)="verify()" *ngIf="tmpToken">
    <input name="code" [(ngModel)]="code" required maxlength="6" placeholder="TOTP">
    <button>Verify</button>
  </form>
  <section *ngIf="token">
    <h2>Vault</h2>
    <form (ngSubmit)="create()">
      <input name="title" [(ngModel)]="title" placeholder="Titel">
      <input name="username" [(ngModel)]="username" placeholder="Benutzer">
      <input name="password" [(ngModel)]="pw" placeholder="Passwort">
      <button>+ Hinzufügen</button>
    </form>
    <ul><li *ngFor="let it of items">{{it.title}} — {{it.username}}</li></ul>
  </section>`
})
class AppComponent {
  http = inject(HttpClient);
  backend = (window as any)['BACKEND_URL'] || (location.origin.replace(/:\d+$/,'') + ':8080');
  email = ''; password=''; tmpToken=''; code=''; token='';
  title=''; username=''; pw=''; items:any[]=[];
  login(){ this.http.post<any>(this.backend+'/api/auth/login',{email:this.email,password:this.password}).subscribe(r=>{ this.tmpToken=r.tmpToken; }); }
  verify(){ this.http.post<any>(this.backend+'/api/auth/totp-verify',{tmpToken:this.tmpToken, code:this.code}).subscribe(r=>{ this.token=r.token; this.load(); }); }
  load(){ this.http.get<any[]>(this.backend+'/api/vault',{ headers: new HttpHeaders({'Authorization':'Bearer '+this.token}) }).subscribe(r=> this.items=r); }
  create(){ this.http.post<any>(this.backend+'/api/vault',{title:this.title, username:this.username, password:this.pw},
    { headers: new HttpHeaders({'Authorization':'Bearer '+this.token}) }).subscribe(()=> this.load()); }
}
bootstrapApplication(AppComponent);
