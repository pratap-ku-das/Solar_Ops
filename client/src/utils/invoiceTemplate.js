import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function generateInvoicePDF(invoice) {
  const doc = new jsPDF();
  const currency = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  // Header
  doc.setFontSize(16);
  doc.text("Tax Invoice", 105, 15, { align: "center" });

  // Company Info
  doc.setFontSize(12);
  doc.text("DG SOLAR ENTERPRISES", 14, 25);
  doc.setFontSize(10);
  doc.text("KHATA NO-19 PLOT NO-1880 LAKSHMAN MAHARANA MATIAPADA Puri", 14, 30);
  doc.text("Phone: 8249952092", 14, 35);
  doc.text("Email: dgsolarenterprises@gmail.com", 14, 40);
  doc.text("GSTIN: 21AWGPM1255M2ZJ", 14, 45);
  doc.text("State: 21-Odisha", 14, 50);

  // Bill To & Invoice Details
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Bill To:", 14, 60);
  doc.setFont(undefined, "normal");
  doc.text(invoice.customerName, 14, 65);
  doc.text(invoice.customerAddress || "", 14, 70, { maxWidth: 90 });
  doc.text(`Contact No: ${invoice.customerPhone || ""}`, 14, 75);

  doc.setFont(undefined, "bold");
  doc.text("Invoice Details:", 120, 60);
  doc.setFont(undefined, "normal");
  doc.text(`No: ${invoice.invoiceNumber || "1"}`, 120, 65);
  doc.text(`Date: ${invoice.date || new Date().toLocaleDateString()}`, 120, 70);
  doc.text(`Place of Supply: 21-Odisha`, 120, 75);

  // Items Table
  autoTable(doc, {
    startY: 80,
    head: [["#", "Item name", "HSN/SAC", "Quantity", "Unit", "Price/Unit (₹)", "GST(₹)", "Amount(₹)"]],
    body: (invoice.items || []).map((item, idx) => {
      const amount = (item.qty || 0) * (item.rate || 0);
      const gstAmt = amount * (item.gst || 0) / 100;
      return [
        idx + 1,
        item.name,
        item.hsn || "",
        item.qty,
        item.unit,
        currency(item.rate),
        currency(gstAmt),
        currency(amount + gstAmt)
      ];
    }),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [240, 240, 240], textColor: 40 },
    theme: "grid"
  });

  // Tax Summary Table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 5,
    head: [["HSN/SAC", "Taxable amount (₹)", "CGST", "SGST", "Total Tax(₹)"]],
    body: (invoice.taxSummary || []).map(row => [
      row.hsn,
      currency(row.taxable),
      `${row.cgstRate}%\n${currency(row.cgst)}`,
      `${row.sgstRate}%\n${currency(row.sgst)}`,
      currency(row.totalTax)
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [240, 240, 240], textColor: 40 },
    theme: "grid"
  });

  // Totals
  const y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text(`Total: ${currency(invoice.totalAmount)}`, 14, y);
  doc.setFont(undefined, "normal");
  doc.text(`Invoice Amount In Words: ${invoice.amountWords || ""}`, 14, y + 6);
  doc.text(`Received: ${currency(invoice.received)}`, 120, y);
  doc.text(`Balance: ${currency(invoice.balance)}`, 120, y + 6);

  // Bank Details
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  doc.text("Bank Details:", 14, y + 18);
  doc.setFont(undefined, "normal");
  doc.text("Name: PUNJAB NATIONAL BANK, POKHARIPUT", 14, y + 23);
  doc.text("Account No: 67602021000042457", 14, y + 28);
  doc.text("IFSC code: PUNB0676200", 14, y + 33);
  doc.text("Account Holder's Name: DG SOLAR ENTERPRISES", 14, y + 38);

  // Footer
  doc.setFontSize(9);
  doc.text("Thanks for doing business with us!", 14, y + 48);
  doc.text("www.vyaparapp.in", 14, y + 53);

  doc.save(`Invoice-${invoice.invoiceNumber || "1"}.pdf`);
}
