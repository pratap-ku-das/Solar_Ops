
import { useEffect, useState } from "react";
import { generateInvoicePDF } from "../utils/invoiceTemplate";
import api from "../api/api";

const initialForm = {
  customerName: "",
  projectName: "",
  projectSize: "1kW",
  status: "Pending",
  items: [
    { name: "", hsn: "", unit: "Nos", qty: 1, rate: 0, gst: 0 }
  ]
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [totals, setTotals] = useState({ total: 0, cgst: 0, sgst: 0, grand: 0 });
  const [editIdx, setEditIdx] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", date: "" });

  const fetchInvoices = async () => {
    const { data } = await api.get("/invoices");
    setInvoices(data);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);


  // Calculate totals, CGST, SGST
  useEffect(() => {
    let total = 0, cgst = 0, sgst = 0;
    form.items.forEach(item => {
      const amount = (item.qty || 0) * (item.rate || 0);
      const gstAmt = amount * (item.gst || 0) / 100;
      total += amount;
      cgst += gstAmt / 2;
      sgst += gstAmt / 2;
    });
    setTotals({ total, cgst, sgst, grand: total + cgst + sgst });
  }, [form.items]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (editIdx !== null) {
      // Update existing invoice
      const invoice = invoices[editIdx];
      await api.put(`/invoices/${invoice._id}`, { ...form, totalAmount: totals.grand });
      setEditIdx(null);
    } else {
      // Create new invoice
      await api.post("/invoices", { ...form, totalAmount: totals.grand });
    }
    setForm(initialForm);
    fetchInvoices();
  };

  const handleEditInvoice = (idx) => {
    setEditIdx(idx);
    setForm(invoices[idx]);
  };

  const handleAddPayment = async (invoiceId) => {
    if (!paymentForm.amount || !paymentForm.date) return;
    await api.post(`/invoices/${invoiceId}/payments`, paymentForm);
    setPaymentForm({ amount: "", date: "" });
    fetchInvoices();
  };

  const handleItemChange = (idx, field, value) => {
    setForm(prev => {
      const items = prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { name: "", hsn: "", unit: "Nos", qty: 1, rate: 0, gst: 0 }] }));
  };

  const removeItem = (idx) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const exportPdf = (invoice) => {
    generateInvoicePDF(invoice);
  };

  return (
    <div className="space-y-6">

      <form onSubmit={handleCreate} className="card space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="input" placeholder="Customer name" value={form.customerName} onChange={e => setForm(prev => ({ ...prev, customerName: e.target.value }))} required />
          <input className="input" placeholder="Project name" value={form.projectName} onChange={e => setForm(prev => ({ ...prev, projectName: e.target.value }))} required />
          <select className="input" value={form.projectSize} onChange={e => setForm(prev => ({ ...prev, projectSize: e.target.value }))}>
            <option>1kW</option>
            <option>2kW</option>
            <option>3kW</option>
            <option>4kW</option>
            <option>5kW</option>
            <option>10kW</option>
          </select>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Invoice Items</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-2 py-1">Item Name</th>
                  <th className="px-2 py-1">HSN Code</th>
                  <th className="px-2 py-1">Unit</th>
                  <th className="px-2 py-1">Qty</th>
                  <th className="px-2 py-1">Rate</th>
                  <th className="px-2 py-1">GST %</th>
                  <th className="px-2 py-1">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => {
                  const amount = (item.qty || 0) * (item.rate || 0);
                  return (
                    <tr key={idx}>
                      <td><input className="input" value={item.name} onChange={e => handleItemChange(idx, "name", e.target.value)} required /></td>
                      <td><input className="input" value={item.hsn} onChange={e => handleItemChange(idx, "hsn", e.target.value)} /></td>
                      <td><input className="input" value={item.unit} onChange={e => handleItemChange(idx, "unit", e.target.value)} /></td>
                      <td><input className="input" type="number" min="1" value={item.qty} onChange={e => handleItemChange(idx, "qty", Number(e.target.value))} required /></td>
                      <td><input className="input" type="number" min="0" value={item.rate} onChange={e => handleItemChange(idx, "rate", Number(e.target.value))} required /></td>
                      <td><input className="input" type="number" min="0" value={item.gst} onChange={e => handleItemChange(idx, "gst", Number(e.target.value))} required /></td>
                      <td className="text-right">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td>{form.items.length > 1 && <button type="button" className="text-red-500" onClick={() => removeItem(idx)}>✕</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn-secondary mt-2" onClick={addItem}>+ Add Item</button>
        </div>
        <div className="flex flex-wrap gap-6 mt-4">
          <div>Total: <span className="font-semibold">₹{totals.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
          <div>CGST: <span className="font-semibold">₹{totals.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
          <div>SGST: <span className="font-semibold">₹{totals.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
          <div>Grand Total: <span className="font-bold text-brand-700">₹{totals.grand.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
        </div>
        <button className="btn-primary mt-4" type="submit">Generate Invoice</button>
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
                <td className="px-3 py-3 flex flex-col gap-2">
                  <button className="btn-secondary" onClick={() => exportPdf(invoice)}>Export PDF</button>
                  <button className="btn-secondary" onClick={() => handleEditInvoice(idx)}>Edit</button>
                  <details>
                    <summary className="cursor-pointer text-xs text-brand-700">Payments</summary>
                    <div className="space-y-1 mt-2">
                      {(invoice.payments || []).map((p, i) => (
                        <div key={i} className="text-xs">{p.date}: ₹{Number(p.amount).toLocaleString("en-IN")}</div>
                      ))}
                      <div className="flex gap-1 mt-1">
                        <input className="input" style={{width:80}} type="number" min="1" placeholder="Amount" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} />
                        <input className="input" style={{width:120}} type="date" value={paymentForm.date} onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))} />
                        <button type="button" className="btn-secondary" onClick={() => handleAddPayment(invoice._id)}>Add</button>
                      </div>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
