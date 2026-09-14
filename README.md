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
  but should not be); there is no endpoint to close an offer or for admin statistics.

<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/529dfc42-bb70-4544-a7fd-e7f70fb38e10" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/d2a164d4-74ac-4e2a-a360-33a10f77ba56" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/7efa2ac6-920c-425e-b7ee-cf95152361c7" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/3cdba13b-a94a-4e71-9dd6-69ec8f2d989a" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/2a530175-5091-4b20-a500-86d33b71e2b7" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/9acca51a-1182-45c6-8eca-5932f16dc3d5" />
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/71e0c87e-7728-4243-9d41-04a0d5a5ec01" />


  
