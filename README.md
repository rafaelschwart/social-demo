# social-demo

Static, read-only snapshot of the Social Command Center analytics dashboard —
engagement across X, LinkedIn and Instagram, split into Personal and Arqentia
accounts. Served by GitHub Pages at **https://social.demo.arqentia.com**
(`public/CNAME`; `*.demo.arqentia.com` is a wildcard to `rafaelschwart.github.io`).

**Don't edit the synced files here.** `app/globals.css`, `components/ui`,
`components/analytics*`, `components/shell` and `lib/utils.ts` are copied from
the private app, and `data/snapshot.json` + `public/thumbs/` are exported from
its local database. To refresh, run this from the app repo
(`C:\dev\Social Media Manager`) while its dev server is up:

```bash
npm run demo:publish          # sync + build check + commit + push → Pages redeploys
npm run demo:publish -- --no-push   # sync + build check only
```

Only `app/layout.tsx`, `app/page.tsx`, `components/demo-header.tsx` and the
build config are authored here.
