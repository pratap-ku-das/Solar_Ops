import { Bell, Download, Eye, Filter, Plus, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { generateInvoicePDF } from "../utils/invoiceTemplate";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  customerName: "",
  projectName: "",
  projectSize: "1kW",
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  paymentTerms: "Net 15 Days",
  status: "Pending",
  items: [
    { name: "", hsn: "", unit: "Nos", qty: 1, rate: 0, gst: 0 }
  ]
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const statusBadge = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700"
};

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [totals, setTotals] = useState({ total: 0, cgst: 0, sgst: 0, grand: 0 });
  const [editIdx, setEditIdx] = useState(null);
  const [paymentDrafts, setPaymentDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [invoiceRes, projectRes] = await Promise.all([api.get("/invoices"), api.get("/projects")]);
    setInvoices(Array.isArray(invoiceRes.data) ? invoiceRes.data : []);
    setProjects(Array.isArray(projectRes.data) ? projectRes.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
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

  const normalizeInvoice = (invoice) => {
    const paidAmount = (invoice.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalAmount = Number(invoice.amount || 0);
    let derivedStatus = invoice.status || "Pending";
    if (paidAmount >= totalAmount && totalAmount > 0) {
      derivedStatus = "Paid";
    } else if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && paidAmount < totalAmount) {
      derivedStatus = "Overdue";
    }

    return {
      ...invoice,
      paidAmount,
      pendingAmount: Math.max(0, totalAmount - paidAmount),
      derivedStatus
    };
  };

  const normalizedInvoices = useMemo(() => invoices.map(normalizeInvoice), [invoices]);

  const dashboard = useMemo(() => {
    const totalInvoices = normalizedInvoices.length;
    const totalInvoiceAmount = normalizedInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const paidAmount = normalizedInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pendingAmount = Math.max(0, totalInvoiceAmount - paidAmount);
    const overdueInvoices = normalizedInvoices.filter((inv) => inv.derivedStatus === "Overdue");
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.pendingAmount, 0);
    const pendingCount = normalizedInvoices.filter((inv) => inv.derivedStatus === "Pending").length;
    const paidCount = normalizedInvoices.filter((inv) => inv.derivedStatus === "Paid").length;

    return {
      totalInvoices,
      totalInvoiceAmount,
      paidAmount,
      pendingAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount,
      pendingCount,
      paidCount
    };
  }, [normalizedInvoices]);

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalizedInvoices.filter((inv) => {
      const matchesSearch =
        !q ||
        [inv.invoiceNumber, inv.customerName, inv.projectName]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      const matchesStatus = statusFilter === "All" || inv.derivedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalizedInvoices, search, statusFilter]);

  const recentPayments = useMemo(() => {
    return normalizedInvoices
      .flatMap((inv) =>
        (inv.payments || []).map((pay, idx) => ({
          key: `${inv._id}-${idx}`,
          customerName: inv.customerName,
          invoiceNumber: inv.invoiceNumber,
          amount: Number(pay.amount || 0),
          date: pay.date
        }))
      )
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 5);
  }, [normalizedInvoices]);

  const projectOptions = useMemo(() => {
    return projects.map((project) => ({
      id: project._id,
      customerName: project.customerName || "",
      projectName: project.name || project.projectName || "",
      projectSize: project.projectSize || "1kW"
    }));
  }, [projects]);

  const handleProjectSelect = (value) => {
    const selected = projectOptions.find((p) => p.id === value);
    if (!selected) return;
    setForm((prev) => ({
      ...prev,
      projectName: selected.projectName,
      customerName: selected.customerName || prev.customerName,
      projectSize: selected.projectSize || prev.projectSize
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      amount: totals.grand,
      items: form.items.map((item) => ({
        ...item,
        qty: Number(item.qty || 0),
        rate: Number(item.rate || 0),
        gst: Number(item.gst || 0)
      }))
    };

    if (editIdx !== null) {
      // Update existing invoice
      const invoice = invoices[editIdx];
      await api.put(`/invoices/${invoice._id}`, payload);
      setEditIdx(null);
    } else {
      // Create new invoice
      await api.post("/invoices", payload);
    }
    setForm(initialForm);
    fetchData();
  };

  const handleEditInvoice = (idx) => {
    setEditIdx(idx);
    const invoice = invoices[idx];
    setForm({
      customerName: invoice.customerName || "",
      projectName: invoice.projectName || "",
      projectSize: invoice.projectSize || "1kW",
      invoiceDate: invoice.invoiceDate || new Date().toISOString().slice(0, 10),
      dueDate: invoice.dueDate || "",
      paymentTerms: invoice.paymentTerms || "Net 15 Days",
      status: invoice.status || "Pending",
      items: Array.isArray(invoice.items) && invoice.items.length ? invoice.items : [{ name: "", hsn: "", unit: "Nos", qty: 1, rate: 0, gst: 0 }]
    });
  };

  const handleAddPayment = async (invoiceId, pendingAmount) => {
    const draft = paymentDrafts[invoiceId] || { amount: "", date: "" };
    if (!draft.amount || !draft.date) return;
    const paymentAmount = Number(draft.amount || 0);
    await api.post(`/invoices/${invoiceId}/payments`, { amount: paymentAmount, date: draft.date });

    const target = normalizedInvoices.find((inv) => inv._id === invoiceId);
    if (target) {
      const totalPaid = target.paidAmount + paymentAmount;
      let nextStatus = target.status || "Pending";
      if (totalPaid >= Number(target.amount || 0)) nextStatus = "Paid";
      else if (target.dueDate && new Date(target.dueDate) < new Date() && pendingAmount - paymentAmount > 0) nextStatus = "Overdue";
      else nextStatus = "Pending";
      await api.put(`/invoices/${invoiceId}`, { status: nextStatus });
    }

    setPaymentDrafts((prev) => ({ ...prev, [invoiceId]: { amount: "", date: "" } }));
    fetchData();
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

  const handleCancelEdit = () => {
    setEditIdx(null);
    setForm(initialForm);
  };

  const activeEditInvoice = editIdx !== null ? invoices[editIdx] : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-xl font-bold text-slate-900">Invoice Management</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input min-w-64 pl-9"
                placeholder="Search invoice, customer, project"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <UserRound size={16} />
              {user?.name || "Admin"}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Invoices</p><p className="mt-2 text-2xl font-bold text-slate-900">{dashboard.totalInvoices}</p></div>
        <div className="card"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Invoice Amount</p><p className="mt-2 text-2xl font-bold text-blue-700">{formatCurrency(dashboard.totalInvoiceAmount)}</p></div>
        <div className="card"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Amount</p><p className="mt-2 text-2xl font-bold text-amber-700">{formatCurrency(dashboard.pendingAmount)}</p></div>
        <div className="card"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid Amount</p><p className="mt-2 text-2xl font-bold text-emerald-700">{formatCurrency(dashboard.paidAmount)}</p></div>
        <div className="card"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overdue Invoices</p><p className="mt-2 text-2xl font-bold text-red-700">{dashboard.overdueCount}</p></div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <form onSubmit={handleCreate} className="card space-y-4">
        {editIdx !== null && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700 ring-1 ring-blue-200">Editing Invoice #{activeEditInvoice?.invoiceNumber}</div>}
        <div className="grid gap-3 md:grid-cols-2">
          <input className="input" placeholder="Customer name" value={form.customerName} onChange={e => setForm(prev => ({ ...prev, customerName: e.target.value }))} required />
          <select className="input" onChange={e => handleProjectSelect(e.target.value)} defaultValue="">
            <option value="">Select project</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>{project.projectName}</option>
            ))}
          </select>
          <input className="input" placeholder="Project name" value={form.projectName} onChange={e => setForm(prev => ({ ...prev, projectName: e.target.value }))} required />
          <select className="input" value={form.projectSize} onChange={e => setForm(prev => ({ ...prev, projectSize: e.target.value }))}>
            <option>1kW</option>
            <option>2kW</option>
            <option>3kW</option>
            <option>4kW</option>
            <option>5kW</option>
            <option>10kW</option>
          </select>
          <input className="input" type="date" value={form.invoiceDate} onChange={e => setForm(prev => ({ ...prev, invoiceDate: e.target.value }))} />
          <input className="input" type="date" value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} />
          <select className="input" value={form.paymentTerms} onChange={e => setForm(prev => ({ ...prev, paymentTerms: e.target.value }))}>
            <option>Net 7 Days</option>
            <option>Net 15 Days</option>
            <option>Net 30 Days</option>
          </select>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-semibold">Invoice Items</h4>
            <button type="button" className="btn-secondary" onClick={addItem}><Plus size={14} className="mr-1 inline-block" />Add Item</button>
          </div>
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
        </div>
        <div className="flex flex-wrap gap-6 mt-4">
          <div>Subtotal: <span className="font-semibold">{formatCurrency(totals.total)}</span></div>
          <div>CGST: <span className="font-semibold">{formatCurrency(totals.cgst)}</span></div>
          <div>SGST: <span className="font-semibold">{formatCurrency(totals.sgst)}</span></div>
          <div>Total Amount: <span className="font-bold text-brand-700">{formatCurrency(totals.grand)}</span></div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="btn-primary flex-1" type="submit">{editIdx !== null ? "Update Invoice" : "Generate Invoice"}</button>
          {editIdx !== null && <button className="btn-secondary flex-1" type="button" onClick={handleCancelEdit}>Cancel</button>}
        </div>
      </form>

      <div className="space-y-4">
        <div className="card">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Invoice Overview</h4>
          <div className="mt-3 space-y-2 text-sm">
            <p className="flex items-center justify-between"><span className="text-slate-500">Total Invoices</span><span className="font-semibold">{dashboard.totalInvoices}</span></p>
            <p className="flex items-center justify-between"><span className="text-slate-500">Paid Amount</span><span className="font-semibold text-emerald-700">{formatCurrency(dashboard.paidAmount)}</span></p>
            <p className="flex items-center justify-between"><span className="text-slate-500">Pending Amount</span><span className="font-semibold text-amber-700">{formatCurrency(dashboard.pendingAmount)}</span></p>
            <p className="flex items-center justify-between"><span className="text-slate-500">Overdue Amount</span><span className="font-semibold text-red-700">{formatCurrency(dashboard.overdueAmount)}</span></p>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent Payments</h4>
          <div className="mt-3 space-y-2">
            {recentPayments.length ? recentPayments.map((item) => (
              <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{item.customerName}</p>
                <p className="text-xs text-slate-500">{item.invoiceNumber}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{formatCurrency(item.amount)}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No payments recorded yet.</p>}
          </div>
        </div>
      </div>
      </section>

      <div className="card overflow-x-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Invoices</h3>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary"><Filter size={14} className="mr-1 inline-block" />Filter</button>
            <button type="button" className="btn-secondary"><Download size={14} className="mr-1 inline-block" />Export</button>
          </div>
          <p className="text-xs text-slate-500 md:hidden">Swipe right for more details</p>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {["All", "Paid", "Pending", "Overdue"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${statusFilter === status ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-3 md:hidden">
          {filteredInvoices.map((invoice) => (
            <div key={invoice._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{invoice.invoiceNumber}</p>
                  <p className="mt-1 text-sm text-slate-600">{invoice.customerName}</p>
                  <p className="text-xs text-slate-500">{invoice.projectName} • {invoice.projectSize}</p>
                </div>
                <span className={`badge ${statusBadge[invoice.derivedStatus] || statusBadge.Pending}`}>{invoice.derivedStatus}</span>
              </div>

              <div className="mt-3 text-sm text-slate-700">
                Amount: <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="btn-secondary" onClick={() => exportPdf(invoice)}>PDF</button>
                <button className="btn-secondary" onClick={() => handleEditInvoice(invoices.findIndex((inv) => inv._id === invoice._id))}>Edit</button>
              </div>

              <details className="mt-3 rounded-xl bg-slate-50 p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-brand-700">Payments</summary>
                <div className="space-y-1 mt-2">
                  {(invoice.payments || []).map((p, i) => (
                    <div key={i} className="text-xs text-slate-600">{p.date}: {formatCurrency(p.amount)}</div>
                  ))}
                  <div className="mt-2 grid gap-2">
                    <input className="input" type="number" min="1" placeholder="Amount" value={paymentDrafts[invoice._id]?.amount || ""} onChange={e => setPaymentDrafts(f => ({ ...f, [invoice._id]: { ...f[invoice._id], amount: e.target.value } }))} />
                    <input className="input" type="date" value={paymentDrafts[invoice._id]?.date || ""} onChange={e => setPaymentDrafts(f => ({ ...f, [invoice._id]: { ...f[invoice._id], date: e.target.value } }))} />
                    <button type="button" className="btn-primary" onClick={() => handleAddPayment(invoice._id, invoice.pendingAmount)}>Add Payment</button>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>

        <table className="hidden min-w-full text-left text-sm md:table">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Invoice No</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Project</th>
              <th className="px-3 py-2">Invoice Date</th>
              <th className="px-3 py-2">Due Date</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice._id} className="border-t border-slate-200">
                <td className="px-3 py-3 font-medium">{invoice.invoiceNumber}</td>
                <td className="px-3 py-3">{invoice.customerName}</td>
                <td className="px-3 py-3">{invoice.projectName}<br /><span className="text-xs text-slate-500">{invoice.projectSize}</span></td>
                <td className="px-3 py-3 text-xs text-slate-600">{invoice.invoiceDate || "-"}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{invoice.dueDate || "-"}</td>
                <td className="px-3 py-3">{formatCurrency(invoice.amount)}</td>
                <td className="px-3 py-3"><span className={`badge ${statusBadge[invoice.derivedStatus] || statusBadge.Pending}`}>{invoice.derivedStatus}</span></td>
                <td className="px-3 py-3 flex flex-col gap-2">
                  <button className="btn-secondary" onClick={() => exportPdf(invoice)}><Eye size={14} className="mr-1 inline-block" />Export PDF</button>
                  <button className="btn-secondary" onClick={() => handleEditInvoice(invoices.findIndex((inv) => inv._id === invoice._id))}>Edit</button>
                  <details>
                    <summary className="cursor-pointer text-xs text-brand-700">Payments</summary>
                    <div className="space-y-1 mt-2">
                      {(invoice.payments || []).map((p, i) => (
                        <div key={i} className="text-xs">{p.date}: {formatCurrency(p.amount)}</div>
                      ))}
                      <div className="flex gap-1 mt-1">
                        <input className="input" style={{width:80}} type="number" min="1" placeholder="Amount" value={paymentDrafts[invoice._id]?.amount || ""} onChange={e => setPaymentDrafts(f => ({ ...f, [invoice._id]: { ...f[invoice._id], amount: e.target.value } }))} />
                        <input className="input" style={{width:120}} type="date" value={paymentDrafts[invoice._id]?.date || ""} onChange={e => setPaymentDrafts(f => ({ ...f, [invoice._id]: { ...f[invoice._id], date: e.target.value } }))} />
                        <button type="button" className="btn-secondary" onClick={() => handleAddPayment(invoice._id, invoice.pendingAmount)}>Add</button>
                      </div>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading invoices from database...</p> : null}
    </div>
  );
}
