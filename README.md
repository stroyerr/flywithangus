# FlyWithAngus Website

A minimalist, responsive one-page website for independent flight instruction.

## Files

- `index.html` — page structure and content
- `styles.css` — complete visual design and responsive layout
- `script.js` — mobile navigation, scroll animations, booking request logic

## Open the site locally

Double-click `index.html`, or run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Important edits

### 1. Add your photo

In `index.html`, find:

```html
<div class="portrait-placeholder">
```

Replace that block with something like:

```html
<img
  src="assets/angus-flying.jpg"
  alt="Angus O'Neill in the cockpit"
  class="portrait-image"
/>
```

Then add this to `styles.css`:

```css
.portrait-image {
  width: 100%;
  height: 100%;
  min-height: 650px;
  object-fit: cover;
  border-radius: var(--radius-large);
}
```

### 2. Update your email

The site currently uses:

```text
angus@flywithangus.com
```

Change it in both:

- `index.html`
- `script.js` (`CONTACT_EMAIL`)

### 3. Connect Google Calendar booking

Create a Google Calendar Appointment Schedule and copy its public booking URL.
Then open `script.js` and set:

```js
const BOOKING_URL = "YOUR_GOOGLE_BOOKING_URL";
```

Once set, the booking button will open the live Google booking page. Until then,
it creates a pre-filled email request.

### 4. Update flight hours

The current figures were taken from the supplied resume. Search `index.html` for:

```text
299+
```

and update each flight-hour value as needed.

## Deploy free with GitHub Pages

1. Create a GitHub repository.
2. Upload these files to the repository root.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/root`.
6. Add `flywithangus.com` as the custom domain after buying it.

## Deploy free with Cloudflare Pages

1. Push the folder to GitHub.
2. In Cloudflare, open **Workers & Pages → Create → Pages**.
3. Connect the GitHub repository.
4. No framework preset or build command is required.
5. Set the output directory to `/`.
6. Add the custom domain after deployment.

## Before publishing

- Replace the placeholder image.
- Confirm every certificate and flight-hour figure is current.
- Decide which services you are legally and practically prepared to provide.
- Confirm aircraft rental, owner permission, and insurance requirements.
- Add a privacy policy if you later collect data through a web form.
