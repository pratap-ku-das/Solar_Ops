import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { FileText, AlertCircle, Play, CheckCircle2, Pause, XCircle, Eye, Trash2, Plus, Calendar, Filter } from "lucide-react";

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
  leadBy: ""
};

const getStageIcon = (status) => {
  switch (status) {
    case "Installation":
      return <Play className="h-5 w-5 text-blue-600" />;
    case "Completed":
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    case "On Hold":
      return <Pause className="h-5 w-5 text-orange-600" />;
    case "Cancelled":
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <FileText className="h-5 w-5 text-slate-600" />;
  }
};

const getStatusColor = (status) => {
  const statusColors = {
    "In Progress": "bg-blue-100 text-blue-700",
    "Completed": "bg-emerald-100 text-emerald-700",
    "On Hold": "bg-orange-100 text-orange-700",
    "Cancelled": "bg-red-100 text-red-700",
    "Pending": "bg-slate-100 text-slate-700"
  };
  return statusColors[status] || "bg-slate-100 text-slate-700";
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [scheduleMap, setScheduleMap] = useState({});
  const [uploadState, setUploadState] = useState({});
  const [expandedProjectId, setExpandedProjectId] = useState("");
  const [notice, setNotice] = useState("");

  const canCreateProject = ["admin", "bdm"].includes(user?.role);
  const canDeleteProject = ["admin", "operations"].includes(user?.role);

  const fetchProjects = async () => {
    const { data } = await api.get("/projects", {
      params: { search, status: statusFilter || stageFilter }
    });
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
    api.get("/projects/pipeline/stages").then((response) => setStages(response.data));
  }, []);

  const filteredProjects = projects.filter((project) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      [project.customerName, project.name, project.mobileNumber, project.consumerNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesStage = !stageFilter || project.status === stageFilter;
    return matchesSearch && matchesStatus && matchesStage;
  });

  const kpis = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    onHold: projects.filter((p) => p.status === "On Hold").length,
    cancelled: projects.filter((p) => p.status === "Cancelled").length
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    try {
      await api.post("/projects", form);
      setForm(initialForm);
      setShowForm(false);
      setNotice("Project added successfully.");
      fetchProjects();
    } catch (error) {
      setNotice("Error creating project. Please try again.");
    }
  };

  const updateStatus = async (projectId, status) => {
    try {
      await api.put(`/projects/${projectId}/status`, { status });
      setNotice("Project stage updated.");
      fetchProjects();
    } catch (error) {
      setNotice("Error updating project status.");
    }
  };

  const updateSchedule = async (projectId) => {
    const schedule = scheduleMap[projectId] || {};

    if (!schedule.installationDate || !schedule.installationTeam) {
      setNotice("Please add installation date and team before saving the schedule.");
      return;
    }

    try {
      await api.post(`/projects/${projectId}/schedule`, schedule);
      setNotice("Installation schedule saved and reminder triggered.");
      fetchProjects();
    } catch (error) {
      setNotice("Error saving installation schedule.");
    }
  };

  const uploadDocument = async (projectId) => {
    const current = uploadState[projectId];
    if (!current?.file) {
      setNotice("Please choose a document file before uploading.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", current.type || "General Document");
      formData.append("file", current.file);
      await api.post(`/projects/${projectId}/documents`, formData);
      setNotice("Document uploaded successfully.");
      setUploadState((prev) => ({ ...prev, [projectId]: { type: "Aadhaar", file: null } }));
      fetchProjects();
    } catch (error) {
      setNotice(error.response?.data?.message || "Error uploading document.");
    }
  };

  const deleteProject = async (projectId) => {
    const confirmed = window.confirm("Delete this project permanently?");
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setNotice("Project deleted successfully.");
      fetchProjects();
    } catch (error) {
      setNotice("Error deleting project.");
    }
  };

  const toggleProjectDetails = (projectId) => {
    setExpandedProjectId((current) => (current === projectId ? "" : projectId));
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    setStageFilter("");
    setStartDate("");
    setEndDate("");
    setShowForm(false);
  };

  const getProjectProgress = (project) => {
    const statusProgress = {
      "Project Initiated": 5,
      "Proposal": 10,
      "Survey": 25,
      "Document Collection": 40,
      "Installation": 70,
      "Completed": 100,
      "On Hold": 50,
      "Cancelled": 0
    };
    return statusProgress[project.status] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-slate-600">Manage all solar projects and track progress</p>
        </div>
        <div className="flex gap-2">
          {canCreateProject && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-5 w-5" />
              Add New Project
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          {notice}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-600">Total Projects</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{kpis.total}</p>
          <p className="mt-1 text-xs text-slate-500">All Projects</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-600">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{kpis.inProgress}</p>
          <p className="mt-1 text-xs text-slate-500">Active Projects</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-600">Completed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{kpis.completed}</p>
          <p className="mt-1 text-xs text-slate-500">Finished Projects</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-600">On Hold</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{kpis.onHold}</p>
          <p className="mt-1 text-xs text-slate-500">Paused Projects</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-600">Cancelled</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{kpis.cancelled}</p>
          <p className="mt-1 text-xs text-slate-500">Cancelled Projects</p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && canCreateProject && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <input
              className="input"
              name="name"
              placeholder="Project Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={form.mobileNumber}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="emailAddress"
              placeholder="Email Address"
              value={form.emailAddress}
              onChange={handleChange}
            />
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
            <input
              className="input"
              name="projectCost"
              type="number"
              placeholder="Project Cost"
              value={form.projectCost}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="panelBrand"
              placeholder="Panel Brand"
              value={form.panelBrand}
              onChange={handleChange}
            />
            <input
              className="input"
              name="inverterBrand"
              placeholder="Inverter Brand"
              value={form.inverterBrand}
              onChange={handleChange}
            />
            <select className="input" name="panelType" value={form.panelType} onChange={handleChange}>
              <option>DCR</option>
              <option>NON-DCR</option>
            </select>
            <input
              className="input"
              name="consumerNumber"
              placeholder="Consumer Number"
              value={form.consumerNumber}
              onChange={handleChange}
            />
            <input
              className="input"
              name="leadBy"
              placeholder="Lead By"
              value={form.leadBy}
              onChange={handleChange}
            />
            <textarea
              className="input lg:col-span-3"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              rows="2"
            />
            <div className="flex justify-end gap-2 lg:col-span-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            className="input"
            placeholder="Search projects, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <AlertCircle className="h-12 w-12 text-slate-300" />
            <p className="text-slate-500">No projects match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Installation Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Progress</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <>
                  <tr key={project._id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{project.name}</p>
                        <p className="text-xs text-slate-500">{project.consumerNumber || "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{project.customerName}</p>
                        <p className="text-xs text-slate-500">{project.mobileNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{project.projectSize}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStageIcon(project.status)}
                        <span className="text-sm text-slate-700">{project.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 min-w-56">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            type="date"
                            className="input py-2 text-sm"
                            value={scheduleMap[project._id]?.installationDate || project.installationDate || ""}
                            onChange={(e) => setScheduleMap((prev) => ({
                              ...prev,
                              [project._id]: {
                                ...(prev[project._id] || {}),
                                installationDate: e.target.value,
                                installationTeam: prev[project._id]?.installationTeam || project.installationTeam || ""
                              }
                            }))}
                          />
                          <input
                            className="input py-2 text-sm"
                            placeholder="Installation team"
                            value={scheduleMap[project._id]?.installationTeam || project.installationTeam || ""}
                            onChange={(e) => setScheduleMap((prev) => ({
                              ...prev,
                              [project._id]: {
                                ...(prev[project._id] || {}),
                                installationTeam: e.target.value,
                                installationDate: prev[project._id]?.installationDate || project.installationDate || ""
                              }
                            }))}
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          Saved date: {project.installationDate ? new Date(project.installationDate).toLocaleDateString("en-IN") : "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 transition-all"
                            style={{ width: `${getProjectProgress(project)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{getProjectProgress(project)}%</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleProjectDetails(project._id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          aria-label="View project details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSchedule(project._id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Save Schedule
                        </button>
                        <select
                          value={project.status}
                          onChange={(e) => updateStatus(project._id, e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {stages.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                        {canDeleteProject && (
                          <button
                            type="button"
                            onClick={() => deleteProject(project._id)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-red-50 p-2 text-red-700 hover:bg-red-100 transition"
                            aria-label="Delete project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedProjectId === project._id && (
                    <tr key={`${project._id}-details`} className="border-b border-slate-200 bg-slate-50">
                      <td className="px-6 py-5" colSpan={8}>
                        <div className="grid gap-4 lg:grid-cols-3">
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project Details</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                              <p><span className="font-medium text-slate-900">Address:</span> {project.address || "-"}</p>
                              <p><span className="font-medium text-slate-900">Lead By:</span> {project.leadBy || "-"}</p>
                              <p><span className="font-medium text-slate-900">DISCOM:</span> {project.discom || "-"}</p>
                              <p><span className="font-medium text-slate-900">Project Type:</span> {project.projectType || "-"}</p>
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Equipment</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                              <p><span className="font-medium text-slate-900">Panel Brand:</span> {project.panelBrand || "-"}</p>
                              <p><span className="font-medium text-slate-900">Inverter Brand:</span> {project.inverterBrand || "-"}</p>
                              <p><span className="font-medium text-slate-900">Panel Type:</span> {project.panelType || "-"}</p>
                              <p><span className="font-medium text-slate-900">Capacity:</span> {project.projectSize || "-"}</p>
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {(project.documents || []).length ? (
                                (project.documents || []).map((doc) => (
                                  <a
                                    key={doc._id || doc.fileName}
                                    href={doc.path}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                                  >
                                    {doc.type}: {doc.fileName}
                                  </a>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500">No documents uploaded yet.</p>
                              )}
                            </div>
                            <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 md:grid-cols-[150px_1fr_auto]">
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
                              <button type="button" onClick={() => uploadDocument(project._id)} className="btn-secondary">
                                Upload Document
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredProjects.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-sm text-slate-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        )}
      </div>
    </div>
  );
}

