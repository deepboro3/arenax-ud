# ArenaX-UD

A dark pink/obsidian esports tournament portal for BGMI and Free Fire, branded ArenaX-UD, with a React/Vite frontend and an Express/MongoDB API scaffold.

## What is implemented

- Mandatory 18+ self-attestation gate on first visit. Signup also requires date of birth and checks the 18+ threshold.
- Responsive landing page using the supplied BGMI and Free Fire wallpapers and ArenaX-UD logo, player hub, explicit game selection, countdowns, tournament cards and a winners corner.
- Sign-in/sign-up UI, game ID and mock in-game name confirmation/retry, +91 prize/payment contact phone, configurable QR image slot and demo payment confirmation.
- Tournament brief with mode, perspective, team size, date/time in IST and a three-place prize breakdown.
- Room credential countdown. The demo reveals sample credentials only after the five-minute threshold. The API never returns credentials before its server-side reveal time and only returns them to a confirmed entrant.
- Express routes for account creation/sign-in, tournament listing, player ID verification, registration, payment submission, admin payment review, roster listing and room access.
- Mongoose models for users, tournaments, registrations and payments. Room credentials are encrypted at rest with AES-256-GCM.

The browser experience runs in demo mode: accounts and registrations are saved in local storage, game identity lookup is deterministic mock data, and payment submission is not a real payment. The profile menu supports editing a player name, payment/prize phone, uploading an avatar, updating a browser-local demo password, and logging out. Verified badges are admin-controlled. The QR only displays when an admin configures its public image URL. The backend is separate and uses MongoDB/JWT. Connect the frontend flow to the API and a real payment provider before accepting players or money.

## Run the frontend

Requirements: Node.js 20+ and npm.

    npm install
    npm run dev

Open the Vite URL printed in the terminal. The first load displays the age gate. The first demo sign-in creates a browser-local password for that email; later sign-ins check that password. Demo credentials are not shared with the production API. For sign-up, use an 18+ date of birth and an Indian mobile number.

Build the static frontend with:

    npm run build

## Run the API locally

1. Copy .env.example to .env.
2. Set MONGODB_URI, JWT_SECRET, and ROOM_CREDENTIALS_KEY.
3. Start MongoDB as a replica set. Slot reservation, payment submission/review and expired-hold cleanup use multi-document transactions to keep roster/payment state consistent.
4. Seed the two example tournaments and start the API:

       npm run seed
       npm run dev:api

The API listens on port 4000. Vite proxies /api to it.

Generate secrets in PowerShell:

    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Use the output as ROOM_CREDENTIALS_KEY (64 hexadecimal characters). Generate a separate long random JWT_SECRET. Never commit .env.

## Data model

| Model | Main fields | Purpose |
| --- | --- | --- |
| User | name, normalized email, phone, password hash, DOB, age verification timestamp, role, verified game profiles | Account identity and server-side age check. Passwords use bcrypt. |
| Tournament | game, mode, perspective, team size, map, start/close times, fee, capacity, prizes, winner announcements, status, encrypted room credentials | Published match configuration. A room secret has a server-side revealAt set to five minutes before start. |
| Registration | tournament, captain, game, roster, private prize/payment phone, state, payment deadline, confirmation timestamp | One entry per player account and event. Unpaid holds are excluded from the public roster. |
| Payment | registration, amount/currency, UPI reference, submitted/verified/rejected state, reviewer and timestamps | Payment evidence and explicit admin review. Only verified registrations appear in the roster. |

Entry fees and prizes are stored in minor currency units (paise). Display formatting belongs at the API/client boundary.

## API outline

All routes are prefixed with /api. Protected routes use Authorization: Bearer <token>.

| Method | Route | Access | Effect |
| --- | --- | --- | --- |
| POST | /auth/register | Public | Create an 18+ player account |
| POST | /auth/login | Public | Issue an access token |
| GET | /auth/me | Player | Read own account profile and avatar |
| PATCH | /auth/me | Player | Update own name, prize phone and avatar |
| PATCH | /auth/me/password | Player | Change password after checking current password |
| PATCH | /auth/users/:id/verification | Admin | Grant or revoke the verified badge |
| GET | /tournaments | Public | List upcoming published tournaments; optional ?game=BGMI |
| GET | /tournaments/:id | Public | Read event details by id or slug |
| GET | /tournaments/winners?game=BGMI | Public | Read announced winners by game |
| PUT | /tournaments/:id/winners | Admin | Publish verified post-match winners |
| POST | /tournaments/:id/verify-player | Player | Mock ID lookup for the event's game |
| POST | /tournaments/:id/registrations | Player | Reserve a slot with verified game name and prize/payment phone |
| POST | /registrations/:id/payments | Player | Submit UPI transaction reference |
| GET | /tournaments/:id/roster | Public | List confirmed players with masked game IDs |
| GET | /payments/pending | Admin | Review queue |
| POST | /payments/:id/review | Admin | Verify or reject payment; verified entries become roster-visible |
| PUT | /tournaments/:id/room-credentials | Admin | Store encrypted room ID/password and set reveal time |
| GET | /tournaments/:id/room | Confirmed entrant | Return room credentials only after server time reaches reveal time |

Set a user's role to admin through a protected operational process before using admin routes. Profile editing is available in the browser demo; to use it with real accounts, connect the profile forms to the /auth/me and /auth/me/password API endpoints and include the returned Bearer token. The verified badge is assigned only by an authenticated admin. The mock game identity adapter lives at server/src/lib/gameIdentity.js; it must be replaced by a legitimate provider or organizer verification workflow. The configured UPI ID and QR image are display instructions only; no payment processor or verified webhook is connected.

## Project layout

    src/
      App.jsx
      components/       age gate, auth, game picker, checkout, winners, tournament and room cards
      data/demo.js      sample events, winners and roster entries for preview
    public/assets/       optimized BGMI/Free Fire wallpapers and ArenaX-UD logo
      index.css         responsive esports visual system and effects
      lib/format.js     INR, IST date and countdown helpers
    server/src/
      models/           User, Tournament, Registration, Payment
      routes/           auth, tournaments, registrations, payments
      middleware/       JWT authentication and admin guard
      lib/              validation wrapper, mock identity adapter, secret encryption

## Admin editing paths

- **Brand and page title:** change metadata in index.html and the header/footer/age-gate text in src/App.jsx and src/components/AgeGate.jsx.
- **Pink/black palette and fonts:** edit CSS variables and component overrides in src/index.css; Tailwind tokens live in tailwind.config.js.
- **Game art and logo:** replace public/assets/bgmi-arena.jpg, public/assets/freefire-arena.jpg and public/assets/arenax-ud-mark.png. Keep the same filenames or update src/components/GamePicker.jsx and src/App.jsx.
- **Demo tournament schedule, fee, slots and prizes:** edit the tournaments array in src/data/demo.js. In the API, an authenticated admin creates events with POST /api/tournaments; event detail/share links use the tournament slug.
- **Winners preview:** edit demoWinners in src/data/demo.js. In the API, submit verified winners after the match with PUT /api/tournaments/:slug/winners and read public announcements at GET /api/tournaments/winners?game=BGMI.
- **Payment QR and UPI ID:** save your real UPI QR image as public/payment-qr.png (PNG/JPG square, readable at 400×400 or larger). Set VITE_PAYMENT_QR_URL=/payment-qr.png and VITE_UPI_ID=your-real-upi-id in .env.local for local preview. For Render, add both as build environment variables in Dashboard → your service → Environment and redeploy. The UPI ID and QR are public by design; never put secret keys in VITE_* variables. The current checkout remains a demo until a payment gateway and verified webhook are connected.
- **Phone use:** the registration flow collects the player’s game ID, confirms the returned in-game name, then asks for the +91 phone used for prize payout/payment follow-up. The phone is stored privately on the registration and is excluded from the public roster.

The LINK control on a tournament card copies https://your-domain/?tournament=<slug>. Opening it selects that game and shows its event card. In the API, the stable event URL key is the tournament slug, available through GET /api/tournaments/:slug.

## Deploy the public site

This project can serve the built Vite site and Express API from one Render web service.

1. Create a GitHub repository and push this project. Keep .env out of Git; commit .env.example only.
2. In MongoDB Atlas, create a cluster and database user, copy the application connection string, and add the Render service’s outbound IP/network access to the Atlas IP Access List. Atlas deployments support the multi-document transactions used by this API. Restrict access to the app’s network where possible.
3. In Render, choose New → Web Service, connect the repository, and use the repository root as the Root Directory.
4. Set Build Command to npm ci && npm run build and Start Command to npm run start:api. The Express server serves dist/ and /api/*; health check path is /api/health.
5. In Render → service → Environment, set MONGODB_URI, JWT_SECRET, ROOM_CREDENTIALS_KEY, CLIENT_ORIGIN (your deployed origin), UPI_ID, VITE_UPI_ID and VITE_PAYMENT_QR_URL. Generate separate random JWT and 32-byte hex room-encryption keys; do not use the examples from .env.example.
6. Click Create Web Service. When deployment completes, open the Render URL and verify /api/health returns {"ok":true,"service":"arenax-ud-api"}. Add a custom domain from Render → Settings → Custom Domains if desired.
7. To publish later edits, push to the connected Git branch; Render rebuilds and redeploys it. Replace the QR file in Git and push it, or change the QR URL environment value and redeploy.

Render deployment guide: [Web Services](https://render.com/docs/web-services) and [Environment Variables](https://render.com/docs/configure-environment-variables). Atlas network setup: [IP Access List](https://www.mongodb.com/docs/atlas/security/ip-access-list/). For a separate Vercel frontend, see [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite); configure its SPA rewrite and the backend CORS origin.

## Production work before launch

- Replace local demo state with API-backed auth, events, registrations and roster updates.
- Add an approved payment gateway with verified webhooks; a typed UPI reference is evidence, not proof of payment.
- Replace deterministic player-name lookup with an authorized identity/organizer workflow.
- Use an age-assurance provider if self-attestation is insufficient for the operating policy.
- Add admin account provisioning, audit logs, refund/cancellation rules, notification delivery, monitoring, backups and deployment secrets.
- Review tournament rules and applicable Indian laws with qualified counsel before running paid competitions.
