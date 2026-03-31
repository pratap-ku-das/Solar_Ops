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

  const users = await User.insertMany(demoUsers);
  const customers = await Customer.insertMany(demoCustomers);

  const customerMap = new Map(customers.map((customer, index) => [demoCustomers[index]._id, customer._id]));

  const projectsToInsert = demoProjects.map((project) => ({
    ...project,
    customerId: customerMap.get(project.customerId)
  }));

  await Project.insertMany(projectsToInsert);
  await Expense.insertMany(demoExpenses);
  await Stock.insertMany(demoStock);
  await Invoice.insertMany(demoInvoices);

  console.log(`Seed complete: ${users.length} users, ${customers.length} customers inserted.`);
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
