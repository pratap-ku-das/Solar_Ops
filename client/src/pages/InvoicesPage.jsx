import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api/api";

const initialForm = {
  customerName: "",
  projectName: "",
  projectSize: "1kW",
  amount: "",
  status: "Pending"
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(initialForm);

  const fetchInvoices = async () => {
    const { data } = await api.get("/invoices");
    setInvoices(data);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    await api.post("/invoices", form);
    setForm(initialForm);
    fetchInvoices();
  };

  const exportPdf = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Solar Project Invoice", 14, 18);
    doc.setFontSize(11);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 28);
    doc.text(`Customer: ${invoice.customerName}`, 14, 35);
    doc.text(`Project: ${invoice.projectName}`, 14, 42);

    autoTable(doc, {
      startY: 52,
      head: [["Project Size", "Amount", "Status"]],
      body: [[invoice.projectSize, `INR ${invoice.amount}`, invoice.status]]
    });

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="card grid gap-3 md:grid-cols-5">
        <input className="input" placeholder="Customer name" value={form.customerName} onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))} required />
        <input className="input" placeholder="Project name" value={form.projectName} onChange={(e) => setForm((prev) => ({ ...prev, projectName: e.target.value }))} required />
        <select className="input" value={form.projectSize} onChange={(e) => setForm((prev) => ({ ...prev, projectSize: e.target.value }))}>
          <option>1kW</option>
          <option>2kW</option>
          <option>3kW</option>
          <option>4kW</option>
          <option>5kW</option>
          <option>10kW</option>
        </select>
        <input className="input" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required />
        <button className="btn-primary" type="submit">Generate Invoice</button>
      </form>

      <div className="card overflow-x-auto">
        <h3 className="mb-4 text-lg font-semibold">Invoices</h3>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Invoice No</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Project</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="border-t border-slate-200">
                <td className="px-3 py-3 font-medium">{invoice.invoiceNumber}</td>
                <td className="px-3 py-3">{invoice.customerName}</td>
                <td className="px-3 py-3">{invoice.projectName}<br /><span className="text-xs text-slate-500">{invoice.projectSize}</span></td>
                <td className="px-3 py-3">₹{Number(invoice.amount || 0).toLocaleString("en-IN")}</td>
                <td className="px-3 py-3"><span className="badge bg-slate-100 text-slate-700">{invoice.status}</span></td>
                <td className="px-3 py-3"><button className="btn-secondary" onClick={() => exportPdf(invoice)}>Export PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
