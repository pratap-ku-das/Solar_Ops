const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");

const generateInspectionPDF = async (data = {}) => {

  try {

    // DEFAULT TEMPLATE DATA

    const templateData = {

      customerName: "",
      address: "",
      consumerNumber: "",
      applicationNo: "",

      division: "",
      capacity: "",
      inspectionDate: "",

      consumerCategory: "",
      connectionType: "",
      contractDemand: "",
      arrear: "",
      developerName: "",
      installationDate: "",

      transformerCapacity: "",
      transformerLocation: "",
      totalConnectedCapacity: "",
      transformerAdequate: "",

      plantCapacity: "",
      plantSite: "",
      interconnectionType: "",
      singleLineApproval: "",

      inverterMake: "",
      inverterSerial: "",
      inverterCapacity: "",
      inverterVoltage: "",
      antiIslanding: "",

      panelMake: "",
      panelSerial: "",
      panelType: "",
      panelCapacity: "",
      totalPanels: "",
      totalArrayCapacity: "",

      dcEarthing: "",
      acEarthing: "",

      acdcdb: "",
      manualSwitch: "",
      lightning: "",
      spd: "",
      relaySwitch: "",

      backFeeding: "",
      eicApproval: "",
      safetyCertificate: "",
      actualSLD: "",
      testReport: "",

      totalMeters: "",
      meterMake: "",
      meterSerial: "",
      meterPhase: "",
      meterCapacity: "",
      meterConstant: "",

      remarks: "",

      gridSatisfactory: "",
      switchProvision: "",
      operationMaintenance: "",

      ...data

    };

    // TEMPLATE PATH

    const templatePath = path.join(
      __dirname,
      "templates",
      "inspectionReport.ejs"
    );

    console.log("Template Path:", templatePath);

    // RENDER EJS HTML

    const html = await ejs.renderFile(
      templatePath,
      templateData
    );

    // LAUNCH PUPPETEER

    const browser = await puppeteer.launch({

      headless: true,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]

    });

    const page = await browser.newPage();

    // LOAD HTML

    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    // GENERATE PDF

    const pdf = await page.pdf({

      format: "A4",

      printBackground: true,

      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px"
      }

    });

    await browser.close();

    return pdf;

  } catch (error) {

    console.log("PDF GENERATION ERROR:");
    console.log(error);

    throw error;

  }

};

module.exports = generateInspectionPDF;