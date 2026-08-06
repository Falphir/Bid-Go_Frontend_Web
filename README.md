# Bid&Go — Web Frontend

React single-page app for **Bid&Go**, a freight transport bidding platform. Companies post transport requests; independent drivers bid on them; the company picks a winner either by hand or by letting the backend's scoring algorithm choose when bidding closes. This repository is the browser client — it holds no business logic of its own and talks to the [Bid&Go backend](https://github.com/Falphir/Bid-Go_Backend) over REST.

Built with React 19 and Create React App. Originally a team university project (see [Credits](#credits)).

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node](https://img.shields.io/badge/Node-%E2%89%A520.10-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/tests-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://bid-go-frontend-web.vercel.app/)

**Live demo:** [bid-go-frontend-web.vercel.app](https://bid-go-frontend-web.vercel.app/) — the login page offers one-click sign-in as a sample company or driver, so no registration is needed.

---

## Contents

- [How it works](#how-it-works)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Running locally](#running-locally)
- [Configuration](#configuration)
- [Routes](#routes)
- [Talking to the API](#talking-to-the-api)
- [Tests](#tests)
- [Generated documentation](#generated-documentation)
- [CI](#ci)
- [Deployment](#deployment)
- [Notes and limitations](#notes-and-limitations)
- [Credits](#credits)

---

## How it works

There are two kinds of user, and the UI adapts to whichever one is signed in. The role comes from a `userType` claim on the JWT, read by the `useMe` hook — the same claim the backend uses to authorize the underlying endpoints.

- **Company** — posts a transport request (cargo, dimensions, origin, destination, pickup/delivery dates, maximum price, bidding window), reviews incoming bids, accepts or rejects them, and follows the transport to completion.
- **Driver** — browses and filters open transport requests, places and edits bids, and updates the transport status as the job progresses.

A typical session:

1. The user signs in on `/Login`; the JWT is stored in `localStorage` when *remember me* is checked.
2. The home page (`/`) renders a grid of transport cards — the company's own requests, or the open requests a driver can bid on, with a filters panel.
3. A company creates a request on `/createRequest`, either as a draft or published straight away.
4. On `/transportRequest/:id`, a driver submits a bid and a company reviews the bid list and accepts or rejects one.
5. `/myBids`, `/notifications` and `/history` cover the driver's own bids, the notification feed, and completed transports for either role.

The same screens are reused for both roles wherever the data allows it; role checks (`isDriver` / `isCompany`) decide which actions are rendered.

## Architecture

A conventional layered React app, with each layer depending only on the one below it:

```
src/pages/        One component per route; composes components and hooks
src/components/   Presentational and form components, grouped by area
src/hooks/        Data fetching and screen state (useTransports, useMe, ...)
src/services/     One module per backend resource; the only place URLs appear
src/api/          The shared axios instance (base URL, auth header, 401 handling)
src/utils/        Status mapping, response normalizers, error formatting
src/styles/       Per-page stylesheets; components ship their own CSS alongside
```

Pages hold almost no logic. Anything asynchronous lives in a hook, which returns `{ data, loading, error }` plus whatever actions the screen needs, and every hook wires an `AbortController` into the request so an unmounted screen cancels its work instead of setting state after the fact. Hooks call services, services call the axios instance, and only services know endpoint paths — so a backend route change touches exactly one file.

Two cross-cutting pieces sit outside that chain:

- **`ToastContext`** — a provider mounted in `App.js` that exposes `showToast(message, type)` to the whole tree, so success and error feedback does not have to be threaded through props.
- **`api/axiosConfig.js`** — the axios instance that attaches the bearer token to every request and, on any `401` other than a failed login, clears the token and redirects to the login page. That interceptor is what enforces authentication; there is no route guard component.

Responses are run through `utils/normalizers.js` before reaching the UI, because the API returns a few fields under inconsistent names across endpoints.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React 19 |
| Build tooling | Create React App (`react-scripts` 5), CRACO for instrumented builds |
| Routing | React Router 7 (`BrowserRouter`) |
| HTTP | axios, with request/response interceptors |
| Styling | Plain CSS, one stylesheet per page/component |
| Icons | Font Awesome + react-icons |
| Image cropping | react-easy-crop (avatar upload) |
| Unit tests | Jest + React Testing Library (via `react-scripts test`) |
| End-to-end tests | Playwright, with MySQL assertions through `mysql2` |
| Coverage | babel-plugin-istanbul + nyc |
| API docs | JSDoc |

## Running locally

**Prerequisites:** Node ≥ 20.10 and npm ≥ 10 (enforced by `engines` in `package.json`).

```bash
npm ci
npm start
```

The app runs at <http://localhost:3000>.

It needs a backend to talk to. The committed `.env` points at the public demo API, so `npm start` works out of the box against the deployed backend. To run against a backend on your own machine, change `REACT_APP_API_URL` to its address — see below.

## Configuration

Configuration is entirely through Create React App environment variables, which must be prefixed with `REACT_APP_` to be exposed to the bundle. They are **inlined at build time**, not read at runtime, so changing one means restarting the dev server or rebuilding.

| Variable | Required | Purpose |
|---|---|---|
| `REACT_APP_API_URL` | **Yes** | Base URL of the backend API, including the `/api` suffix. Without it every request goes to a relative path and fails. |
| `REACT_APP_DEMO_MODE` | No | Set to `true` to render the one-click demo sign-in panel on the login page. Anything else hides it. |

`.env` is committed and holds the demo backend URL; it contains no secrets, and none should be added — anything in a `REACT_APP_` variable is readable in the shipped JavaScript.

For a local backend, create `.env.development`, which CRA picks up automatically in development and which takes precedence over `.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Note that `.gitignore` only excludes the `.local` variants, so `.env.development` is *not* ignored — keep secrets out of it. `npm run start:cloud` is the same dev server forced through `env-cmd` with the committed `.env`, which is useful when you want the demo backend regardless of what your local env files say.

The end-to-end tests read `.env.development` as well, and additionally need database credentials — see [Tests](#tests).

## Routes

Routing is declared in [src/AppRouter.js](src/AppRouter.js). Routes nested under `/` render inside `App`, which supplies the navbar and the toast provider; the authentication routes render standalone.

| Path | Page | Who it is for |
|---|---|---|
| `/` | Transport request grid | Company sees its own requests; driver sees open ones with filters |
| `/createRequest` | Create transport request | Company |
| `/transportRequest/:id` | Request details, bid list, bid actions | Both, with role-specific actions |
| `/myBids` | The driver's own bids | Driver |
| `/history` | Completed transports | Both |
| `/notifications` | Notification feed with filters | Both |
| `/profile` | Profile, avatar, documents, password, deactivation | Both |
| `/Login`, `/register`, `/recover` | Authentication | Anonymous |
| `*` | Not found | — |

## Talking to the API

Every request goes through the shared axios instance in [src/api/axiosConfig.js](src/api/axiosConfig.js), which:

- prefixes `REACT_APP_API_URL`,
- attaches `Authorization: Bearer <token>` when a token is in `localStorage`,
- and on a `401` that is not a login attempt, clears the token and sends the user to the login page.

Services map one-to-one onto backend resources:

| Service | Endpoints it wraps |
|---|---|
| `authService` | `/auth/login`, `/register/driver`, `/register/company`, `/auth/recover-password`, `/auth/reset-password` |
| `transportsService` | `/transports/*`, including drafts, company listings and status changes |
| `bidsService` | `/bids/createBid`, `/bids/updatebid`, `/bids/cancel`, `/bids/manual/:id/:action` |
| `profileService` | `/profile/:id`, profile updates, account deactivation |
| `notificationsService` | `/notifications`, mark-read and mark-all-read |
| `historyService` | `/history/company/:id`, `/history/driver/:id` |

Errors from any of them are funnelled through `getApiErrorMessage` in [src/utils/httpError.js](src/utils/httpError.js), which flattens the several error shapes ASP.NET Core can return — validation dictionaries, RFC 7807 payloads, plain strings — into one message the UI can display.

## Tests

**Unit tests** run through Create React App:

```bash
npm test
```

**End-to-end tests** are Playwright system tests that drive the real UI in Chromium and then assert against the database directly:

```bash
npm run e2e
```

Playwright starts the dev server itself (`env-cmd -f .env.development npm start` on port 3000), so `.env.development` must exist and point at a running backend. The specs in `tests/` cover the main flows end to end — registering a company, creating a transport, registering a driver, bidding, and updating a transport's status — each one cleaning up the rows it created in teardown.

Because they verify persisted state, they also need database credentials in the environment (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), consumed by the `mysql2` pool in [tests/utilis/db.js](tests/utilis/db.js). Point these at a **test database**, never a production one: the specs insert and delete rows.

Useful variants:

```bash
npm run e2e:debug        # headed, with the Playwright inspector
npm run e2e:coverage     # run, then write an HTML/lcov coverage report
npm run start:coverage   # dev server instrumented with istanbul, for coverage runs
```

Coverage works by building the app through CRACO with `babel-plugin-istanbul` enabled, collecting `window.__coverage__` after each Playwright test ([tests/coverage-helper.js](tests/coverage-helper.js)), and merging the results with nyc. The helper scripts in `tests/utilis/` render the HTML and PDF execution and coverage reports checked into `reports/`.

## Generated documentation

The source is annotated with JSDoc throughout — every hook, service and component has a doc comment describing its parameters and return shape.

```bash
npm run docs
```

writes a browsable API reference to `docs/api/`.

## CI

One GitHub Actions workflow, [.github/workflows/react-ci.yml](.github/workflows/react-ci.yml):

| Workflow | Trigger | What it does |
| --- | --- | --- |
| **React CI/CD** | Push to `main`, `develop`, `feature/**`, `changerequest/**`; PRs to `main` and `develop` | Installs with `npm ci`, builds the production bundle, and uploads it as a `react-build` artifact. |

The end-to-end job was removed from CI, since it needs a live backend and a reachable test database; run it locally instead. Deployment is handled by Vercel rather than by a workflow.

## Deployment

The build output is a static bundle — `npm run build` produces `build/`, which any static host can serve.

The only host-specific requirement is a **SPA rewrite**: React Router owns the URLs, so every path must serve `index.html` or a refresh on `/profile` returns a 404. [vercel.json](vercel.json) does that:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

The live demo runs on **Vercel**, with `REACT_APP_API_URL` pointing at the Render-hosted backend and `REACT_APP_DEMO_MODE=true` to enable the one-click sign-in panel. Set both as environment variables in the Vercel project, not in a committed file — remember that CRA inlines them at build time, so changing either requires a redeploy.

The demo is always on: Vercel serves the bundle from its edge with nothing to wake up, and the backend is kept warm by a scheduled ping despite running on a free tier that would otherwise spin down. Opening the link should load and sign in immediately.

## Credits

Bid&Go was built as a team project for the Software Development Laboratory course. The full commit history in this repository preserves everyone's contributions.

Originally developed under the [LDSGrupo04](https://github.com/LDSGrupo04) organization. This repository is a mirror maintained for demo and portfolio purposes.
