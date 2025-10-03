
# password-spa (Angular 17)

Minimaler SPA-Client für deinen Passwortmanager.

## Lokal starten
```bash
corepack enable
rm -f package-lock.json
yarn install
yarn start
```
Öffne http://localhost:4200

## Build für Render (Static Site)
- Build command: `rm -f package-lock.json && yarn install && yarn build`
- Publish directory: `dist`
- Optionales Env: `BACKEND_URL=https://<dein-backend>` und im `index.html` z. B. per Script `window.__BACKEND__=...` setzen.

Die App nutzt `provideHttpClient()` & `provideForms()` (keine NgModule-Imports erforderlich).
