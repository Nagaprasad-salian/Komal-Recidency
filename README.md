# Komal Residency website

Plain HTML, CSS and JavaScript. No build step, no installs, no backend.

## Open it
Double-click `index.html`, or upload the whole folder to any static host
(Netlify, Vercel, GitHub Pages, Cloudflare Pages, or your existing hosting for komalresidency.com).

## Change rooms, prices or photos
Open `js/main.js` and edit the CONFIG block at the top.
- `ROOMS`: names, rates (base and with GST), descriptions, and which photos belong to each room.
- `PHOTOS`: the image files in `assets/img/`. Drop in a new .webp or .jpg and point to it here.
- `EXTRA_BED`, `GST_RATE`, `ADVANCE_SHARE`: the extra-bed price, GST and advance percentage.
- `WHATSAPP_NUMBER` and `BOOKING_EMAIL`: where booking requests are sent.
The room cards, tariff table, booking form and price summary all update from this one place.

## Change colours
Open `css/styles.css`. The palette is at the top under `:root`
(`--blue`, `--lav`, `--peach`, `--ink`).

## How booking works
The form calculates the stay and opens a pre-filled WhatsApp message (or email) to reception.
Nothing is stored on a server, and a booking is only confirmed after reception replies and the
50% advance is paid.
