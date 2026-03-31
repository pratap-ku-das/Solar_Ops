# Deploy Solar Project Management App

## Recommended: Render

1. Push this project to a GitHub repository.
2. In Render, choose **New +** -> **Blueprint**.
3. Select the repository containing this project.
4. Render will detect `render.yaml` automatically.
5. In the Render dashboard, set these environment variables:
   - `JWT_SECRET`
   - `MONGO_URI`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `MAIL_FROM`
6. Deploy the service.

## Build / Start used by Render
- **Build:** `npm install && npm install --prefix server && npm install --prefix client && npm run build --prefix client`
- **Start:** `npm start`

## Notes
- The Express server now serves the built React app in production.
- MongoDB Atlas and Gmail SMTP must be valid for live data and email reminders.
- Rotate any secrets that were shared in plain text before production deployment.
