import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import PipelineBoard from "../components/PipelineBoard";
import { useAuth } from "../context/AuthContext";

const documentTypes = ["Aadhaar", "Electricity Bill", "Bank Details", "Agreement Files", "Installation Photo", "Other"];

const initialForm = {
  name: "",
  mobileNumber: "",
  emailAddress: "",
  discom: "TPCODL",
  projectSize: "1kW",
  projectType: "On-Grid",
  projectCost: "",
  panelBrand: "",
  inverterBrand: "",
  panelType: "DCR",
  address: "",
  consumerNumber: "",
  leadBy: "",
  status: "Proposal"
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [scheduleMap, setScheduleMap] = useState({});
  const [uploadState, setUploadState] = useState({});
  const [notice, setNotice] = useState("");

  const canCreateProject = ["admin", "bdm"].includes(user?.role);

  const fetchProjects = async () => {
    const { data } = await api.get("/projects", {
      params: { search, status: statusFilter }
    });
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
    api.get("/projects/pipeline/stages").then((response) => setStages(response.data));
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        [project.customerName, project.name, project.mobileNumber, project.consumerNumber]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = !statusFilter || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    await api.post("/projects", form);
    setForm(initialForm);
    setShowForm(false);
    setNotice("Project added successfully.");
    fetchProjects();
  };

  const updateStatus = async (projectId, status) => {
    await api.put(`/projects/${projectId}/status`, { status });
    setNotice("Project stage updated.");
    fetchProjects();
  };

  const updateSchedule = async (projectId) => {
    const schedule = scheduleMap[projectId];
    if (!schedule?.installationDate || !schedule?.installationTeam) return;
    await api.post(`/projects/${projectId}/schedule`, schedule);
    setNotice("Installation schedule saved and reminder triggered.");
    fetchProjects();
  };

  const uploadDocument = async (projectId) => {
    const current = uploadState[projectId];
    if (!current?.file) {
      setNotice("Please choose a document file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("type", current.type || "General Document");
    formData.append("file", current.file);

    await api.post(`/projects/${projectId}/documents`, formData);
    setNotice("Document uploaded successfully.");
    setUploadState((prev) => ({ ...prev, [projectId]: { type: "Aadhaar", file: null } }));
    fetchProjects();
  };

  const exportCsv = async () => {
    const response = await api.get("/projects/export/csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "projects.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      <PipelineBoard stages={stages} projects={projects} />

      <div className="card">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Projects</h3>
            <p className="text-sm text-slate-500">Manage customer jobs, subsidy stages, documents, and installation schedules.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={exportCsv} className="btn-secondary">Export CSV</button>
            {canCreateProject ? (
              <button onClick={() => setShowForm((prev) => !prev)} className="btn-primary">Add New Project</button>
            ) : null}
          </div>
        </div>

        {notice ? <div className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{notice}</div> : null}

        {showForm && canCreateProject && (
          <form onSubmit={handleCreateProject} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-3">
            <input className="input" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input className="input" name="mobileNumber" placeholder="Mobile Number" value={form.mobileNumber} onChange={handleChange} required />
            <input className="input" name="emailAddress" placeholder="Email Address" value={form.emailAddress} onChange={handleChange} />
            <select className="input" name="discom" value={form.discom} onChange={handleChange}>
              <option>TPCODL</option>
              <option>TPSODL</option>
              <option>TPWODL</option>
              <option>TPNODL</option>
            </select>
            <select className="input" name="projectSize" value={form.projectSize} onChange={handleChange}>
              <option>1kW</option>
              <option>2kW</option>
              <option>3kW</option>
              <option>4kW</option>
              <option>5kW</option>
              <option>10kW</option>
            </select>
            <select className="input" name="projectType" value={form.projectType} onChange={handleChange}>
              <option>On-Grid</option>
              <option>Off-Grid</option>
              <option>Hybrid</option>
            </select>
            <input className="input" name="projectCost" type="number" placeholder="Project Cost" value={form.projectCost} onChange={handleChange} required />
            <input className="input" name="panelBrand" placeholder="Panel Brand" value={form.panelBrand} onChange={handleChange} />
            <input className="input" name="inverterBrand" placeholder="Inverter Brand" value={form.inverterBrand} onChange={handleChange} />
            <select className="input" name="panelType" value={form.panelType} onChange={handleChange}>
              <option>DCR</option>
              <option>NON-DCR</option>
            </select>
            <input className="input" name="consumerNumber" placeholder="Consumer Number" value={form.consumerNumber} onChange={handleChange} />
            <input className="input" name="leadBy" placeholder="Lead By" value={form.leadBy} onChange={handleChange} />
            <textarea className="input md:col-span-2 xl:col-span-3" name="address" placeholder="Address" value={form.address} onChange={handleChange} rows="2" />
            <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Project</button>
            </div>
          </form>
        )}

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <input className="input" placeholder="Search by customer, mobile, or consumer number" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          <button onClick={fetchProjects} className="btn-secondary">Apply Filters</button>
        </div>

        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div key={project._id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="xl:flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold">{project.customerName}</h4>
                    <span className="badge bg-slate-100 text-slate-700">{project.projectSize}</span>
                    <span className="badge bg-blue-100 text-blue-700">{project.projectType}</span>
                    <span className="badge bg-emerald-100 text-emerald-700">₹{Number(project.projectCost || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{project.discom} • {project.mobileNumber} • {project.address}</p>
                  <p className="mt-2 text-sm text-slate-600">Panel: {project.panelBrand || "-"} | Inverter: {project.inverterBrand || "-"} | Consumer No: {project.consumerNumber || "-"} | Lead By: {project.leadBy || "-"}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    {(project.documents || []).map((doc) => (
                      <a key={doc._id || doc.fileName} href={doc.path} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-3 py-1 hover:bg-slate-200">
                        {doc.type}: {doc.fileName}
                      </a>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-3 md:grid-cols-[160px_1fr_auto]">
                    <select
                      className="input"
                      value={uploadState[project._id]?.type || "Aadhaar"}
                      onChange={(e) => setUploadState((prev) => ({
                        ...prev,
                        [project._id]: { ...(prev[project._id] || {}), type: e.target.value }
                      }))}
                    >
                      {documentTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      className="input"
                      type="file"
                      onChange={(e) => setUploadState((prev) => ({
                        ...prev,
                        [project._id]: { ...(prev[project._id] || {}), type: prev[project._id]?.type || "Aadhaar", file: e.target.files?.[0] || null }
                      }))}
                    />
                    <button onClick={() => uploadDocument(project._id)} className="btn-secondary">Upload Document</button>
                  </div>
                </div>

                <div className="grid gap-2 md:min-w-80">
                  <select className="input" value={project.status} onChange={(e) => updateStatus(project._id, e.target.value)}>
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="date"
                      className="input"
                      value={scheduleMap[project._id]?.installationDate || project.installationDate || ""}
                      onChange={(e) => setScheduleMap((prev) => ({
                        ...prev,
                        [project._id]: { ...(prev[project._id] || {}), installationDate: e.target.value, installationTeam: prev[project._id]?.installationTeam || project.installationTeam || "" }
                      }))}
                    />
                    <input
                      className="input"
                      placeholder="Installation team"
                      value={scheduleMap[project._id]?.installationTeam || project.installationTeam || ""}
                      onChange={(e) => setScheduleMap((prev) => ({
                        ...prev,
                        [project._id]: { ...(prev[project._id] || {}), installationTeam: e.target.value, installationDate: prev[project._id]?.installationDate || project.installationDate || "" }
                      }))}
                    />
                  </div>
                  <button onClick={() => updateSchedule(project._id)} className="btn-secondary">Schedule Installation + Email</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
