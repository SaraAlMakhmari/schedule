# Cross-device Weekplan agent

Chat quality is mostly this Worker. Phrase-matching in the page is a backup. After you change `brain.js` or `worker.js`, you must **deploy** or the live site stays dumb.

Ollama cannot run on an iPhone. The **brain** is `agent/brain.js` (your rules). The **engine** is Gemini Flash, called from a Cloudflare Worker so the API key never sits in GitHub Pages.

Firestore (already in the app) syncs the week. The Watch later is another client on the same documents.

## 15-minute setup

1. Get a free Gemini key: https://aistudio.google.com/apikey (Google account, no card).
2. On a machine with Node (Cursor’s terminal, or any laptop with `npx`):

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
npx wrangler secret put GEMINI_API_KEY
```

Paste the AI Studio key when asked.

3. Copy the `https://weekplan-agent.<you>.workers.dev` URL into:
   - `firebase-config.js` → `WEEKPLAN_AGENT_URL`
   - Settings → Agent worker URL → Save
   - Brain = **Cloud agent**

4. Upload `index.html` + `firebase-config.js` like usual (or open the Mac local page). Sign in on phone and laptop.

5. Edit `agent/brain.js` whenever you want different personality/rules, then `npx wrangler deploy` again from `cloudflare/`.

Optional: Cloudflare dashboard → Worker → Settings → Variables → `ALLOWED_ORIGINS` = `https://saraalmakhmari.github.io,http://localhost:5500`

No Firebase Blaze. No Ollama on the phone.
