# Forth Gen: proposal + new website concept (Michael Tapia)

Two sites in one folder, ready for GitHub Pages:

| Site | Address once live | What it is |
|---|---|---|
| **Proposal** for Kevin Glassman | `…/forthgen-proposal/` | Your portfolio, his vacancies as an infographic, what he'd get, a sample Monday update, findings, services, the website, value, ways to work together, about you |
| **Forth Gen website concept** | `…/forthgen-proposal/forthgen/` | A complete new site: 16 pages, the 10 live suites with your ChatGPT-edited photos, ocean-view highlights, carousels, building pages, the West End page, waitlist, viewing booking |
| **Sample dashboard** | `…/forthgen-proposal/sample-dashboard/` | Your lease-up dashboard format, fictional data, linked from the proposal |

**Proposal sections, in order:**
- **My portfolio:** the 6 rental buildings in your care (line drawings) and the 5 lease-ups you lead (photos), plus strata and building operations. Taken from your leasing portfolio site; it doesn't name your employer.
- **Your vacancies:** days on market for each suite as a bar chart, KPIs, and rent waiting by building. Kevin Manor #205 is left out of the chart because its post is a reused one from January 2025.
- **What you'd get:** what the Monday and monthly reports cover, with no promise that suites rent within a month, plus a link to the sample dashboard.
- **Working together:** two groups. Leasing (placement pilot, leasing desk, website) and property management for the whole portfolio (your Residential Property Manager, third-party management through a licensed brokerage, or part time).

Both are under your name only. Both have the **"Talk to Michael"** widget with your photo. It shows a green "Online now" dot and has Call, Text, Email and Book-a-call buttons plus a message box, all going to **migueltapiarosero@gmail.com / (604) 379-4504**.

Every concept page has:
- a top bar saying it's a concept, not the official site
- a floating **"Back to the proposal"** button at the bottom left

Every page carries `noindex`, so Google won't list it.

It's plain HTML, CSS and JavaScript, with no build step needed to upload. About 28 MB.

## 1. Put it online (GitHub Pages, free, about 5 minutes)

1. Sign in at https://github.com.
2. Click **+ → New repository**, name it `forthgen-proposal`, choose **Public**, then click **Create repository**.
3. Click **uploading an existing file**. Select **everything inside this `github` folder** (`index.html`, `README.md`, the `assets` folder and the `forthgen` folder) and drag it in. Wait until every file is listed, then click **Commit changes**.
   *If the browser won't take folders, upload in two rounds: first `index.html` + `assets`, then `forthgen`.*
4. Go to **Settings → Pages**, set **Deploy from a branch → main → / (root)**, and click **Save**.
5. After 1–2 minutes:
   - Proposal: `https://YOUR-USERNAME.github.io/forthgen-proposal/`
   - Website: `https://YOUR-USERNAME.github.io/forthgen-proposal/forthgen/`

## 2. Your contact details (one place for both sites)

Open `assets/js/talk.js`. The block at the top is the only part you edit:

```js
name: 'Michael',
phone: '+16043794504',          // Call and Text buttons
phoneLabel: '(604) 379-4504',
email: 'migueltapiarosero@gmail.com',
calendly: '',                    // paste a Calendly link to make "Book a call" open it
formEndpoint: '',                // see step 3
alwaysOnline: true,              // false = green dot only Mon–Sat 9 am–6 pm
```

## 3. Forms

The widget, **Book a viewing**, **Waitlist** and **Contact** forms open the visitor's email app with everything filled in, addressed to your Gmail. That works with no setup.

To receive submissions directly instead:
1. Create a free form at https://formspree.io. It gives you a link like `https://formspree.io/f/abcdwxyz`.
2. Paste that link into `formEndpoint: ''` in `assets/js/talk.js`.
3. Upload `talk.js` again.

## 4. Update the suites (rents, dates, leased, new ones)

Open `forthgen/js/data.js`. Each suite in the `"suites"` list has `rent`, `available` (move-in date, `YYYY-MM-DD`; a past date shows "Available now") and `sqft`.

- **Leased:** delete that suite's block. It disappears from the website, the building page and the proposal's tables.
- **New suite:** copy a block, change the details, and add its photos as `forthgen/img/suites/<id>/01.webp, 01-t.webp, 02.webp…`

**The easy way to add photos:**
1. Drop the edited photos in `Forth Gen/listing-photos/<listing folder>/chatgpt-edited/`.
2. Add the folder name and suite id to the `SUITES` list in `Forth Gen/site-build/prepare-images.py`.
3. Add the suite to `Forth Gen/site-build/data.mjs`.
4. Run, from `Forth Gen/site-build`:

```bash
py -I prepare-images.py
```

```bash
node build.mjs
```

That rewrites the photos, `data.js` and every concept page.

## 5. Prices on the proposal

Prices appear in only two places in `index.html`:
- the **"Working together"** section (`id="work"`), with the four option cards and the "Everything here is negotiable" note
- the **"What it's worth"** section (calculator and hiring comparison)

Edit the numbers there, or delete the price lines if you'd rather talk numbers on the call. The calculator's $300 per lease is in `assets/js/main.js` (`leases * 300`).

## 6. Check before you send

- **Re-check the ads.** The proposal's "What I found" and "Monday update" quote this week's Marketplace ads and website (25 Oct 2026). They change every few days.
- **Home counts (378 total)** come from the City of Vancouver rental inventory. Kevin Manor, Rosewoods and Bayside match other records; confirm the rest with Kevin.
- **The family story** on the concept ("C. & L. Glassman", "fourth generation", "built in the 1960s and 70s") comes from the vintage signs and the company name. Confirm it with Kevin.
- **Elliot Towers penthouse (#1200):** baths shown as 2 (from the Marketplace ad; the website doesn't say). Its photos carry a note that the suite is being renovated.
- **Kevin Manor #101 and #205** show "Available now", since their advertised dates have passed.

## What's in the website concept

The menu is homes first: **Available homes · Ocean views · The West End · Our story · Contact**. Building pages are secondary; you reach them from the home page carousel, each suite page and the footer.

| Page | What works |
|---|---|
| `index.html` Home | English Bay hero, quick search, live counts, open suites in a carousel with tabs (All, Ocean view, Ready now, 2 bed/den/penthouse), a "Wake up to English Bay" strip of real views from open suites, the buildings carousel, the family story, neighbourhood, how renting works |
| `homes.html` | All open suites. Filter by size, ocean view, building, rent and move-in; sort by date, price or size; FAQ. `homes.html?view=ocean` opens with the ocean-view filter on |
| `suite.html?u=…` | One page per suite: photo gallery with full-screen viewer (arrows and swipe), facts, features, what's included, lease terms, building card, Book a viewing |
| 6 building pages | Photos, facts, features, the open suites in that building, map of what's nearby, the other buildings |
| `buildings.html` | All six buildings plus a map |
| `neighbourhood.html` "The West End" | Stanley Park hero, key numbers, English Bay feature, six "things to love" cards, getting around, interactive map (buildings, beaches, shops, buses; filter chips; click a place to fly to it) |
| `our-story.html` | The Glassman signs, a timeline, how the family runs its buildings |
| `book-a-viewing.html` | Pick a suite (pre-filled from any "Book a viewing" button), day, time and contact details |
| `waitlist.html` | Size, buildings, budget, move-in date, flexible or not |
| `contact.html`, `thank-you.html` | Office, hours, contact form; confirmation with a summary |

The maps use Leaflet with Esri's free tiles. No API keys anywhere.

## Folder layout

```
index.html                  proposal
assets/css/style.css        proposal styles
assets/css/talk.css         Talk-to-Michael widget (shared)
assets/js/talk.js           widget + form sending + YOUR CONTACT DETAILS (shared)
assets/js/main.js           proposal tables, Monday update, calculator, screenshot viewer
assets/img/                 your photos, evidence screenshots, website previews
assets/img/portfolio/       your portfolio buildings (lease-up photos, multifamily line drawings)
sample-dashboard/           your sample lease-up dashboard (fictional data)
forthgen/*.html             the website concept (16 pages)
forthgen/css/site.css       website styles
forthgen/js/data.js         buildings, suites, places (the proposal reads this too)
forthgen/js/site.js         finder, galleries, forms, maps
forthgen/img/               suites (113 edited photos), buildings (41), neighbourhood, signs, logo mark
```

Forth Gen's photos and signs belong to Forth Gen Holdings and are used only to illustrate this proposal.

**Destination Vancouver photos:** six photos on the West End page are from destinationvancouver.com and are credited on the page:
- Stanley Park aerial
- cyclists at English Bay
- the seawall
- the farmers market
- an autumn street
- the pitch and putt

They're fine for showing Kevin a concept. Before the site goes live for real, get Destination Vancouver's permission or swap in Forth Gen's own photos. The originals are in `Forth Gen/images/external/destination-vancouver/`.
