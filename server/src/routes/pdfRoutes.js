const express = require("express");

const router = express.Router();

const {
  generatePDF
} = require("../controllers/pdfController");

router.post(
  "/generate-inspection",
  generatePDF
);

module.exports = router;