# BYT-17: Admin Pages – Internal QA Checklist

Internal QA checklist for the admin interface (Linear BYT-17).

## Access control

- [ ] **Login** – Unauthenticated users visiting `/admin` or any `/admin/*` are redirected to `/login` with a return URL.
- [ ] **Role-based access** – If `VITE_ADMIN_USERNAMES` is set (comma-separated), only those usernames can access admin; others are redirected to `/` with access denied.
- [ ] **Role-based access (no allowlist)** – If `VITE_ADMIN_USERNAMES` is unset, any authenticated Cognito user can access admin (backward compatible).
- [ ] **Sign out** – Sign out from sidebar clears session and redirects appropriately when revisiting `/admin`.

## Layout and navigation

- [ ] **Sidebar** – Dashboard, Projects, Clients, Quotes & Invoices, Contact submissions, Services links present and correct.
- [ ] **Active state** – Current page is highlighted in the sidebar.
- [ ] **Responsive** – On viewports &lt; 768px, sidebar is off-canvas; “Menu” button opens it, backdrop closes it.
- [ ] **Usability** – All admin subpages are reachable and render without errors.

## Pages

- [ ] **Dashboard** – Cards for Projects, Clients, Quotes & Invoices, Contact submissions, Services; each links to the correct subpage.
- [ ] **Projects** – Placeholder page loads; copy explains future CRUD when Project API exists.
- [ ] **Clients** – Table shows aggregated clients (from quotes + contact submissions) with name, email, last activity, status, quote count, contact count.
- [ ] **Quotes & Invoices** – Existing CRUD and tabs work (list, create, edit, delete, convert to invoice, mark paid).
- [ ] **Contact submissions** – List of contact form submissions with name, email, subject, date, snippet.
- [ ] **Services** – Existing CRUD works (list, create, edit, delete services).

## Security and config

- [ ] **Env** – `.env.example` documents optional `VITE_ADMIN_USERNAMES`; production uses it if admin should be restricted to specific users.
- [ ] **API** – Admin operations use authenticated GraphQL (Cognito); no admin data exposed to public API key.

## Future extension

- [ ] **Extensibility** – Sidebar and route structure allow adding sections (e.g. Analytics, Notifications, Audit logs) without breaking existing routes.

## Screenshots / walkthrough

- [ ] Add screenshots or a short walkthrough GIF to this repo or docs for documentation/demo (e.g. `docs/admin-screenshots/` or a single `docs/admin-walkthrough.md` with embedded images).
- Suggested captures: login screen, dashboard, sidebar (desktop and mobile open), Clients table, Quotes list, Services list.

---

**Sign-off:** _________________  
**Date:** _________________
