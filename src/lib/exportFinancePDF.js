// src/lib/exportFinancePDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ===================== Shared helpers ===================== */
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

// Show amounts without sign (because the table’s Type already conveys expense/income)
function parseAmountAbs(raw) {
  if (raw == null) return 0;
  const s = String(raw).trim();
  const val =
    typeof raw === "number"
      ? Math.abs(raw)
      : Math.abs(parseFloat(s.replace(/[^0-9.-]/g, ""))) || 0;
  return val;
}
const fmtAmountNoSign = (raw) => formatCurrency(parseAmountAbs(raw));

// Safe pick
const pick = (o, keys) => keys.find((k) => o && o[k] != null);

// Flexible getters for “recent” items
const getDate = (r) =>
  r[pick(r, ["date", "createdAt", "txDate", "paidAt", "timestamp", "transactionDate"])];
const getUpdated = (r) =>
  r[
    pick(r, [
      "updatedAt",
      "updated",
      "dateUpdated",
      "lastUpdated",
      "modifiedAt",
      "lastModified",
      "updated_on",
      "updatedOn",
      "modified_on",
      "modifiedOn",
    ])
  ];
const getType = (r) => r[pick(r, ["type", "category", "kind"])];
const getStatus = (r) => r[pick(r, ["status", "state"])];
const getDesc = (r) => r[pick(r, ["description", "desc", "note", "title", "narration"])];
const getAmount = (r) => r[pick(r, ["amount", "total", "value", "paid"])];

// Classification for recent[] groups
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

/* ==========================================================
   Finance Report (Owner)
   Renders: Overview → Monthly → Transactions (Expenses, Income, Withdrawals)
            → Salary (landscape, multi-page)
   ========================================================== */
export function exportFinancePDF({
  generatedAt = new Date(),
  periodLabel = "",
  totals = {},
  earnings = [],
  recent = [],
  salaryRecords = [],
} = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;

  // ---------- Header ----------
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

  // ---------- Overview ----------
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

  // ---------- Monthly Earnings ----------
  if (hasRows(earnings)) {
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

  // ---------- Transactions ----------
  const salaryRows = recent.filter(isSalary);
  const withdrawalRows = recent.filter(isWithdrawal);
  const incomeRows = recent.filter((r) => !isWithdrawal(r) && isIncome(r));
  const expenseRows = recent.filter(isExpense);

  const transColumnStyles = {
    0: { cellWidth: 34, halign: "right" },
    1: { cellWidth: 74 },
    2: { cellWidth: 84 },
    3: { cellWidth: 60 },
    4: { cellWidth: 74 },
    5: { cellWidth: "auto" },
    6: { cellWidth: 90, halign: "right" },
  };

  const renderSection = ({ title, rows }) => {
    if (!hasRows(rows)) return;

    doc.setFontSize(14);
    doc.text(title, margin, y);
    y += 8;

    autoTable(doc, {
      startY: y + 6,
      margin: { left: margin, right: margin },
      tableWidth: "auto",
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
      pageBreak: "auto",
      overflow: "linebreak",
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 6, valign: "top" },
      headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
      columnStyles: transColumnStyles,
      alternateRowStyles: { fillColor: [248, 250, 253] },
    });

    y = doc.lastAutoTable.finalY + 18;

    // Subtotal for this section
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

  renderSection({ title: "Transactions (Expenses)", rows: expenseRows });
  renderSection({ title: "Payments Received", rows: incomeRows });
  renderSection({ title: "Withdrawals", rows: withdrawalRows });

  // ---------- Salary Payments (landscape) ----------
  if (hasRows(salaryRecords)) {
    doc.addPage("a4", "landscape");

    const lm = 40;
    let sy = 40;

    doc.setFontSize(16);
    doc.text("Salary Payments (Detailed)", lm, sy);
    doc.setFontSize(10);
    doc.text(
      "Includes period, OT, EPF/ETF, loan, tax, gross & net pay",
      lm,
      sy + 16
    );
    sy += 28;

    const g = (r, keys, d = 0) => Number(r[pick(r, keys)] ?? d);
    const gs = (r, keys, d = "") => String(r[pick(r, keys)] ?? d);

    const getStaffName = (r) =>
      gs(r, ["staffName", "employeeName", "name", "fullName"], "") ||
      `${gs(r, ["firstName"], "")} ${gs(r, ["lastName"], "")}`.trim();

    const rows = salaryRecords.map((r, idx) => {
      const basic = g(r, ["basicSalary", "basic"]);
      const allowances = g(r, ["allowances"]);
      const epf = g(r, ["epf"]);
      const etf = g(r, ["etf"]);
      const loan = g(r, ["loan"]);
      const tax = g(r, ["tax"]);
      const gross = Number(r.grossSalary ?? 0) || basic + allowances;
      const net = Number(r.netSalary ?? 0) || gross - (epf + etf + loan + tax);

      return [
        String(idx + 1).padStart(4, "0"),
        getStaffName(r) || "-",
        r.staffEmail || "-",
        fmtDate(r.periodStart),
        fmtDate(r.periodEnd),
        formatCurrency(basic),
        formatCurrency(allowances),
        formatCurrency(epf),
        formatCurrency(etf),
        formatCurrency(loan),
        formatCurrency(tax),
        formatCurrency(gross),
        formatCurrency(net),
      ];
    });

    autoTable(doc, {
      startY: sy,
      margin: { left: lm, right: lm },
      pageBreak: "auto",
      overflow: "linebreak",
      theme: "grid",
      head: [
        [
          "#",
          "Staff",
          "Email",
          "Period Start",
          "Period End",
          "Basic",
          "Allowances",
          "EPF",
          "ETF",
          "Loan",
          "Tax",
          "Gross",
          "Net",
        ],
      ],
      body: rows,
      styles: { fontSize: 9, cellPadding: 5, valign: "top" },
      headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 253] },
    });
  }

  doc.save(`finance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ==========================================================
   Staff Salary History (single staff)
   ========================================================== */
export function exportStaffSalaryTable({
  staffName = "",
  staffEmail = "",
  records = [],
} = {}) {
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

  doc.setFontSize(16);
  doc.text("Salary History", 40, 40);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

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
    const period = r.periodStart
      ? new Date(r.periodStart).toLocaleString(undefined, {
          month: "long",
          year: "numeric",
        })
      : "-";
    const gross =
      Number(r.grossSalary ?? 0) ||
      Number(r.basicSalary || 0) + Number(r.allowances || 0);

    return [
      String(idx + 1).padStart(3, "0"),
      period,
      formatCurrency(gross),
      formatCurrency(r.netSalary),
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
    head: [["No.", "Period", "Gross", "Net", "EPF", "ETF", "Loan", "Tax", "Created"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
    theme: "grid",
    alternateRowStyles: { fillColor: [248, 250, 253] },
  });

  doc.save(
    `salary-history-${finalName || "employee"}-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`
  );
}
