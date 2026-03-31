import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import CustomersPage from "./pages/CustomersPage";
import StockPage from "./pages/StockPage";
import ExpensesPage from "./pages/ExpensesPage";
import InvoicesPage from "./pages/InvoicesPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/team" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
