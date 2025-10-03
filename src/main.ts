
import { bootstrapApplication } from '@angular/platform-browser';
import { Component, inject } from '@angular/core';
import { provideHttpClient, HttpClient, HttpHeaders } from '@angular/common/http';
import { provideForms } from '@angular/forms';

type VaultItem = { id: number; title: string; username: string; password: string; url?: string; notes?: string };

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>Password Manager (SPA)</h1>

      <!-- Auth panels -->
      <div class="card" *ngIf="!token">
        <div class="grid" style="grid-template-columns:1fr 1fr">
          <div>
            <h3>Login</h3>
            <input class="input" placeholder="E-Mail" [(ngModel)]="email">
            <input class="input" placeholder="Passwort" type="password" [(ngModel)]="password" style="margin-top:8px">
            <div class="actions" style="margin-top:10px">
              <button class="btn primary" (click)="login()">Anmelden</button>
            </div>
            <div *ngIf="tmpToken" class="muted" style="margin-top:8px">Code wurde versendet / TOTP eingeben ↓</div>
          </div>
          <div>
            <h3>2FA</h3>
            <input class="input" placeholder="TOTP Code" [(ngModel)]="code">
            <div class="actions" style="margin-top:10px">
              <button class="btn" (click)="verify()">Verifizieren</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vault -->
      <div class="card" *ngIf="token">
        <div class="actions" style="justify-content:space-between;margin-bottom:8px">
          <div><strong>Eingeloggt.</strong></div>
          <button class="btn" (click)="logout()">Logout</button>
        </div>

        <div class="card" style="margin:12px 0;background:#0b1220">
          <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:8px">
            <input class="input" placeholder="Titel" [(ngModel)]="newItem.title">
            <input class="input" placeholder="Benutzer" [(ngModel)]="newItem.username">
            <input class="input" placeholder="Passwort" [(ngModel)]="newItem.password">
            <input class="input" placeholder="URL" [(ngModel)]="newItem.url">
            <input class="input" placeholder="Notizen" [(ngModel)]="newItem.notes">
          </div>
          <div class="actions" style="margin-top:8px">
            <button class="btn primary" (click)="add()">Eintrag hinzufügen</button>
          </div>
        </div>

        <div class="grid cards">
          <div class="card" *ngFor="let it of items">
            <div class="row"><span class="label">Titel</span><span class="value">{{ it.title || '—' }}</span></div>
            <div class="row"><span class="label">Benutzer</span><span class="value">{{ it.username || '—' }}</span></div>
            <div class="row"><span class="label">Passwort</span><span class="value">{{ mask(it.password || '') }}</span></div>
            <div class="row">
              <span class="label">URL</span>
              <span class="value">
                <a *ngIf="it.url" [href]="it.url" target="_blank" rel="noopener">{{ it.url }}</a>
                <span *ngIf="!it.url" class="muted">—</span>
              </span>
            </div>
            <div class="row">
              <span class="label">Notizen</span>
              <span class="value">{{ it.notes || '—' }}</span>
            </div>
            <div class="actions" style="margin-top:8px">
              <button class="btn danger" (click)="remove(it.id)">Löschen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent {
  private http = inject(HttpClient);
  backend = (window as any).__BACKEND__ || 'https://your-backend.onrender.com';
  token: string | null = null;
  tmpToken: string | null = null;
  email = '';
  password = '';
  code = '';
  items: VaultItem[] = [];
  newItem: Partial<VaultItem> = {};

  mask(v: string): string { return v ? '•'.repeat(Math.min(8, v.length)) + (v.length>8?'…':'') : '—'; }

  login(): void {
    this.http.post<{tmpToken:string}>(`${this.backend}/api/auth/login`, { email: this.email, password: this.password })
      .subscribe({
        next: (r) => { this.tmpToken = r.tmpToken; },
        error: () => alert('Login fehlgeschlagen')
      });
  }

  verify(): void {
    this.http.post<{token:string}>(`${this.backend}/api/auth/totp-verify`, { tmpToken: this.tmpToken, code: this.code })
      .subscribe({
        next: (r) => { this.token = r.token; this.load(); },
        error: () => alert('TOTP ungültig')
      });
  }

  load(): void {
    if (!this.token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    this.http.get<VaultItem[]>(`${this.backend}/api/vault`, { headers })
      .subscribe({ next: (r) => this.items = r });
  }

  add(): void {
    if (!this.token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    this.http.post<VaultItem>(`${this.backend}/api/vault`, this.newItem, { headers })
      .subscribe({
        next: (it) => { this.items = [it, ...this.items]; this.newItem = {}; },
        error: () => alert('Konnte Eintrag nicht speichern')
      });
  }

  remove(id: number): void {
    if (!this.token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    this.http.delete(`${this.backend}/api/vault/${id}`, { headers })
      .subscribe({ next: () => this.items = this.items.filter(x => x.id !== id) });
  }

  logout(): void { this.token = null; this.tmpToken = null; this.items = []; }
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideForms()]
});
