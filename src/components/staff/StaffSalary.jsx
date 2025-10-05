// src/components/staff/StaffSalary.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/utils";

const BASE_URL = "http://localhost:5000";

// Get the signed-in user's email, normalized
function getCurrentUserEmail() {
  try {
    const raw = localStorage.getItem("user"); // preferred: {email, role, ...}
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.email) return String(u.email).trim().toLowerCase();
    }
  } catch {}
  const alt = localStorage.getItem("userEmail"); // fallback legacy key
  if (alt) return String(alt).trim().toLowerCase();
  return "";
}

export default function StaffSalary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const staffEmail = getCurrentUserEmail();

  const load = async () => {
    try {
      setLoading(true);
      if (!staffEmail) {
        setItems([]);
        return;
      }
      // ask server for only this staff member's records
      const { data } = await axios.get(
        `${BASE_URL}/api/salaries?email=${encodeURIComponent(staffEmail)}`
      );
      const list = Array.isArray(data) ? data : [];
      // safety net: also filter locally
      const mine = list.filter(
        (r) => String(r.staffEmail || "").trim().toLowerCase() === staffEmail
      );
      setItems(mine);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // live refresh on backend finance updates (SSE)
    const ev = new EventSource(`${BASE_URL}/api/salaries/events`);
    ev.onmessage = () => load();
    return () => ev.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffEmail]);

  const rows = useMemo(() => {
    return items
      .slice()
      .sort(
        (a, b) =>
          new Date(b.periodStart || b.createdAt || 0) -
          new Date(a.periodStart || a.createdAt || 0)
      )
      .map((rec) => ({
        _id: rec._id,
        period: formatPeriod(rec.periodStart, rec.periodEnd),
        gross: Number(rec.grossSalary ?? (Number(rec.basicSalary || 0) + Number(rec.allowances || 0))),
        net: Number(rec.netSalary || 0),
        otHours: (Number(rec.otHoursWeekday || 0) + Number(rec.otHoursHoliday || 0)) || 0,
        rec,
      }));
  }, [items]);

  const downloadPayslip = (rec) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Payslip", 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

    autoTable(doc, {
      startY: 80,
      head: [["Field", "Value"]],
      body: [
        ["Employee", rec.staffName],
        ["Email", rec.staffEmail],
        ["Period", formatPeriod(rec.periodStart, rec.periodEnd)],
      ],
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Component", "Amount"]],
      body: [
        ["Basic Salary", formatCurrency(rec.basicSalary)],
        ["Allowances", formatCurrency(rec.allowances)],
        ["OT (Weekday)", formatCurrency(rec.otWeekdayAmt || 0)],
        ["OT (Sun/Holiday)", formatCurrency(rec.otHolidayAmt || 0)],
        ["Gross Pay", formatCurrency(rec.grossSalary)],
        ["EPF", `- ${formatCurrency(rec.epf)}`],
        ["Loan", rec.loan ? `- ${formatCurrency(rec.loan)}` : "0"],
        ["Tax", rec.tax ? `- ${formatCurrency(rec.tax)}` : "0"],
        ["Net Pay", formatCurrency(rec.netSalary)],
        ["ETF (Employer)", formatCurrency(rec.etf || 0)],
      ],
    });

    const fname = `payslip-${(rec.periodStart || "").slice(0, 10)}-${(rec.staffEmail || "staff")
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "_")}.pdf`;
    doc.save(fname);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Salary & Benefits</h1>
        <p className="text-muted-foreground">View your compensation details and payment history</p>
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
              disabled={!rows.length}
              onClick={() => rows.forEach((r) => downloadPayslip(r.rec))}
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!staffEmail && (
            <div className="mb-4 text-sm text-red-500">
              No user email found. Make sure login stores a <code>user</code> with an <code>email</code> in localStorage.
            </div>
          )}
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
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>No salary records yet.</TableCell>
                </TableRow>
              )}
              {!loading &&
                rows.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium">{r.period}</TableCell>
                    <TableCell>{formatCurrency(r.gross)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(r.net)}</TableCell>
                    <TableCell>{r.otHours}h</TableCell>
                    <TableCell>
                      <Badge variant="default">Paid</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => downloadPayslip(r.rec)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatPeriod(start, end) {
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  if (s && e && s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return s.toLocaleString(undefined, { month: "long", year: "numeric" });
  }
  const fmt = (d) => (d ? d.toLocaleDateString() : "");
  return `${fmt(s)} – ${fmt(e)}`.trim();
}
