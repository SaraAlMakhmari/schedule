# Weekplan

Personal week planner + budget. Hosted for free on GitHub Pages.
Live site: https://saraalmakhmari.github.io/schedule/

**GitHub is only for the website files.** Your schedule lives in Firebase (or this browser until you connect it), so Mac and phone stay in sync in about a second — not after a git push.

## Day to day

1. Open the site (or Add to Home Screen on your phone).
2. Sign in with Google once (after Firebase is connected).
3. Tell chat your week, for example:

```
wake 7am sleep 11pm
Chem 201 every Mon Wed 10am-11am commute
Work Tue Thu 4pm-8pm commute
study 6 hours
workout 45 min Mon Wed Fri
meal prep Sunday 2pm chicken rice broccoli
hangout Saturday 7pm dinner $25
income 200 save 20%
```

4. Later: `I overslept 30 minutes`, `skip workout today`, `move study to 6pm`, `log $12 coffee`.

## Connect Firebase (free Spark plan)

1. Firebase console → your project → Project settings → Your apps → Web → copy the config object into `firebase-config.js`.
2. Authentication → Sign-in method → Google → Enable.
3. Authentication → Settings → Authorized domains → add `saraalmakhmari.github.io` and `localhost`.
4. Firestore Database → Create (start in production mode) → paste `firestore.rules`.
5. Upload the updated files to the `schedule` GitHub repo (the Pages site).
6. Open the site → Sign in.

Until this is filled in, everything still works on one device (saved in the browser).

## Update the live site without git

GitHub → `saraalmakhmari/schedule` → Add file → Upload files → replace `index.html` (and `firebase-config.js`).
Pages is already serving `/schedule/`.
