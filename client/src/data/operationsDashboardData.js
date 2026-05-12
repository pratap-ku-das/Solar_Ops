/** Operational snapshot for SolarOps Project Manager dashboard — realistic Indian EPC data */

export const pipelineAnalytics = [
  {
    stage: "Document Collection",
    projects: 14,
    conversionPct: 72,
    delays: 2,
    trend: 78,
    funnelPct: 100
  },
  {
    stage: "Inspection Process",
    projects: 9,
    conversionPct: 68,
    delays: 3,
    trend: 71,
    funnelPct: 78
  },
  {
    stage: "Login Required",
    projects: 6,
    conversionPct: 54,
    delays: 4,
    trend: 62,
    funnelPct: 61
  },
  {
    stage: "Installation Pending",
    projects: 11,
    conversionPct: 81,
    delays: 1,
    trend: 85,
    funnelPct: 52
  },
  {
    stage: "Subsidy Processing",
    projects: 8,
    conversionPct: 76,
    delays: 2,
    trend: 74,
    funnelPct: 41
  }
];

export const pendingTasks = [
  {
    id: "t1",
    title: "Namita Malik",
    stage: "Document Collection",
    detail: "Aadhaar mask + latest electricity bill pending from consumer portal",
    priority: "high",
    due: "14 May 2026",
    accent: "blue"
  },
  {
    id: "t2",
    title: "PRATAP KUMAR DAS",
    stage: "Inspection Process",
    detail: "DISCOM site inspection slot — MSEDCL Pune circle",
    priority: "high",
    due: "15 May 2026",
    accent: "amber"
  },
  {
    id: "t3",
    title: "Rahul Sharma",
    stage: "Login Required",
    detail: "Lender portal OTP not verified — resend scheduled",
    priority: "medium",
    due: "13 May 2026",
    accent: "blue"
  },
  {
    id: "t4",
    title: "DISCOM Approval",
    stage: "6 Projects",
    detail: "Batch escalation with West Zone grid team — avg aging 9 days",
    priority: "critical",
    due: "12 May 2026",
    accent: "red"
  },
  {
    id: "t5",
    title: "Invoice Follow-up",
    stage: "₹4,20,000 Pending",
    detail: "Demand note + GST break-up for Shree Ganesh Foods C&I phase-2",
    priority: "medium",
    due: "16 May 2026",
    accent: "purple"
  }
];

export const recentProjects = [
  {
    id: "p1",
    customer: "Namita Malik",
    size: "5 kW",
    type: "Residential rooftop",
    discom: "MSEDCL",
    stage: "Document Collection",
    progress: 42,
    stageTone: "blue"
  },
  {
    id: "p2",
    customer: "PRATAP KUMAR DAS",
    size: "10 kW",
    type: "Commercial rooftop",
    discom: "TP Western Odisha",
    stage: "Inspection Process",
    progress: 68,
    stageTone: "amber"
  },
  {
    id: "p3",
    customer: "Rajesh Patel",
    size: "3 kW",
    type: "Residential rooftop",
    discom: "Torrent Power",
    stage: "Subsidy Processing",
    progress: 81,
    stageTone: "purple"
  },
  {
    id: "p4",
    customer: "Sunita Verma",
    size: "8 kW",
    type: "Hybrid (grid-tie + backup)",
    discom: "Adani Electricity",
    stage: "Installation Pending",
    progress: 55,
    stageTone: "emerald"
  }
];

export const installationSchedule = [
  {
    id: "i1",
    customer: "Pratap Kumar Das",
    date: "28 May 2026",
    stage: "Login Required",
    city: "Pune, Maharashtra",
    team: "Team Alpha"
  },
  {
    id: "i2",
    customer: "Meera Shah",
    date: "30 May 2026",
    stage: "Installation Pending",
    city: "Nashik, Maharashtra",
    team: "Team Bravo"
  },
  {
    id: "i3",
    customer: "Kiran Pawar",
    date: "2 Jun 2026",
    stage: "Document Collection",
    city: "Ahmedabad, Gujarat",
    team: "Team Delta"
  },
  {
    id: "i4",
    customer: "Shree Ganesh Foods Pvt Ltd",
    date: "5 Jun 2026",
    stage: "Subsidy Processing",
    city: "Surat, Gujarat",
    team: "C&I Crew North"
  }
];

export const kpiSparklines = {
  projects: [32, 34, 35, 37, 38, 40, 41, 42],
  customers: [108, 110, 114, 118, 120, 124, 126, 128],
  capacity: [112, 118, 122, 126, 130, 135, 139, 142],
  revenue: [210, 218, 225, 230, 235, 240, 245, 248.75]
};
