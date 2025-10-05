// src/lib/exportFinancePDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ===================== Helpers ===================== */
export function formatCurrency(n) {
  const num = Number(n || 0);
  return `Rs ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "-";
const hasRows = (arr) => Array.isArray(arr) && arr.length > 0;

// Parse possibly signed / string amounts -> { abs }
function parseAmountAbs(raw) {
  if (raw == null) return 0;
  const s = String(raw).trim();
  const val =
    typeof raw === "number"
      ? Math.abs(raw)
      : Math.abs(parseFloat(s.replace(/[^0-9.-]/g, ""))) || 0;
  return val;
}

// Always show currency **without sign**
const fmtAmountNoSign = (raw) => formatCurrency(parseAmountAbs(raw));

// field pickers
const pick = (o, keys) => keys.find((k) => o?.[k] != null);
const getDate = (r) => r[pick(r, ["date", "createdAt", "txDate", "paidAt", "timestamp"])];
const getUpdated = (r) => r[pick(r, ["updatedAt", "modifiedAt", "lastUpdated"])];
const getType = (r) => r[pick(r, ["type", "category", "kind"])];
const getStatus = (r) => r[pick(r, ["status", "state"])];
const getDesc = (r) => r[pick(r, ["description", "desc", "note", "title", "narration"])];
const getAmount = (r) => r[pick(r, ["amount", "total", "value", "paid"])];

// classification
function isWithdrawal(r) {
  const t = (getType(r) || "").toLowerCase();
  const d = (getDesc(r) || "").toLowerCase();
  return t.includes("withdraw") || d.includes("withdraw");
}
function isSalary(r) {
  const t = (getType(r) || "").toLowerCase();
  const d = (getDesc(r) || "").toLowerCase();
  const s = (r.source || "").toLowerCase();
  return (
    t.includes("payroll") ||
    d.includes("payroll") ||
    d.includes("salary") ||
    d.includes("payslip") ||
    s.includes("payroll")
  );
}
function isIncome(r) {
  const t = (getType(r) || "").toLowerCase();
  return t.includes("income") || t.includes("payment") || t.includes("receipt");
}
function isExpense(r) {
  return !isWithdrawal(r) && !isSalary(r) && !isIncome(r);
}

/* ===================== Owner Overview Export ===================== */
export function exportFinancePDF({
  generatedAt = new Date(),
  periodLabel = "",
  totals = {},
  earnings = [],
  recent = [],
} = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;

  // Header
  doc.setFontSize(18);
  doc.text("Finance Report", margin, margin);
  doc.setFontSize(10);
  doc.text(
    `Generated: ${new Date(generatedAt).toLocaleString()}${
      periodLabel ? `  •  ${periodLabel}` : ""
    }`,
    margin,
    margin + 18
  );

  let y = margin + 36;

  /* ---------- Summary (totals) ---------- */
  const hasAnyTotals =
    totals &&
    (totals.availableBalance != null ||
      totals.thisMonthNet != null ||
      totals.lifetimeEarnings != null);

  if (hasAnyTotals) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Metric", "Amount"]],
      body: [
        ["Available Balance", fmtAmountNoSign(totals.availableBalance)],
        ["This Month (Net)", fmtAmountNoSign(totals.thisMonthNet)],
        ["Total Earnings", fmtAmountNoSign(totals.lifetimeEarnings)],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" } },
      alternateRowStyles: { fillColor: [248, 250, 253] },
    });
    y = doc.lastAutoTable.finalY + 18;
  }

  /* ---------- Monthly Earnings (no %) ---------- */
  if (hasRows(earnings)) {
    // Build "Change" in Rs (no minus). If backend provides m.change, use it;
    // otherwise derive from previous month's amount.
    const rows = earnings.map((m, i, arr) => {
      const amt = Number(m.amount || 0);
      const prev = i > 0 ? Number(arr[i - 1].amount || 0) : 0;
      const change = m.change != null ? Number(m.change) : amt - prev;
      return [m.month || "-", fmtAmountNoSign(amt), fmtAmountNoSign(change)];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Month", "Net", "Change"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      alternateRowStyles: { fillColor: [248, 250, 253] },
    });
    y = doc.lastAutoTable.finalY + 18;
  }

  /* ---------- Split recent ---------- */
  const salaryRows = recent.filter(isSalary);
  const withdrawalRows = recent.filter(isWithdrawal);
  const incomeRows = recent.filter((r) => !isWithdrawal(r) && isIncome(r));
  const expenseRows = recent.filter(isExpense);

  // generic section renderer with Txn + Updated + Description and seq IDs
  const renderSection = ({ title, rows }) => {
    if (!hasRows(rows)) return;

    doc.setFontSize(14);
    doc.text(title, margin, y);
    y += 8;

    autoTable(doc, {
      startY: y + 6,
      margin: { left: margin, right: margin },
      head: [["#", "Txn Date", "Updated", "Type", "Status", "Description", "Amount"]],
      body: rows.map((r, idx) => [
        String(idx + 1).padStart(4, "0"),
        fmtDate(getDate(r)),
        fmtDate(getUpdated(r)),
        getType(r) || "-",
        getStatus(r) || "-",
        getDesc(r) || "-",
        fmtAmountNoSign(getAmount(r)),
      ]),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
      columnStyles: { 6: { halign: "right" } },
      alternateRowStyles: { fillColor: [248, 250, 253] },
      didDrawPage: (data) => {
        y = data.cursor.y + 12;
      },
    });

    // Subtotal
    const total = rows.reduce((s, r) => s + parseAmountAbs(getAmount(r)), 0);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Subtotal", "Amount"]],
      body: [[`${title} Total`, formatCurrency(total)]],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [240, 242, 246], textColor: 20, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" } },
    });

    y = doc.lastAutoTable.finalY + 18;
  };

  // Order: Salary, Expenses, Payments Received, Withdrawals
  renderSection({ title: "Salary Payments", rows: salaryRows });
  renderSection({ title: "Transactions (Expenses)", rows: expenseRows });
  renderSection({ title: "Payments Received", rows: incomeRows });
  renderSection({ title: "Withdrawals", rows: withdrawalRows });

  // Nothing to show?
  if (
    !hasAnyTotals &&
    !hasRows(earnings) &&
    !hasRows(salaryRows) &&
    !hasRows(expenseRows) &&
    !hasRows(incomeRows) &&
    !hasRows(withdrawalRows)
  ) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Section", "Status"]],
      body: [["Overview", "No data for the selected period"]],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 8 },
      headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
    });
  }

  doc.save(`finance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ===================== Staff Salary (unchanged API) ===================== */
export function exportStaffSalaryTable({ staffName = "", staffEmail = "", records = [] } = {}) {
  const inferNameFromRecords = (recs) => {
    const r = Array.isArray(recs) && recs.length ? recs[0] : null;
    if (!r) return "";
    const fromRecord =
      r.staffName ||
      `${r.firstName || ""} ${r.lastName || ""}`.trim() ||
      r.employeeName ||
      "";
    return fromRecord;
  };
  const finalName =
    staffName ||
    inferNameFromRecords(records) ||
    (staffEmail ? staffEmail.split("@")[0] : "Employee");

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

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
      ["Employee", finalName || "-"],
      ["Email", staffEmail || "-"],
    ],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 120, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
    theme: "grid",
    alternateRowStyles: { fillColor: [248, 250, 253] },
  });

  if (!hasRows(records)) {
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

  const rows = records.map((r, idx) => {
    const period =
      r.periodStart
        ? new Date(r.periodStart).toLocaleString(undefined, { month: "long", year: "numeric" })
        : "-";
    const otHours =
      (Number(r.otHoursWeekday || 0) + Number(r.otHoursHoliday || 0)) || 0;

    const gross =
      Number(r.grossSalary ?? 0) ||
      (Number(r.basicSalary || 0) +
        Number(r.allowances || 0) +
        Number(r.otWeekdayAmt || 0) +
        Number(r.otHolidayAmt || 0));

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

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    margin: { left: 40, right: 40 },
    head: [
      ["No.", "Period", "Gross Pay", "Net Pay", "OT", "EPF", "ETF", "Loan", "Tax", "Created"],
    ],
    body: rows,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
    theme: "grid",
    alternateRowStyles: { fillColor: [248, 250, 253] },
    columnStyles: {
      0: { cellWidth: 36, halign: "right" },
      1: { cellWidth: 120 },
      2: { cellWidth: 90, halign: "right" },
      3: { cellWidth: 100, halign: "right", fontStyle: "bold" },
      4: { cellWidth: 50, halign: "right" },
      5: { cellWidth: 70, halign: "right" },
      6: { cellWidth: 70, halign: "right" },
      7: { cellWidth: 70, halign: "right" },
      8: { cellWidth: 70, halign: "right" },
      9: { cellWidth: 80 },
    },
    tableWidth: "auto",
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
