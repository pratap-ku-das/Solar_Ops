const crypto = require("crypto");

const createId = () => crypto.randomUUID();

const PIPELINE_STAGES = [
  "Proposal",
  "Document Collection",
  "Login Required",
  "Login Complete",
  "Problemeting File",
  "Document Generation",
  "Digital Approval Pending",
  "Digital Approval Complete",
  "Need to Bank Submit",
  "Submitted in Bank",
  "Waiting for Disbursement",
  "Loan Disbursement Complete",
  "Installation Pending",
  "Installation Complete",
  "Demand Note Generation",
  "Demand Note Payment Complete",
  "Inspection Process",
  "Inspection Complete",
  "Document Upload in MNRE Portal",
  "Inspection Pending / Complete",
  "Subsidy Apply Pending",
  "Subsidy Redeemed",
  "Subsidy Disbursed"
];

const demoUsers = [
  { _id: "USR-001", name: "Admin User", email: "admin@solar.com", password: "admin123", role: "admin" },
  { _id: "USR-002", name: "Operations Lead", email: "ops@solar.com", password: "ops123", role: "operations" },
  { _id: "USR-003", name: "BDM Executive", email: "bdm@solar.com", password: "bdm123", role: "bdm" }
];

const demoCustomers = [
  {
    _id: "CUS-001",
    name: "Amit Kumar",
    mobileNumber: "9876543210",
    emailAddress: "amit.kumar@email.com",
    discom: "TPCODL",
    address: "Bhubaneswar, Odisha",
    consumerNumber: "TPC10021",
    leadBy: "Sanjay"
  },
  {
    _id: "CUS-002",
    name: "Priya Das",
    mobileNumber: "9123456780",
    emailAddress: "priya.das@email.com",
    discom: "TPSODL",
    address: "Berhampur, Odisha",
    consumerNumber: "TPS20411",
    leadBy: "Rina"
  },
  {
    _id: "CUS-003",
    name: "Green Foods Pvt Ltd",
    mobileNumber: "9000011111",
    emailAddress: "accounts@greenfoods.com",
    discom: "TPNODL",
    address: "Cuttack, Odisha",
    consumerNumber: "TPN30077",
    leadBy: "Arjun"
  }
];

const demoProjects = [
  {
    _id: "PRJ-001",
    customerId: "CUS-001",
    name: "Amit Kumar Rooftop Solar",
    customerName: "Amit Kumar",
    mobileNumber: "9876543210",
    emailAddress: "amit.kumar@email.com",
    discom: "TPCODL",
    projectSize: "5kW",
    projectType: "On-Grid",
    projectCost: 325000,
    panelBrand: "Waaree",
    inverterBrand: "Growatt",
    panelType: "DCR",
    address: "Bhubaneswar, Odisha",
    consumerNumber: "TPC10021",
    leadBy: "Sanjay",
    status: "Installation Pending",
    installedCapacity: 5,
    installationDate: "2026-04-10",
    installationTeam: "Team Alpha",
    documents: [
      { _id: createId(), type: "Aadhaar", fileName: "amit-aadhaar.pdf", path: "/uploads/amit-aadhaar.pdf" },
      { _id: createId(), type: "Electricity Bill", fileName: "amit-bill.pdf", path: "/uploads/amit-bill.pdf" }
    ],
    createdAt: "2026-03-05T10:00:00.000Z"
  },
  {
    _id: "PRJ-002",
    customerId: "CUS-002",
    name: "Priya Das Hybrid System",
    customerName: "Priya Das",
    mobileNumber: "9123456780",
    emailAddress: "priya.das@email.com",
    discom: "TPSODL",
    projectSize: "3kW",
    projectType: "Hybrid",
    projectCost: 240000,
    panelBrand: "Adani",
    inverterBrand: "Sungrow",
    panelType: "NON-DCR",
    address: "Berhampur, Odisha",
    consumerNumber: "TPS20411",
    leadBy: "Rina",
    status: "Submitted in Bank",
    installedCapacity: 3,
    installationDate: "2026-04-15",
    installationTeam: "Team Beta",
    documents: [{ _id: createId(), type: "Agreement", fileName: "priya-agreement.pdf", path: "/uploads/priya-agreement.pdf" }],
    createdAt: "2026-03-12T12:30:00.000Z"
  },
  {
    _id: "PRJ-003",
    customerId: "CUS-003",
    name: "Green Foods Commercial Plant",
    customerName: "Green Foods Pvt Ltd",
    mobileNumber: "9000011111",
    emailAddress: "accounts@greenfoods.com",
    discom: "TPNODL",
    projectSize: "10kW",
    projectType: "On-Grid",
    projectCost: 610000,
    panelBrand: "Tata Power Solar",
    inverterBrand: "Fronius",
    panelType: "DCR",
    address: "Cuttack, Odisha",
    consumerNumber: "TPN30077",
    leadBy: "Arjun",
    status: "Subsidy Apply Pending",
    installedCapacity: 10,
    installationDate: "2026-04-22",
    installationTeam: "Commercial Crew",
    documents: [{ _id: createId(), type: "Bank Details", fileName: "green-bank.pdf", path: "/uploads/green-bank.pdf" }],
    createdAt: "2026-03-18T09:15:00.000Z"
  }
];

const demoExpenses = [
  { _id: createId(), projectId: "PRJ-001", projectName: "Amit Kumar Rooftop Solar", materialCost: 180000, laborCost: 25000, transportCost: 8000, totalCost: 213000 },
  { _id: createId(), projectId: "PRJ-002", projectName: "Priya Das Hybrid System", materialCost: 120000, laborCost: 18000, transportCost: 6000, totalCost: 144000 },
  { _id: createId(), projectId: "PRJ-003", projectName: "Green Foods Commercial Plant", materialCost: 390000, laborCost: 42000, transportCost: 17000, totalCost: 449000 }
];

const demoStock = [
  { _id: createId(), itemName: "Solar Panels 550W", category: "Solar Panels", availableQuantity: 120, unit: "pcs", stockIn: 150, stockOut: 30 },
  { _id: createId(), itemName: "String Inverter 5kW", category: "Inverters", availableQuantity: 22, unit: "pcs", stockIn: 30, stockOut: 8 },
  { _id: createId(), itemName: "Galvanized Structure Kit", category: "Structure Materials", availableQuantity: 40, unit: "sets", stockIn: 52, stockOut: 12 }
];

const demoInvoices = [
  { _id: createId(), invoiceNumber: "INV-1001", customerName: "Amit Kumar", projectName: "Amit Kumar Rooftop Solar", projectSize: "5kW", amount: 325000, status: "Paid", createdAt: "2026-03-08T11:00:00.000Z" },
  { _id: createId(), invoiceNumber: "INV-1002", customerName: "Priya Das", projectName: "Priya Das Hybrid System", projectSize: "3kW", amount: 240000, status: "Pending", createdAt: "2026-03-15T10:00:00.000Z" }
];

module.exports = {
  PIPELINE_STAGES,
  demoUsers,
  demoCustomers,
  demoProjects,
  demoExpenses,
  demoStock,
  demoInvoices,
  createId
};
