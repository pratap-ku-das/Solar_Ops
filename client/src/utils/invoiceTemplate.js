import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const currency = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatAmountWords = (amount) => {
  if (!amount) return "Zero only";
  return `${currency(amount)} only`;
};

const normalizeTaxSummary = (items, taxSummary) => {
  if (Array.isArray(taxSummary) && taxSummary.length) return taxSummary;
  return items.map((item) => {
    const taxable = Number(item.qty || 0) * Number(item.rate || 0);
    const gstRate = Number(item.gst || 0);
    const gstAmount = (taxable * gstRate) / 100;
    return {
      hsn: item.hsn || "-",
      taxable,
      cgstRate: gstRate / 2,
      sgstRate: gstRate / 2,
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      totalTax: gstAmount
    };
  });
};

export function generateInvoicePDF(invoice) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const company = invoice.companyId || invoice.company || {};
  const bank = company.bankDetails || invoice.bankDetails || {};
  const companyLogo = company.logo || company.profileLogo || company.companyLogo || "";

  const subtotal = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0);
  const totalTax = items.reduce((sum, item) => {
    const amount = Number(item.qty || 0) * Number(item.rate || 0);
    return sum + (amount * Number(item.gst || 0)) / 100;
  }, 0);
  const totalAmount = Number(invoice.amount || invoice.totalAmount || subtotal + totalTax || 0);
  const paidAmount = Array.isArray(invoice.payments)
    ? invoice.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    : Number(invoice.received || 0);
  const balance = Math.max(0, totalAmount - paidAmount);

  const summary = normalizeTaxSummary(items, invoice.taxSummary);

  doc.setFillColor(8, 116, 63);
  doc.roundedRect(8, 8, pageWidth - 16, 30, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  let companyTextStartX = 12;

  if (companyLogo && String(companyLogo).startsWith("data:image")) {
    try {
      doc.addImage(companyLogo, 12, 9, 28, 28);
      companyTextStartX = 44;
    } catch (error) {
      companyTextStartX = 12;
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(company.companyName || invoice.company || "SolarOps Company", companyTextStartX, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(company.address || "-", companyTextStartX, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("TAX INVOICE", pageWidth - 12, 22, { align: "right" });

  doc.setFillColor(invoice.status === "Paid" ? 16 : 220, invoice.status === "Paid" ? 185 : 53, invoice.status === "Paid" ? 129 : 69);
  doc.roundedRect(pageWidth - 46, 26, 34, 8, 2, 2, "F");
  doc.setFontSize(10);
  doc.text((invoice.status || "Pending").toUpperCase(), pageWidth - 29, 31.3, { align: "center" });

  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.roundedRect(8, 42, pageWidth - 16, 32, 1.5, 1.5, "S");
  doc.setFont("helvetica", "bold");
  doc.text("Company Details", 12, 49);
  doc.setFont("helvetica", "normal");
  doc.text(`GSTIN: ${company.gstNumber || "-"}`, 12, 55);
  doc.text(`Email: ${company.email || "-"}`, 12, 60);
  doc.text(`Phone: ${company.phone || "-"}`, 12, 65);

  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details", pageWidth / 2 + 8, 49);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${invoice.invoiceNumber || "-"}`, pageWidth / 2 + 8, 55);
  doc.text(`Invoice Date: ${formatDate(invoice.invoiceDate || invoice.date)}`, pageWidth / 2 + 8, 60);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, pageWidth / 2 + 8, 65);
  doc.text(`Place of Supply: ${company.address || "-"}`, pageWidth / 2 + 8, 70);

  doc.roundedRect(8, 78, pageWidth - 16, 26, 1.5, 1.5, "S");
  doc.setFont("helvetica", "bold");
  doc.text("Bill To", 12, 85);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.customerName || "-", 12, 91);
  doc.text(invoice.customerAddress || "-", 12, 96);
  doc.text(`Phone: ${invoice.customerPhone || "-"}`, 12, 101);

  doc.setFont("helvetica", "bold");
  doc.text("Project Details", pageWidth / 2 + 8, 85);
  doc.setFont("helvetica", "normal");
  doc.text(`Project Name: ${invoice.projectName || "-"}`, pageWidth / 2 + 8, 91);
  doc.text(`Project Type: ${invoice.projectType || "Solar Project"}`, pageWidth / 2 + 8, 96);
  doc.text(`Capacity: ${invoice.projectSize || "-"}`, pageWidth / 2 + 8, 101);

  autoTable(doc, {
    startY: 108,
    margin: { left: 8, right: 8 },
    head: [["#", "Item Description", "HSN / SAC", "Qty", "Unit", "Rate", "GST %", "Amount"]],
    body: items.map((item, idx) => {
      const amount = Number(item.qty || 0) * Number(item.rate || 0);
      return [
        idx + 1,
        item.name || "-",
        item.hsn || "-",
        Number(item.qty || 0),
        item.unit || "Nos",
        currency(item.rate),
        `${Number(item.gst || 0)}%`,
        currency(amount)
      ];
    }),
    styles: { fontSize: 8.5, cellPadding: 2.2, lineColor: [221, 226, 232], lineWidth: 0.2 },
    headStyles: { fillColor: [8, 116, 63], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      3: { halign: "center", cellWidth: 12 },
      4: { halign: "center", cellWidth: 16 },
      5: { halign: "right", cellWidth: 24 },
      6: { halign: "center", cellWidth: 14 },
      7: { halign: "right", cellWidth: 26 }
    }
  });

  const afterItemsY = doc.lastAutoTable.finalY + 4;

  autoTable(doc, {
    startY: afterItemsY,
    margin: { left: 8, right: pageWidth / 2 + 2 },
    head: [["GST Breakup", "Amount"]],
    body: summary.map((row) => [`${row.hsn} (GST ${(row.cgstRate || 0) * 2}%)`, currency(row.totalTax)]),
    styles: { fontSize: 8.5, cellPadding: 2.2 },
    headStyles: { fillColor: [235, 248, 241], textColor: [8, 116, 63] },
    columnStyles: { 1: { halign: "right" } }
  });

  autoTable(doc, {
    startY: afterItemsY,
    margin: { left: pageWidth / 2 + 2, right: 8 },
    head: [["Summary", "Amount"]],
    body: [
      ["Subtotal", currency(subtotal)],
      ["CGST", currency(totalTax / 2)],
      ["SGST", currency(totalTax / 2)],
      ["Grand Total", currency(totalAmount)],
      ["Amount Paid", currency(paidAmount)],
      ["Balance Due", currency(balance)]
    ],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [235, 248, 241], textColor: [8, 116, 63] },
    columnStyles: { 1: { halign: "right" } },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.row.index === 3) {
        hookData.cell.styles.fillColor = [8, 116, 63];
        hookData.cell.styles.textColor = 255;
        hookData.cell.styles.fontStyle = "bold";
      }
    }
  });

  const footerStart = Math.max(doc.lastAutoTable.finalY + 6, 242);
  doc.roundedRect(8, footerStart, pageWidth - 16, 40, 1.5, 1.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Payment Options", 12, footerStart + 7);
  doc.text("Bank Details", 52, footerStart + 7);
  doc.text("Terms & Conditions", 112, footerStart + 7);
  doc.text("Authorized Signature", 166, footerStart + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Account Name: ${bank.accountName || company.companyName || "-"}`, 52, footerStart + 13);
  doc.text(`Bank: ${bank.bankName || "-"}`, 52, footerStart + 18);
  doc.text(`Account No: ${bank.accountNumber || "-"}`, 52, footerStart + 23);
  doc.text(`IFSC: ${bank.ifscCode || "-"}`, 52, footerStart + 28);
  doc.text(`Branch: ${bank.branch || "-"}`, 52, footerStart + 33);
  doc.text(`UPI: ${bank.upiId || "-"}`, 52, footerStart + 38);

  const terms = [
    "1. Goods once sold will not be taken back.",
    "2. Warranty as per manufacturer policy.",
    "3. Delay in payment may attract additional charges.",
    "4. Subsidy process is subject to authority approval."
  ];
  terms.forEach((line, index) => {
    doc.text(line, 112, footerStart + 13 + index * 5);
  });

  doc.line(162, footerStart + 30, pageWidth - 12, footerStart + 30);
  doc.text(company.companyName || "Company", 166, footerStart + 36);

  doc.setFillColor(8, 116, 63);
  doc.rect(8, 286, pageWidth - 16, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text(company.email || "support@solarops.com", 12, 291.5);
  doc.text(company.companyName || "SolarOps", pageWidth / 2, 291.5, { align: "center" });
  doc.text(company.phone || "-", pageWidth - 12, 291.5, { align: "right" });

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(8.5);
  doc.text(`Amount in words: ${invoice.amountWords || formatAmountWords(totalAmount)}`, 12, 282);

  doc.save(`Invoice-${invoice.invoiceNumber || "1"}.pdf`);
}
