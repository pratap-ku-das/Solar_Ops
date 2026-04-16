  // Update project status handler
  const updateStatus = async (projectId, status) => {
    await api.put(`/projects/${projectId}/status`, { status });
    setNotice("Project stage updated.");
    fetchData();
  };
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import api from "../api/api";

const stageColors = {
  Proposal: "bg-slate-100 text-slate-700",
  "Document Collection": "bg-blue-100 text-blue-700",
  "Login Required": "bg-amber-100 text-amber-700",
  "Login Complete": "bg-green-100 text-green-700",
  "Problemeting File": "bg-orange-100 text-orange-700",
  "Document Generation": "bg-purple-100 text-purple-700",
  "Digital Approval Pending": "bg-yellow-100 text-yellow-700",
  "Digital Approval Complete": "bg-emerald-100 text-emerald-700",
  "Need to Bank Submit": "bg-indigo-100 text-indigo-700",
  "Submitted in Bank": "bg-cyan-100 text-cyan-700",
  "Waiting for Disbursement": "bg-teal-100 text-teal-700",
  "Loan Disbursement Complete": "bg-lime-100 text-lime-700",
  "Installation Pending": "bg-orange-100 text-orange-700",
  "Installation Complete": "bg-emerald-100 text-emerald-700",
  "Demand Note Generation": "bg-pink-100 text-pink-700",
  "Demand Note Payment Complete": "bg-rose-100 text-rose-700",
  "Inspection Process": "bg-violet-100 text-violet-700",
  "Inspection Complete": "bg-fuchsia-100 text-fuchsia-700",
  "Document Upload in MNRE Portal": "bg-sky-100 text-sky-700",
  "Inspection Pending / Complete": "bg-stone-100 text-stone-700",
  "Subsidy Apply Pending": "bg-neutral-100 text-neutral-700",
  "Subsidy Redeemed": "bg-gray-100 text-gray-700",
  "Subsidy Disbursed": "bg-green-100 text-green-700"
};

function ProjectStages({ project, stages }) {
  const currentIndex = stages.indexOf(project.status);
  return (
    <div className="mb-2 overflow-x-auto px-1">
      <div className="flex items-center gap-2 min-w-max">
        {stages.map((stage, index) => {
          const isCompleted = index <= currentIndex;
          return (
            <div key={stage} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition ${
                    isCompleted ? "border-green-500 bg-green-500 text-white" : "border-slate-300 bg-white text-slate-500"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span className={`mt-1 max-w-[100px] text-center text-xs ${isCompleted ? "text-slate-700" : "text-slate-400"}`}>
                  {stage}
                </span>
              </div>

              {index < stages.length - 1 && (
                <div className={`mx-2 h-0.5 w-10 ${index < currentIndex ? "bg-green-500" : "bg-slate-300"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [detailsCustomer, setDetailsCustomer] = useState(null);
  const [uploadState, setUploadState] = useState({});
  const [scheduleMap, setScheduleMap] = useState({});
    // Document upload handler
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
      fetchData();
    };

    // Schedule installation handler
    const updateSchedule = async (projectId) => {
      const schedule = scheduleMap[projectId];
      if (!schedule?.installationDate || !schedule?.installationTeam) return;
      await api.post(`/projects/${projectId}/schedule`, schedule);
      setNotice("Installation schedule saved and reminder triggered.");
      fetchData();
    };
  const [notice, setNotice] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    emailAddress: "",
    discom: "TPCODL",
    address: "",
    consumerNumber: "",
    leadBy: ""
  });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({
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
  });
  const [editProjectId, setEditProjectId] = useState(null);
  const [editProjectForm, setEditProjectForm] = useState(null);

  const openEditProjectForm = (project) => {
    setEditProjectId(project._id);
    setEditProjectForm({ ...project });
  };

  const handleEditProjectFormChange = (e) => {
    const { name, value } = e.target;
    setEditProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${editProjectId}`, editProjectForm);
      setNotice("Project updated successfully.");
      setEditProjectId(null);
      setEditProjectForm(null);
      fetchData();
    } catch (error) {
      setNotice("Unable to update project. Please try again.");
      console.error(error);
    }
  };

  const openProjectForm = (customer) => {
    setProjectForm({
      name: customer.name,
      mobileNumber: customer.mobileNumber,
      emailAddress: customer.emailAddress,
      discom: customer.discom,
      projectSize: "1kW",
      projectType: "On-Grid",
      projectCost: "",
      panelBrand: "",
      inverterBrand: "",
      panelType: "DCR",
      address: customer.address,
      consumerNumber: customer.consumerNumber,
      leadBy: customer.leadBy,
      status: "Proposal"
    });
    setShowProjectForm(true);
  };

  const closeProjectForm = () => {
    setShowProjectForm(false);
  };

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", projectForm);
      setNotice("Project added successfully.");
      setShowProjectForm(false);
      fetchData();
    } catch (error) {
      setNotice("Unable to add project. Please try again.");
      console.error(error);
    }
  };

  const fetchData = () => {
    api.get("/customers").then((response) => setCustomers(response.data));
    api.get("/projects").then((response) => setProjects(response.data));
    api.get("/projects/pipeline/stages").then((response) => setStages(response.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post("/customers", form);
      setNotice("Customer added successfully.");
      setShowAddForm(false);
      setForm({
        name: "",
        mobileNumber: "",
        emailAddress: "",
        discom: "TPCODL",
        address: "",
        consumerNumber: "",
        leadBy: ""
      });
      fetchData();
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      if (error?.response?.status === 401) {
        setNotice("Session expired. Please login again and retry.");
      } else {
        setNotice(apiMessage || "Unable to add customer. Please try again.");
      }
      console.error(error);
    }
  };

  const deleteCustomer = async (customerId) => {
    if (!window.confirm("Delete this customer and all related projects?")) return;
    try {
      await api.delete(`/customers/${customerId}`);
      setNotice("Customer deleted successfully.");
      fetchData();
      if (expandedCustomer === customerId) setExpandedCustomer(null);
    } catch (error) {
      setNotice("Unable to delete customer. Please try again.");
      console.error(error);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setNotice("Project deleted successfully.");
      fetchData();
    } catch (error) {
      setNotice("Unable to delete project. Please try again.");
      console.error(error);
    }
  };


  const customerProjects = customers.map((customer) => ({
    ...customer,
    projects: projects.filter((project) => project.customerName === customer.name)
  }));

  return (
    <div className="card">

      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customers</h3>
          <p className="text-sm text-slate-500">All customer records with DISCOM and lead details.</p>
        </div>
        <button onClick={() => setShowAddForm((prev) => !prev)} className="btn-primary self-start md:self-auto">{showAddForm ? "Close" : "Add Customer"}</button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCustomer} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-3">
          <input className="input" name="name" placeholder="Name" value={form.name} onChange={handleFormChange} required />
          <input className="input" name="mobileNumber" placeholder="Mobile Number" value={form.mobileNumber} onChange={handleFormChange} required />
          <input className="input" name="emailAddress" placeholder="Email Address" value={form.emailAddress} onChange={handleFormChange} />
          <select className="input" name="discom" value={form.discom} onChange={handleFormChange}>
            <option>TPCODL</option>
            <option>TPSODL</option>
            <option>TPWODL</option>
            <option>TPNODL</option>
          </select>
          <input className="input" name="consumerNumber" placeholder="Consumer Number" value={form.consumerNumber} onChange={handleFormChange} />
          <input className="input" name="leadBy" placeholder="Lead By" value={form.leadBy} onChange={handleFormChange} />
          <textarea className="input md:col-span-2 xl:col-span-3" name="address" placeholder="Address" value={form.address} onChange={handleFormChange} rows="2" />
          <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Customer</button>
          </div>
        </form>
      )}

      {notice && <div className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{notice}</div>}

      {showProjectForm && (
        <form onSubmit={handleAddProject} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-3">
          <input className="input" name="name" placeholder="Name" value={projectForm.name} onChange={handleProjectFormChange} required />
          <input className="input" name="mobileNumber" placeholder="Mobile Number" value={projectForm.mobileNumber} onChange={handleProjectFormChange} required />
          <input className="input" name="emailAddress" placeholder="Email Address" value={projectForm.emailAddress} onChange={handleProjectFormChange} />
          <select className="input" name="discom" value={projectForm.discom} onChange={handleProjectFormChange}>
            <option>TPCODL</option>
            <option>TPSODL</option>
            <option>TPWODL</option>
            <option>TPNODL</option>
          </select>
          <select className="input" name="projectSize" value={projectForm.projectSize} onChange={handleProjectFormChange}>
            <option>1kW</option>
            <option>2kW</option>
            <option>3kW</option>
            <option>4kW</option>
            <option>5kW</option>
            <option>10kW</option>
          </select>
          <select className="input" name="projectType" value={projectForm.projectType} onChange={handleProjectFormChange}>
            <option>On-Grid</option>
            <option>Off-Grid</option>
            <option>Hybrid</option>
          </select>
          <input className="input" name="projectCost" type="number" placeholder="Project Cost" value={projectForm.projectCost} onChange={handleProjectFormChange} required />
          <input className="input" name="panelBrand" placeholder="Panel Brand" value={projectForm.panelBrand} onChange={handleProjectFormChange} />
          <input className="input" name="inverterBrand" placeholder="Inverter Brand" value={projectForm.inverterBrand} onChange={handleProjectFormChange} />
          <select className="input" name="panelType" value={projectForm.panelType} onChange={handleProjectFormChange}>
            <option>DCR</option>
            <option>NON-DCR</option>
          </select>
          <input className="input" name="consumerNumber" placeholder="Consumer Number" value={projectForm.consumerNumber} onChange={handleProjectFormChange} />
          <input className="input" name="leadBy" placeholder="Lead By" value={projectForm.leadBy} onChange={handleProjectFormChange} />
          <textarea className="input md:col-span-2 xl:col-span-3" name="address" placeholder="Address" value={projectForm.address} onChange={handleProjectFormChange} rows="2" />
          <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-2">
            <button type="button" onClick={closeProjectForm} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Project</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">DISCOM</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Lead By</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customerProjects.map((customer) => (
              <>
                <tr
                  className="border-t border-slate-200 cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedCustomer(expandedCustomer === customer._id ? null : customer._id)}
                >
                  <td className="px-3 py-3 font-medium">
                    <span
                      className="hover:underline cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        setDetailsCustomer(customer);
                      }}
                    >
                      {customer.name}
                    </span>
                  </td>
                  <td className="px-3 py-3">{customer.mobileNumber}<br /><span className="text-xs text-slate-500">{customer.emailAddress}</span></td>
                  <td className="px-3 py-3">{customer.discom}</td>
                  <td className="px-3 py-3">{customer.address}</td>
                  <td className="px-3 py-3">{customer.leadBy}</td>
                  <td className="px-3 py-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomer(customer._id);
                      }}
                      className="btn-danger btn-xs"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProjectForm(customer);
                      }}
                      className="btn-primary btn-xs"
                    >
                      Add Project
                    </button>
                  </td>
                </tr>
                {expandedCustomer === customer._id && (
                  <tr>
                    <td colSpan="5" className="px-3 py-3 bg-slate-50">
                      <div className="space-y-3">
                        {customer.projects.length === 0 ? (
                          <p className="text-sm text-slate-500">No projects found for this customer.</p>
                        ) : (
                          customer.projects.map((project) => (
                            <div key={project._id} className="rounded-lg border border-slate-200 bg-white p-3">
                              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{project.name}</h4>
                                  <span className="badge bg-slate-100 text-slate-700">{project.projectSize}</span>
                                  <span className="badge bg-blue-100 text-blue-700">{project.projectType}</span>
                                </div>
                                <button
                                  onClick={() => deleteProject(project._id)}
                                  className="btn-danger btn-xs"
                                >
                                  Delete Project
                                </button>
                              </div>

                              <div className="flex flex-col gap-2">
                                <ProjectStages project={project} stages={stages} />
                                <div className="flex items-center gap-2">
                                  <label className="text-xs">Change Stage:</label>
                                  <select
                                    className="input"
                                    value={project.status}
                                    onChange={e => updateStatus(project._id, e.target.value)}
                                  >
                                    {stages.map(stage => (
                                      <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700">📁</span>
                                  Project Documents
                                </div>

                                {project.documents && project.documents.length > 0 ? (
                                  <ul className="space-y-1 text-sm">
                                    {project.documents.map((doc) => (
                                      <li key={doc._id || doc.fileName} className="flex items-center justify-between rounded-md bg-white p-2 border border-slate-200">
                                        <div className="space-y-0.5">
                                          <p className="font-medium text-slate-700">{doc.type}</p>
                                          <a href={doc.path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                            {doc.fileName}
                                          </a>
                                        </div>
                                        <a href={doc.path} target="_blank" rel="noreferrer" className="btn-xs btn-secondary">
                                          Open
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-slate-500">No documents uploaded yet for this project.</p>
                                )}

                                {/* Document upload UI */}
                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                  <select
                                    className="input"
                                    value={uploadState[project._id]?.type || "Aadhaar"}
                                    onChange={e => setUploadState(prev => ({
                                      ...prev,
                                      [project._id]: { ...(prev[project._id] || {}), type: e.target.value }
                                    }))}
                                  >
                                    {["Aadhaar", "Electricity Bill", "Bank Details", "Agreement Files", "Installation Photo", "Other"].map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                  <input
                                    className="input min-w-0"
                                    type="file"
                                    onChange={e => setUploadState(prev => ({
                                      ...prev,
                                      [project._id]: { ...(prev[project._id] || {}), type: prev[project._id]?.type || "Aadhaar", file: e.target.files?.[0] || null }
                                    }))}
                                  />
                                  <button onClick={() => uploadDocument(project._id)} className="btn-secondary">Upload Document</button>
                                </div>

                                {/* Schedule installation UI */}
                                <div className="mt-3 grid gap-2 sm:grid-cols-2 md:w-2/3">
                                  <input
                                    type="date"
                                    className="input"
                                    value={scheduleMap[project._id]?.installationDate || project.installationDate || ""}
                                    onChange={e => setScheduleMap(prev => ({
                                      ...prev,
                                      [project._id]: { ...(prev[project._id] || {}), installationDate: e.target.value, installationTeam: prev[project._id]?.installationTeam || project.installationTeam || "" }
                                    }))}
                                  />
                                  <input
                                    className="input"
                                    placeholder="Installation team"
                                    value={scheduleMap[project._id]?.installationTeam || project.installationTeam || ""}
                                    onChange={e => setScheduleMap(prev => ({
                                      ...prev,
                                      [project._id]: { ...(prev[project._id] || {}), installationTeam: e.target.value, installationDate: prev[project._id]?.installationDate || project.installationDate || "" }
                                    }))}
                                  />
                                  <button onClick={() => updateSchedule(project._id)} className="btn-secondary col-span-2">Schedule Installation + Email</button>
                                </div>
                                    {/* Customer Details Modal */}
                                    {detailsCustomer && (
                                      <Modal onClose={() => setDetailsCustomer(null)}>
                                        <div className="p-4">
                                          <h2 className="text-xl font-bold mb-2">Customer Details</h2>
                                          <div className="mb-2">
                                            <strong>Name:</strong> {detailsCustomer.name}<br />
                                            <strong>Mobile:</strong> {detailsCustomer.mobileNumber}<br />
                                            <strong>Email:</strong> {detailsCustomer.emailAddress}<br />
                                            <strong>DISCOM:</strong> {detailsCustomer.discom}<br />
                                            <strong>Consumer No:</strong> {detailsCustomer.consumerNumber}<br />
                                            <strong>Lead By:</strong> {detailsCustomer.leadBy}<br />
                                            <strong>Address:</strong> {detailsCustomer.address}
                                          </div>
                                          <h3 className="font-semibold mt-4 mb-2">Projects & Documents</h3>
                                          {(detailsCustomer.projects || []).length === 0 ? (
                                            <p>No projects found for this customer.</p>
                                          ) : (
                                            detailsCustomer.projects.map(project => (
                                              <div key={project._id} className="mb-4">
                                                <div className="font-medium">{project.name} <span className="badge bg-slate-100 text-slate-700">{project.projectSize}</span> <span className="badge bg-blue-100 text-blue-700">{project.projectType}</span></div>
                                                <div className="text-xs text-slate-500 mb-1">Panel: {project.panelBrand || "-"} | Inverter: {project.inverterBrand || "-"} | Consumer No: {project.consumerNumber || "-"} | Lead By: {project.leadBy || "-"}</div>
                                                <div className="ml-2">
                                                  {project.documents && project.documents.length > 0 ? (
                                                    <ul className="list-disc ml-4">
                                                      {project.documents.map(doc => (
                                                        <li key={doc._id || doc.fileName}>
                                                          <strong>{doc.type}:</strong> <a href={doc.path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{doc.fileName}</a>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  ) : (
                                                    <span className="text-slate-400">No documents uploaded.</span>
                                                  )}
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </Modal>
                                    )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
