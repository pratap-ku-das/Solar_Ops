import { useEffect, useState } from "react";
import api from "../api/api";

const initialForm = {
  projectName: "",
  materialCost: 0,
  laborCost: 0,
  transportCost: 0
};

const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

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
        <input className="input md:col-span-2" placeholder="Project name" value={form.projectName} onChange={(e) => setForm((prev) => ({ ...prev, projectName: e.target.value }))} required />
        <input className="input" type="number" placeholder="Material" value={form.materialCost} onChange={(e) => setForm((prev) => ({ ...prev, materialCost: e.target.value }))} />
        <input className="input" type="number" placeholder="Labor" value={form.laborCost} onChange={(e) => setForm((prev) => ({ ...prev, laborCost: e.target.value }))} />
        <input className="input" type="number" placeholder="Transport" value={form.transportCost} onChange={(e) => setForm((prev) => ({ ...prev, transportCost: e.target.value }))} />
        <div className="md:col-span-5 flex justify-end">
          <button className="btn-primary" type="submit">Add Expense</button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Material Cost</p><h3 className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(expenses.reduce((sum, item) => sum + Number(item.materialCost || 0), 0))}</h3></div>
        <div className="card"><p className="text-sm text-slate-500">Labor Cost</p><h3 className="mt-2 text-2xl font-bold text-amber-600">{formatCurrency(expenses.reduce((sum, item) => sum + Number(item.laborCost || 0), 0))}</h3></div>
        <div className="card"><p className="text-sm text-slate-500">Transport Cost</p><h3 className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(expenses.reduce((sum, item) => sum + Number(item.transportCost || 0), 0))}</h3></div>
      </div>

      <div className="card overflow-x-auto">
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
