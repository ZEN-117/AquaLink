// src/lib/exportFinancePDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Simple currency helper (Rs with thousand separators) */
function formatCurrency(n) {
  const num = Number(n || 0);
  return `Rs ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Owner dashboard full report (kept for compatibility) */
export async function exportFinancePDF() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text("Finance Report", 40, 40);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

  autoTable(doc, {
    startY: 80,
    head: [["Section", "Status"]],
    body: [["Transactions & Payments", "See in-app lists"]],
    styles: { fontSize: 10, cellPadding: 8 },
    headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
    theme: "grid",
  });

  doc.save(`finance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Staff “Download All” – table of a single staff member’s salary records
 * Renders in A4 LANDSCAPE so all columns fit neatly.
 * @param {{staffName:string, staffEmail:string, records:Array}} opts
 */
export function exportStaffSalaryTable({ staffName = "", staffEmail = "", records = [] }) {
  // 👉 Landscape to fit all columns
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.text("Salary History", 40, 40);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

  // Staff block
  autoTable(doc, {
    startY: 80,
    margin: { left: 40, right: 40 },
    head: [["Field", "Value"]],
    body: [
      ["Employee", staffName || "-"],
      ["Email", staffEmail || "-"],
    ],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 120, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
    theme: "grid",
    alternateRowStyles: { fillColor: [248, 250, 253] },
  });

  // Empty state
  if (!Array.isArray(records) || records.length === 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      margin: { left: 40, right: 40 },
      head: [["Info"]],
      body: [["No salary records available."]],
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
      theme: "grid",
    });
    doc.save(`salary-history-${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }

  // Build rows
  const rows = records.map((r, idx) => {
    const periodDate = r.periodStart ? new Date(r.periodStart) : null;
    const period =
      periodDate?.toLocaleString(undefined, { month: "long", year: "numeric" }) || "-";

    const otHours =
      (Number(r.otHoursWeekday || 0) + Number(r.otHoursHoliday || 0)) || 0;

    const gross =
      Number(r.basicSalary || 0) +
      Number(r.allowances || 0) +
      Number(r.otWeekdayAmt || 0) +
      Number(r.otHolidayAmt || 0);

    return [
      String(idx + 1).padStart(3, "0"),
      period,
      formatCurrency(gross),
      formatCurrency(r.netSalary),
      `${otHours}h`,
      formatCurrency(r.epf || 0),
      formatCurrency(r.etf || 0),
      formatCurrency(r.loan || 0),
      formatCurrency(r.tax || 0),
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
    ];
  });

  // Column widths tuned to fit within landscape page with 40pt margins on each side
  // Total ≈ 36 + 120 + 90 + 100 + 50 + 70 + 70 + 70 + 70 + 80 = 756
  // A4 landscape width ≈ 842pt; 842 - 80 margins = 762pt => fits safely.
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    margin: { left: 40, right: 40 },
    head: [
      [
        "No.",
        "Period",
        "Gross Pay",
        "Net Pay",
        "OT",
        "EPF",
        "ETF",
        "Loan",
        "Tax",
        "Created",
      ],
    ],
    body: rows,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: {
      fillColor: [24, 64, 228],
      textColor: 255,
      fontStyle: "bold",
    },
    theme: "grid",
    alternateRowStyles: { fillColor: [248, 250, 253] },
    columnStyles: {
      0: { cellWidth: 36, halign: "right" },  // No.
      1: { cellWidth: 120 },                 // Period
      2: { cellWidth: 90, halign: "right" }, // Gross
      3: { cellWidth: 100, halign: "right", fontStyle: "bold" }, // Net
      4: { cellWidth: 50, halign: "right" }, // OT
      5: { cellWidth: 70, halign: "right" }, // EPF
      6: { cellWidth: 70, halign: "right" }, // ETF
      7: { cellWidth: 70, halign: "right" }, // Loan
      8: { cellWidth: 70, halign: "right" }, // Tax
      9: { cellWidth: 80 },                  // Created
    },
    // Let long tables naturally flow across pages in landscape
    tableWidth: "auto",
    didParseCell: (data) => {
      // Make “Net Pay” bold
      if (data.section === "body" && data.column.index === 3) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  const periodHint =
    records[0]?.periodStart &&
    new Date(records[0].periodStart).toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });

  doc.save(
    `salary-history${periodHint ? "-" + periodHint : ""}-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`
  );
}
