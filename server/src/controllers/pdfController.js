const generateInspectionPDF =
require("../pdf/generateInspectionPDF");

const generatePDF = async (req, res) => {

  try {

    const pdf =
      await generateInspectionPDF(req.body);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition":
      "attachment; filename=inspection-report.pdf",
    });

    res.send(pdf);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "PDF generation failed"
    });

  }

};

module.exports = {
  generatePDF
};