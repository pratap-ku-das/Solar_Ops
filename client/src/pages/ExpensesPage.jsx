import { useEffect, useState } from "react";
import api from "../api/api";

const initialForm = {
  projectName: "",
  materialCost: 0,
  laborCost: 0,
  transportCost: 0
};

const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

function Field({ label, children, className = "" }) {
  return (
    <label className={`space-y-1.5 ${className}`}>
      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(initialForm);

  const fetchExpenses = async () => {
    const { data } = await api.get("/expenses");
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post("/expenses", form);
    setForm(initialForm);
    fetchExpenses();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card grid gap-3 md:grid-cols-5">
        <Field label="Project name" className="md:col-span-2">
          <input className="input" value={form.projectName} onChange={(e) => setForm((prev) => ({ ...prev, projectName: e.target.value }))} required />
        </Field>
        <Field label="Material cost">
          <input className="input" type="number" min="0" value={form.materialCost} onChange={(e) => setForm((prev) => ({ ...prev, materialCost: e.target.value }))} />
        </Field>
        <Field label="Labor cost">
          <input className="input" type="number" min="0" value={form.laborCost} onChange={(e) => setForm((prev) => ({ ...prev, laborCost: e.target.value }))} />
        </Field>
        <Field label="Transport cost">
          <input className="input" type="number" min="0" value={form.transportCost} onChange={(e) => setForm((prev) => ({ ...prev, transportCost: e.target.value }))} />
        </Field>
        <div className="md:col-span-5 flex justify-end">
          <button className="btn-primary" type="submit">Add Expense</button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Material Cost</p><h3 className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(expenses.reduce((sum, item) => sum + Number(item.materialCost || 0), 0))}</h3></div>
        <div className="card"><p className="text-sm text-slate-500">Labor Cost</p><h3 className="mt-2 text-2xl font-bold text-amber-600">{formatCurrency(expenses.reduce((sum, item) => sum + Number(item.laborCost || 0), 0))}</h3></div>
        <div className="card"><p className="text-sm text-slate-500">Transport Cost</p><h3 className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(expenses.reduce((sum, item) => sum + Number(item.transportCost || 0), 0))}</h3></div>
      </div>

      <div className="space-y-3 md:hidden">
        {expenses.map((expense) => (
          <div key={expense._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{expense.projectName}</p>
                <p className="mt-1 text-xs text-slate-500">Revenue: {formatCurrency(expense.projectCost)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${expense.profitOrLoss >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {formatCurrency(expense.profitOrLoss)}
              </span>
            </div>
            <div className="mt-3 grid gap-1 text-sm text-slate-600">
              <p>Material: {formatCurrency(expense.materialCost)}</p>
              <p>Labor: {formatCurrency(expense.laborCost)}</p>
              <p>Transport: {formatCurrency(expense.transportCost)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card hidden overflow-x-auto md:block">
        <h3 className="mb-4 text-lg font-semibold">Project Profit / Loss</h3>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Project</th>
              <th className="px-3 py-2">Total Cost</th>
              <th className="px-3 py-2">Project Revenue</th>
              <th className="px-3 py-2">Profit / Loss</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id} className="border-t border-slate-200">
                <td className="px-3 py-3 font-medium">{expense.projectName}</td>
                <td className="px-3 py-3">{formatCurrency(expense.totalCost)}</td>
                <td className="px-3 py-3">{formatCurrency(expense.projectCost)}</td>
                <td className={`px-3 py-3 font-semibold ${expense.profitOrLoss >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(expense.profitOrLoss)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
