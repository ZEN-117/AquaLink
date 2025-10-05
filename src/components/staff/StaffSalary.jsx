// src/components/staff/StaffSalary.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PDF helpers
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { exportStaffSalaryTable } from "@/lib/exportFinancePDF";

const BASE_URL = "http://localhost:5000";

// ---------- helpers ----------
const currency = (n) =>
  `Rs ${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function formatPeriod(start, end) {
  const s = start ? new Date(start) : null;
  if (!s) return "";
  return s.toLocaleString(undefined, { month: "long", year: "numeric" });
}

// Resolve a display name from many possible shapes
function resolveNameFromUser(u) {
  if (!u) return "";
  const first = u.firstName || u.given_name || "";
  const last = u.lastName || u.family_name || "";
  const fromParts = `${first} ${last}`.trim();
  if (fromParts) return fromParts;
  return (
    u.name ||
    u.fullName ||
    u.displayName ||
    u.username ||
    (typeof u.profile === "object" && (u.profile.fullName || "")) ||
    ""
  );
}

function resolveEmailFromUser(u) {
  if (!u) return "";
  return (
    u.email ||
    (typeof u.user === "object" && u.user.email) ||
    u.contactEmail ||
    ""
  );
}

// Build a tidy two-column payslip PDF (single record)
function renderPayslipPDF(rec) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.text("Payslip", margin, margin);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 18);

  // Employee info
  autoTable(doc, {
    startY: margin + 36,
    margin: { left: margin, right: margin },
    head: [["Field", "Value"]],
    body: [
      ["Employee", rec.staffName || "-"],
      ["Email", rec.staffEmail || "-"],
      ["Period", formatPeriod(rec.periodStart, rec.periodEnd)],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 6, lineColor: [200, 206, 211], lineWidth: 0.6 },
    headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: Math.min(180, pageWidth * 0.35), fontStyle: "bold" },
      1: { cellWidth: "auto" },
    },
    alternateRowStyles: { fillColor: [248, 250, 253] },
  });

  // Pay components
  const weekdayOT = Number(rec.otWeekdayAmt || 0);
  const holidayOT = Number(rec.otHolidayAmt || 0);

  const rows = [
    ["Basic Salary", currency(rec.basicSalary)],
    ["Allowances", currency(rec.allowances)],
  ];

  if (weekdayOT) rows.push(["Weekday OT", currency(weekdayOT)]);
  if (holidayOT) rows.push(["Holiday OT", currency(holidayOT)]);

  rows.push(["", ""]); // spacer

  const gross =
    Number(rec.grossSalary ?? 0) ||
    (Number(rec.basicSalary || 0) +
      Number(rec.allowances || 0) +
      weekdayOT +
      holidayOT);

  rows.push(["Gross Salary", currency(gross)]);
  rows.push(["EPF", `- ${currency(rec.epf || 0)}`]);
  rows.push(["ETF", `- ${currency(rec.etf || 0)}`]);
  rows.push(["Loan", rec.loan ? `- ${currency(rec.loan)}` : currency(0)]);
  rows.push(["Tax", rec.tax ? `- ${currency(rec.tax)}` : currency(0)]);
  rows.push(["", ""]);
  rows.push(["Net Salary", currency(rec.netSalary)]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    margin: { left: margin, right: margin },
    head: [["Component", "Amount"]],
    body: rows,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 6, lineColor: [200, 206, 211], lineWidth: 0.6 },
    headStyles: { fillColor: [24, 64, 228], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 253] },
    columnStyles: {
      0: { cellWidth: Math.min(240, pageWidth * 0.45) },
      1: { cellWidth: "auto", halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        const label = String(data.row.raw?.[0] || "").toLowerCase();
        if (label === "gross salary" || label === "net salary") {
          data.cell.styles.fontStyle = "bold";
        }
        if (label === "") {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.lineWidth = 0;
          data.cell.text = [""];
        }
      }
    },
  });

  doc.save(`payslip-${formatPeriod(rec.periodStart, rec.periodEnd)}.pdf`);
}

export default function StaffSalary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // read possible user object from localStorage (saved at login)
  const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userObj = useMemo(() => {
    try {
      return userRaw ? JSON.parse(userRaw) : null;
    } catch {
      return null;
    }
  }, [userRaw]);

  const storedEmail = useMemo(() => {
    // explicit fallback key used in some flows
    return (
      resolveEmailFromUser(userObj) ||
      (typeof window !== "undefined" ? localStorage.getItem("userEmail") : "") ||
      ""
    );
  }, [userObj]);

  const storedName = useMemo(() => resolveNameFromUser(userObj), [userObj]);

  // Load salary records for the logged-in staff email
  const load = async (email) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/api/salaries?email=${encodeURIComponent(email || "")}`
      );
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(storedEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Final, robust staff name & email to use in the PDF header.
  const finalEmail = storedEmail;

  const finalName = useMemo(() => {
    // 1) user profile name
    if (storedName) return storedName;

    // 2) infer from first record when available
    const r = items?.[0];
    if (r) {
      const fromRecord =
        r.staffName ||
        `${r.firstName || ""} ${r.lastName || ""}`.trim() ||
        r.employeeName ||
        "";
      if (fromRecord) return fromRecord;
    }

    // 3) fall back to email prefix
    if (finalEmail) return finalEmail.split("@")[0];

    // 4) last resort
    return "Employee";
  }, [items, storedName, finalEmail]);

  const downloadPayslip = (rec) => {
    renderPayslipPDF({
      ...rec,
      staffName: finalName,
      staffEmail: finalEmail,
    });
  };

  const downloadAllAsTable = () => {
    // Always pass robust name/email so the Staff block is filled
    exportStaffSalaryTable({
      staffName: finalName,
      staffEmail: finalEmail || "",
      records: items,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Salary & Benefits</h1>
        <p className="text-muted-foreground">
          View your compensation details and payment history
        </p>
      </div>

      <Card className="border-aqua/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent salary payments</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!items.length}
              onClick={downloadAllAsTable}
              title="Download a single PDF with this table"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6}>Loading…</TableCell>
                </TableRow>
              )}
              {!loading && !items.length && (
                <TableRow>
                  <TableCell colSpan={6}>No salary records yet.</TableCell>
                </TableRow>
              )}
              {!loading &&
                items.map((rec) => {
                  const gross =
                    Number(rec.grossSalary ?? 0) ||
                    (Number(rec.basicSalary || 0) +
                      Number(rec.allowances || 0) +
                      Number(rec.otWeekdayAmt || 0) +
                      Number(rec.otHolidayAmt || 0));
                  const otHours =
                    (Number(rec.otHoursWeekday || 0) +
                      Number(rec.otHoursHoliday || 0)) || 0;

                  return (
                    <TableRow key={rec._id}>
                      <TableCell>
                        {formatPeriod(rec.periodStart, rec.periodEnd)}
                      </TableCell>
                      <TableCell>{currency(gross)}</TableCell>
                      <TableCell className="font-medium">
                        {currency(rec.netSalary)}
                      </TableCell>
                      <TableCell>{otHours}h</TableCell>
                      <TableCell>
                        <Badge variant="default">Paid</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadPayslip(rec)}
                          title="Download payslip"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
