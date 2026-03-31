# Solar Project Management Web App

A full-stack Solar Project Management platform for tracking solar leads, documents, workflows, installation schedules, stock, expenses, invoices, and subsidy disbursement.

## Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose models
- **Auth:** JWT-based login
- **Email:** Nodemailer reminder service

## Demo Users
| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@solar.com` | `admin123` |
| Operations | `ops@solar.com` | `ops123` |
| BDM | `bdm@solar.com` | `bdm123` |

## Run Locally
```bash
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

The app runs in **demo mode** without MongoDB if `MONGO_URI` is not configured. Add `server/.env` from `server/.env.example` to enable persistent MongoDB storage.

## Key Features
- Multi-role dashboards for **Admin**, **Operations**, and **BDM**
- End-to-end solar project pipeline from **Proposal** to **Subsidy Disbursed**
- Customer/project onboarding form with business fields
- Document upload, preview metadata, and download-ready storage path
- Expense tracking with project-level profit/loss
- Inventory stock in/out management
- Invoice list with PDF export
- Installation scheduling with reminder email hook
- Search, filter, responsive UI, and sample analytics
