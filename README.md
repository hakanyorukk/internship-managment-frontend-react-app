# internship-frontend

React frontend for the `sit-internship-management-project` Spring Boot backend.
Built with Vite, React Router and axios — plain CSS, no UI library.

## Pages

- `/login`, `/register` — auth against `POST /api/auth/login` and `POST /api/auth/register`
- `/companies` — list and create companies
- `/internships` — list/filter/create/delete offers, apply to an offer, view an offer's applications
- `/applications` — list all applications (or filter by student profile id), update status + comment

The JWT returned by login is kept in `localStorage` and attached to every request
as an `Authorization: Bearer <token>` header (see `src/api/client.js`).

## Project structure

```
src/
  App.jsx              routes only
  api/
    client.js          axios instance + auth-token interceptor
    index.js           the `api` object (all backend calls)
  pages/               one file per route (HomePage, LoginPage, ...)
  components/          reusable UI (Navbar, PrivateRoute)
  context/             AuthContext
  lib/                 plain helpers (parseJwt, error handling)
```

## Run

1. Start PostgreSQL and the Spring Boot backend on port 8080.
2. Then:

```bash
npm install
npm run dev
```

Vite proxies `/api` to `http://localhost:8080` (see `vite.config.js`), so no CORS
setup is needed on the backend.

## Notes

- The backend JWT contains only the email and expires after 30 minutes; the backend
  also generates a new signing key on every restart, so log in again after restarting it.
- Applying to an offer requires an existing `student_profiles` row — the backend has
  no endpoint to create one yet, so the "Student profile id" is entered manually.
