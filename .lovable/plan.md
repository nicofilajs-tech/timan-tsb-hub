
# Timan TSB Portal — Plan

A B2B portal for managing Technical Service Bulletins for construction machinery, with Danish as the default language and a strict brand system.

## Design system setup

Add brand tokens to `src/styles.css` as semantic CSS variables wired into Tailwind v4 `@theme`:
- `--timan-red: #C8102E`, `--timan-green: #00844A`
- `--page-bg: #F5F7F6`, `--border-soft: #E5E7EB`
- `--text-primary: #111827`, `--text-secondary: #6B7280`
- Status palettes (success/warning/danger/info/neutral bg+fg pairs)

Build small reusable primitives in `src/components/`:
- `TimanLogo` — white rounded box, italic bold red "TIMAN" with green triangle accent
- `BrandHeader` — logo + "TSB Portal" title + company subtitle slot
- `StatusBadge` — pill variants (success/warning/danger/info/neutral)
- `StatCard` — label + big number, optional warning/danger color variant
- Tweak `button` and `checkbox` shadcn variants to match brand (green primary, custom checkmark)

## Layout shells

- `AuthLayout` (centered logo + card) for `/login` and `/reset-password`
- `AppLayout` with collapsible left sidebar (white) + top header (breadcrumbs left, avatar circle right) + page-bg main area. Used for all dealer + admin routes.

Sidebar variants:
- Dealer sidebar: Dashboard, Mine sager, Historik
- Admin sidebar: Dashboard, TSB'er, Forhandlere, Maskiner, Brugere, Indstillinger

## Routing (TanStack file-based, flat dot syntax)

Public:
- `routes/login.tsx` — fully built
- `routes/reset-password.tsx` — minimal shell

Dealer (under AppLayout):
- `routes/dashboard.tsx` — fully built
- `routes/cases.$id.tsx` — fully built (with mock data for `TSB-2026-108`)
- `routes/history.tsx` — minimal shell

Timan admin:
- `routes/admin.dashboard.tsx`
- `routes/admin.tsb.tsx`, `routes/admin.tsb.new.tsx`, `routes/admin.tsb.$id.tsx`
- `routes/admin.dealers.tsx`, `routes/admin.machines.tsx`, `routes/admin.users.tsx`, `routes/admin.settings.tsx`

All admin/history shells: branded header + sidebar + simple "Kommer snart" placeholder card so navigation works end-to-end.

The `routes/index.tsx` placeholder will redirect to `/login`.

## i18n

Install `i18next` + `react-i18next`. Set up `src/i18n/index.ts` with `da` (default), `sv`, `en`, `de` resource files. All Danish copy from the spec lives in `da.json`; other locales seeded with the same keys (English fallback values for now, ready for translation). Language stored in localStorage; not exposed in UI yet (can add a switcher later).

## Pages built fully (Danish, mock data)

### `/login`
Centered card on page-bg:
- Logo (TimanLogo) above
- "Log ind på TSB Portal" heading
- Email + password fields (branded inputs, green focus glow)
- Green primary "Log ind" button (full width)
- "eller" divider
- Secondary "Log ind med Microsoft" button with MS icon
- Green link "Glemt adgangskode?" → `/reset-password`

Submit → navigate to `/dashboard` (mock, no auth yet).

### `/dashboard` (dealer)
- Top header: breadcrumb "Dashboard"; avatar "LJ" (green circle) with "Lars Jensen / Dealer Admin" popover
- Brand header subtitle: "Nordic Machinery Aps"
- Page title "Dashboard" in timan-red
- 4 stat cards row: Aktive sager 4 / Åbne maskiner 27 / Nær deadline 2 (yellow border + amber text) / Forsinket 1 (red border + red text)
- "Dine TSB'er" card: title left, search input right, table below with the 4 specified rows, monospace TSB numbers, deadline color-coding (orange for "3 dage", red for "4 dage over"), correct status badges
- Row click → `/cases/:id`

### `/cases/TSB-2026-108`
- Breadcrumb: green "Dashboard" link / "TSB-2026-108"
- Header card: yellow "Severity 3" badge + "TSB-2026-108 · v1.1" muted line, title "Softwareopdatering — styreenhed v3.2", subtitle "Accepteret 12. marts 2026 af Lars Jensen", outline "Åbn PDF (dansk) ↗" button top-right
- 3 summary cards: Maskiner 12 / Udført "7 af 12 (58%)" in green / Deadline "14. maj" + muted "(27 dage)"
- Maskiner card: "Maskiner" title + search + green "Marker som udført" button; table with checkbox column (first two pre-checked, disabled-look since done), monospace serial numbers, model, customer, status badge per row matching spec

## Out of scope (this iteration)
- Real Supabase auth/data (user said "connect later")
- Functional language switcher UI, RBAC, PDF rendering, working search/filter logic
- Full builds of admin pages and history page
