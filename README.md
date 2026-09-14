# internship-frontend

React frontend for the `sit-internship-management-project` Spring Boot backend.
Built with Vite, React Router and axios plain CSS, no UI library.

## Pages

Every page shows only what the logged-in role is allowed to do (the backend checks it too).

| Page | STUDENT | COMPANY | ADMIN |
|---|---|---|---|
| `/internships` | browse active offers, search + filter by city / work type / skill, apply | create, edit, delete own offers | see all offers |
| `/applications` | own applications with status and company comment | applications to own offers, change status + comment | see all applications |
| `/companies` | list | register own company | accept / reject companies |
| `/profile` | edit faculty number, specialty, course, skills | — | — |
| `/` (home) | quick links | quick links | platform statistics + quick links |

`/login` and `/register` use `POST /api/auth/login` and `POST /api/auth/register`.

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
  components/          reusable UI (Navbar, PrivateRoute, StatusBadge)
  context/             AuthContext
  lib/                 plain helpers (parseJwt, error messages, formatEnum, formatDate)
  index.css            colours (CSS variables), buttons, inputs
  App.css              layout, cards, tables, badges
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

- The JWT contains the email and role and expires after 30 minutes. The backend creates a
  new signing key on every restart; when a request gets `401` the app logs you out and
  opens the login page.
- A company must be **accepted by an admin** before it can post offers.
- Search and filters on the internships page run in the browser on the loaded list.
- Known backend limitations: creating a company and creating/editing an offer currently
  fail validation (`CompanyRequest.id` and `InternshipOfferRequest.companyId` are required
  but should not be); there is no endpoint to close an offer.

<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/3b288a76-a717-4684-b1d9-17511c293a52" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/542b3c3e-100e-4b04-b76c-7bad45494916" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/b74e98b5-b763-45fe-b749-79c8e67d6fd9" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/9172788c-80b8-43a2-be08-5bd35b8ca544" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/56f7ecc5-e081-42fc-9cda-6c51fe284ed6" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/b20d92f6-5942-4689-9a6c-27c230b70c74" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/a0a85bc4-5eba-4034-b13e-57b326710431" />


