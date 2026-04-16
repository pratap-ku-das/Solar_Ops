const express = require("express");
const { demoProjects } = require("../data/sampleData");
const Project = require("../models/Project");
const router = express.Router();

// WhatsApp webhook for Twilio
router.post("/webhook", async (req, res) => {
  const from = req.body.From || "";
  const body = (req.body.Body || "").trim().toLowerCase();

  // Extract phone number (format: whatsapp:+919876543210)
  const phone = from.replace("whatsapp:", "");

  // Simple intent: project status
  if (body.includes("status")) {
    // Find project by customer mobile
    let project = null;
    if (process.env.ALLOW_DEMO_MODE === "true") {
      project = demoProjects.find((p) => p.mobileNumber === phone);
    } else {
      project = await Project.findOne({ mobileNumber: phone });
    }
    if (project) {
      return res.send(`<Response><Message>Your project \"${project.name}\" is currently at stage: ${project.status}.</Message></Response>`);
    } else {
      return res.send(`<Response><Message>No project found for your number.</Message></Response>`);
    }
  }

  // Default reply
  return res.send(`<Response><Message>Welcome to Solar PM! Reply with 'status' to get your project update.</Message></Response>`);
});

module.exports = router;
