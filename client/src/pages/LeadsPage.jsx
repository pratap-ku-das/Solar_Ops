import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  FileText,
  Filter,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  User2,
  X,
  Trash2
} from "lucide-react";

const leadStatuses = ["New", "Qualified", "Site Survey", "Proposal Sent", "Negotiation", "Confirmed", "Lost"];
const leadSources = ["Website", "Referral", "Cold Call", "Facebook", "Walk-in", "Partner", "Other"];
const discomOptions = ["TPCODL", "TPSODL", "TPWODL", "TPNODL"];
const roofTypeOptions = ["Tin Shed", "Mixed", "Other"];

const initialForm = {
  customerName: "",
  mobileNumber: "",
  email: "",
  address: "",
  cityState: "",
  systemRequirementKw: "",
  roofType: "RCC",
  leadSource: "Website",
  notes: "",
  assignedSalespersonId: "",
  assignedSalespersonName: "",
  assignedSalespersonEmail: "",
  discom: "TPCODL",
  proposalValue: "",
  electricityBill: null
};

const badgeStyles = {
  New: "bg-slate-100 text-slate-700",
  Qualified: "bg-blue-100 text-blue-700",
  "Site Survey": "bg-cyan-100 text-cyan-700",
  "Proposal Sent": "bg-violet-100 text-violet-700",
  Negotiation: "bg-amber-100 text-amber-700",
  Confirmed: "bg-emerald-100 text-emerald-700",
  Lost: "bg-red-100 text-red-700"
};

const stageLabels = {
  New: "Fresh lead",
  Qualified: "Sales qualified",
  "Site Survey": "Survey scheduled",
  "Proposal Sent": "Proposal shared",
  Negotiation: "Negotiation in progress",
  Confirmed: "Ready for conversion",
  Lost: "Closed lost"
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

export default function LeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [salespeople, setSalespeople] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [conversionMessage, setConversionMessage] = useState("");

  const isAdmin = user?.role === "admin";
  const canCreateLead = ["admin", "operations", "bdm"].includes(user?.role);
  const canConvertLead = ["admin", "operations"].includes(user?.role);

  const fetchSalespeople = async () => {
    if (!isAdmin) {
      if (user?.role === "bdm") {
        setSalespeople([{ id: user.id, name: user.name, email: user.email }]);
        setForm((prev) => ({
          ...prev,
          assignedSalespersonId: user.id,
          assignedSalespersonName: user.name,
          assignedSalespersonEmail: user.email
        }));
      }
      return;
    }

    try {
      const { data } = await api.get("/users");
      const sales = (Array.isArray(data) ? data : []).filter((member) => member.role === "bdm");
      setSalespeople(sales.map((member) => ({ id: member.id || member._id, name: member.name, email: member.email })));
      if (!form.assignedSalespersonId && sales.length) {
        const first = sales[0];
        setForm((prev) => ({
          ...prev,
          assignedSalespersonId: first.id || first._id,
          assignedSalespersonName: first.name,
          assignedSalespersonEmail: first.email
        }));
      }
    } catch {
      setSalespeople([]);
    }
  };

  const fetchLeads = async (nextPage = page) => {
    setLoading(true);
    try {
      const { data } = await api.get("/leads", {
        params: {
          search,
          status: statusFilter,
          source: sourceFilter,
          sortBy,
          sortDir,
          page: nextPage,
          limit: 8
        }
      });
      setLeads(data.items || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      if (!id && !selectedLead && data.items?.length) {
        navigate(`/leads/${data.items[0]._id}`, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadDetails = async (leadId) => {
    if (!leadId) {
      setSelectedLead(null);
      return;
    }

    setDetailLoading(true);
    try {
      const { data } = await api.get(`/leads/${leadId}`);
      setSelectedLead(data);
      setStatusUpdate(data.status || "New");
      setConversionMessage("");
    } catch (error) {
      setSelectedLead(null);
      setConversionMessage(error.response?.data?.message || "Unable to load lead details.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchSalespeople();
  }, [isAdmin, user?.id]);

  useEffect(() => {
    fetchLeads(1);
    setPage(1);
  }, [search, statusFilter, sourceFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchLeads(page);
  }, [page]);

  useEffect(() => {
    if (id) {
      fetchLeadDetails(id);
    } else if (leads.length) {
      setSelectedLead(leads[0]);
      setStatusUpdate(leads[0].status || "New");
    }
  }, [id, leads]);

  const leadStats = useMemo(() => {
    const confirmed = leads.filter((lead) => lead.status === "Confirmed").length;
    const proposals = leads.filter((lead) => lead.status === "Proposal Sent").length;
    const newCount = leads.filter((lead) => lead.status === "New").length;
    const conversionRate = total ? Math.round((confirmed / total) * 100) : 0;
    return { confirmed, proposals, newCount, conversionRate };
  }, [leads, total]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSourceFilter("");
    setSortBy("createdAt");
    setSortDir("desc");
    setPage(1);
  };

  const openLead = (lead) => {
    navigate(`/leads/${lead._id}`);
  };

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSalespersonChange = (salespersonId) => {
    const selected = salespeople.find((person) => String(person.id) === String(salespersonId));
    setForm((current) => ({
      ...current,
      assignedSalespersonId: salespersonId,
      assignedSalespersonName: selected?.name || "",
      assignedSalespersonEmail: selected?.email || ""
    }));
  };

  const handleCreateLead = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "electricityBill") return;
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });
      if (form.electricityBill) {
        formData.append("electricityBill", form.electricityBill);
      }

      const { data } = await api.post("/leads", formData);
      setMessage("Lead created successfully.");
      setShowForm(false);
      setForm(initialForm);
      await fetchLeads(1);
      navigate(`/leads/${data._id}`, { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to create lead.");
    }
  };

  const updateLeadStatus = async (leadId, nextStatus) => {
    try {
      await api.put(`/leads/${leadId}/status`, { status: nextStatus });
      setStatusUpdate("Lead status updated.");
      await fetchLeads(page);
      await fetchLeadDetails(leadId);
    } catch (error) {
      setStatusUpdate(error.response?.data?.message || "Unable to update lead status.");
    }
  };

  const convertLead = async (leadId) => {
    try {
      const { data } = await api.post(`/leads/${leadId}/convert`);
      setConversionMessage(data.message || "Lead converted successfully.");
      await fetchLeads(page);
      await fetchLeadDetails(leadId);
    } catch (error) {
      setConversionMessage(error.response?.data?.message || "Unable to convert lead.");
    }
  };

  const filteredLeadCount = total;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Lead Management
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Leads</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Track enquiries, assign sales reps, monitor progress, and convert confirmed leads into linked projects.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canCreateLead ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              New Lead
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => fetchLeads(page)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total Leads</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{filteredLeadCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">New</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{leadStats.newCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Proposal Sent</p>
          <p className="mt-2 text-3xl font-black text-violet-700">{leadStats.proposals}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Conversion Rate</p>
          <p className="mt-2 text-3xl font-black text-emerald-700">{leadStats.conversionRate}%</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-10"
                  placeholder="Search leads, phone, email, or lead ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                {leadStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select className="input" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="">All Sources</option>
                {leadSources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              <button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                <Filter className="h-4 w-4" />
                Reset
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">Sort by</span>
              <select className="input w-auto py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="createdAt">Created Date</option>
                <option value="customerName">Customer Name</option>
                <option value="status">Status</option>
                <option value="leadSource">Lead Source</option>
              </select>
              <select className="input w-auto py-2 text-sm" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
              <span>Showing {leads.length} of {total} leads</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Lead ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Rep</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center text-slate-500">Loading leads...</td>
                    </tr>
                  ) : leads.length ? (
                    leads.map((lead) => (
                      <tr key={lead._id} className={`border-t border-slate-100 transition hover:bg-slate-50 ${selectedLead?._id === lead._id ? "bg-emerald-50/40" : ""}`}>
                        <td className="px-4 py-4 font-semibold text-slate-900">{lead.leadCode || lead._id}</td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900">{lead.customerName}</p>
                          <p className="text-xs text-slate-500">{lead.address || "-"}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{lead.phoneNumber || "-"}</td>
                        <td className="px-4 py-4 text-slate-700">{lead.email || "-"}</td>
                        <td className="px-4 py-4 text-slate-700">{lead.leadSource || "-"}</td>
                        <td className="px-4 py-4 text-slate-700">{lead.assignedSalespersonName || "-"}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[lead.status] || "bg-slate-100 text-slate-700"}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{formatDate(lead.createdAt)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openLead(lead)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                            {canConvertLead && lead.status === "Confirmed" ? (
                              <button
                                type="button"
                                onClick={() => convertLead(lead._id)}
                                className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                <ArrowRight className="h-4 w-4" />
                                Convert
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center text-slate-500">No leads match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
              <p>Page {page} of {pages}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(pages, current + 1))}
                  disabled={page === pages}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Lead Profile</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Details</h2>
            </div>
            {selectedLead ? (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[selectedLead.status] || "bg-slate-100 text-slate-700"}`}>
                {selectedLead.status}
              </span>
            ) : null}
          </div>

          {detailLoading ? (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading details...
            </div>
          ) : selectedLead ? (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-900 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">{selectedLead.leadCode}</p>
                <h3 className="mt-2 text-2xl font-black">{selectedLead.customerName}</h3>
                <p className="mt-1 text-sm text-white/80">{selectedLead.cityState || selectedLead.address || "-"}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/80">
                  <span className="rounded-full bg-white/10 px-3 py-1">{stageLabels[selectedLead.status] || selectedLead.status}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">{selectedLead.leadSource || "Website"}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">{selectedLead.systemRequirementKw || 0} kW</span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer Information</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {selectedLead.phoneNumber || "-"}</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {selectedLead.email || "-"}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {selectedLead.address || "-"}</p>
                    <p className="flex items-center gap-2"><User2 className="h-4 w-4 text-slate-400" /> {selectedLead.assignedSalespersonName || "Unassigned"}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lead Workflow</p>
                  <div className="mt-3 space-y-3">
                    <select className="input" value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)}>
                      {leadStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => updateLeadStatus(selectedLead._id, statusUpdate)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Update Status
                    </button>
                    <p className="text-xs text-slate-500">{statusUpdate ? `Current selection: ${statusUpdate}` : "Choose the next workflow stage."}</p>
                  </div>
                </div>
              </div>

              {selectedLead.status === "Confirmed" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CircleDollarSign className="h-4 w-4" />
                    <p className="font-semibold">Confirmed lead ready for project conversion</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => convertLead(selectedLead._id)}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
                  >
                    Convert to Project
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              {conversionMessage ? <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">{conversionMessage}</div> : null}
              {statusUpdate ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{statusUpdate}</div> : null}

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lead Activity Timeline</p>
                <div className="mt-4 space-y-4">
                  {(selectedLead.activityTimeline || []).length ? (
                    selectedLead.activityTimeline.map((item, index) => (
                      <div key={`${item.at || index}`} className="flex gap-3">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.type}</p>
                          <p className="text-sm text-slate-600">{item.message}</p>
                          <p className="text-xs text-slate-400">{item.by || "System"} {item.at ? `• ${formatTime(item.at)}` : ""}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No activity yet.</p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Communication History</p>
                  <div className="mt-3 space-y-3">
                    {(selectedLead.communicationHistory || []).length ? (
                      selectedLead.communicationHistory.map((item, index) => (
                        <div key={`${item.at || index}`} className="rounded-xl bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-slate-900">{item.channel || "Note"}</p>
                          <p className="text-sm text-slate-600">{item.note}</p>
                          <p className="text-xs text-slate-400">{item.by || "System"} {item.at ? `• ${formatTime(item.at)}` : ""}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No communication logged.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    {selectedLead.electricityBill?.path ? (
                      <a href={selectedLead.electricityBill.path} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 hover:bg-slate-100">
                        <FileText className="h-4 w-4 text-slate-500" /> Electricity Bill
                      </a>
                    ) : (
                      <p className="text-slate-500">No electricity bill uploaded.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Site Survey</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>Survey Date: {selectedLead.siteSurvey?.surveyDate || "-"}</p>
                    <p>Surveyor: {selectedLead.siteSurvey?.surveyor || "-"}</p>
                    <p>Roof Condition: {selectedLead.siteSurvey?.roofCondition || "-"}</p>
                    <p>Shadow Analysis: {selectedLead.siteSurvey?.shadowAnalysis || "-"}</p>
                    <p>Notes: {selectedLead.siteSurvey?.notes || "-"}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proposal / Quotation</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>Proposal Amount: Rs {Number(selectedLead.proposal?.amount || 0).toLocaleString("en-IN")}</p>
                    <p>Validity: {selectedLead.proposal?.validity || "-"}</p>
                    <p>Notes: {selectedLead.proposal?.notes || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned / Conversion</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700">
                  <p>Assigned Salesperson: {selectedLead.assignedSalespersonName || "-"}</p>
                  <p>Lead Source: {selectedLead.leadSource || "-"}</p>
                  <p>Converted Project ID: {selectedLead.convertedProjectId || "-"}</p>
                  <p>Created: {formatDate(selectedLead.createdAt)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              <Lock className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-medium text-slate-700">Select a lead to view the full profile</p>
              <p className="mt-1 text-sm text-slate-500">Customer details, timeline, proposal, and conversion tools will appear here.</p>
            </div>
          )}
        </aside>
      </div>

      {showForm && canCreateLead ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">New Lead</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Add lead details</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <input className="input" placeholder="Customer Name" value={form.customerName} onChange={(e) => handleFormChange("customerName", e.target.value)} required />
              <input className="input" placeholder="Mobile Number" value={form.mobileNumber} onChange={(e) => handleFormChange("mobileNumber", e.target.value)} required />
              <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} />
              <input className="input md:col-span-2 xl:col-span-3" placeholder="Address" value={form.address} onChange={(e) => handleFormChange("address", e.target.value)} />
              <input className="input" placeholder="City / State" value={form.cityState} onChange={(e) => handleFormChange("cityState", e.target.value)} />
              <input className="input" type="number" placeholder="System Requirement (kW)" value={form.systemRequirementKw} onChange={(e) => handleFormChange("systemRequirementKw", e.target.value)} />
              <select className="input" value={form.roofType} onChange={(e) => handleFormChange("roofType", e.target.value)}>
                {roofTypeOptions.map((roofType) => <option key={roofType} value={roofType}>{roofType}</option>)}
              </select>
              <select className="input" value={form.discom} onChange={(e) => handleFormChange("discom", e.target.value)}>
                {discomOptions.map((discom) => <option key={discom} value={discom}>{discom}</option>)}
              </select>
              <select className="input" value={form.leadSource} onChange={(e) => handleFormChange("leadSource", e.target.value)}>
                {leadSources.map((source) => <option key={source} value={source}>{source}</option>)}
              </select>
              <input className="input" placeholder="Assigned Salesperson Name" value={form.assignedSalespersonName} onChange={(e) => handleFormChange("assignedSalespersonName", e.target.value)} />
              <input className="input" placeholder="Assigned Salesperson Email" value={form.assignedSalespersonEmail} onChange={(e) => handleFormChange("assignedSalespersonEmail", e.target.value)} />
              <input className="input" type="number" placeholder="Proposal Value" value={form.proposalValue} onChange={(e) => handleFormChange("proposalValue", e.target.value)} />
              {isAdmin ? (
                <div className="space-y-2">
                  <select className="input" value={form.assignedSalespersonId} onChange={(e) => handleSalespersonChange(e.target.value)}>
                    <option value="">Choose from team</option>
                    {salespeople.map((person) => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">You can also write the salesperson name and email directly above.</p>
                </div>
              ) : (
                <input className="input" value={form.assignedSalespersonName || user?.name || ""} disabled />
              )}
              <input className="input" type="file" accept="application/pdf,image/*" onChange={(e) => handleFormChange("electricityBill", e.target.files?.[0] || null)} />
              <textarea className="input md:col-span-2 xl:col-span-3" rows="4" placeholder="Notes" value={form.notes} onChange={(e) => handleFormChange("notes", e.target.value)} />

              <div className="md:col-span-2 xl:col-span-3 flex items-center justify-between gap-3">
                <p className={`text-sm ${message.includes("success") ? "text-emerald-600" : "text-slate-500"}`}>{message}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">
                    Create Lead
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
