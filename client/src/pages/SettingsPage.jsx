export default function SettingsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <h3 className="text-lg font-semibold">System Settings</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>• JWT-secured routes with role-based access for Admin, Operations, and BDM.</p>
          <p>• MongoDB-backed schemas with demo fallback if `MONGO_URI` is unavailable.</p>
          <p>• Nodemailer hooks are ready for installation and approval reminders.</p>
          <p>• Local file storage is enabled under `server/uploads`.</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold">Next Configuration Steps</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>1. Copy `server/.env.example` to `server/.env`.</p>
          <p>2. Add your `MONGO_URI` and SMTP credentials.</p>
          <p>3. Run `npm run seed` to push sample records into MongoDB.</p>
          <p>4. Replace local file storage with AWS S3 if needed.</p>
        </div>
      </div>
    </div>
  );
}
