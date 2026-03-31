require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Project = require("../models/Project");
const Expense = require("../models/Expense");
const Stock = require("../models/Stock");
const Invoice = require("../models/Invoice");
const { demoUsers, demoCustomers, demoProjects, demoExpenses, demoStock, demoInvoices } = require("../data/sampleData");

const seed = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.log("Seed skipped: MongoDB is not connected.");
    process.exit(0);
  }

  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Project.deleteMany({}),
    Expense.deleteMany({}),
    Stock.deleteMany({}),
    Invoice.deleteMany({})
  ]);

  const users = [];
  for (const demoUser of demoUsers) {
    const { _id, ...userData } = demoUser;
    const user = await User.create({ ...userData, isActive: true });
    users.push(user);
  }

  const customers = await Customer.insertMany(
    demoCustomers.map(({ _id, ...customer }) => customer)
  );

  const customerMap = new Map(customers.map((customer, index) => [demoCustomers[index]._id, customer._id]));

  const projectsToInsert = demoProjects.map(({ _id, documents = [], ...project }) => ({
    ...project,
    customerId: customerMap.get(project.customerId),
    documents: documents.map(({ type, fileName, path }) => ({ type, fileName, path }))
  }));

  const insertedProjects = await Project.insertMany(projectsToInsert);
  const projectMap = new Map(insertedProjects.map((project, index) => [demoProjects[index]._id, project._id]));

  await Expense.insertMany(
    demoExpenses.map(({ _id, ...expense }) => ({
      ...expense,
      projectId: projectMap.get(expense.projectId)
    }))
  );
  await Stock.insertMany(demoStock.map(({ _id, ...item }) => item));
  await Invoice.insertMany(demoInvoices.map(({ _id, ...invoice }) => invoice));

  console.log(`Seed complete: ${users.length} users, ${customers.length} customers inserted.`);
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
