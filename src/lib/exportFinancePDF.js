// src/lib/exportFinancePDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // call as a function we import
import { formatCurrency } from "../utils";

// Point straight at your backend in dev. If you add a Vite proxy, switch to "/api".
const API_BASE = "http://localhost:5000/api";

// 0001-style padding
const pad = (n, width = 4) => String(n).padStart(width, "0");

// Strict JSON fetch that bypasses cache and rejects HTML responses
async function getJson(url) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  // If any proxy returns 304 or non-OK, retry with a cache-buster
  if (res.status === 304 || !res.ok) {
    const sep = url.includes("?") ? "&" : "?";
    const retry = await fetch(`${url}${sep}ts=${Date.now()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!retry.ok) {
      const txt = await retry.text().catch(() => "");
      throw new Error(`Failed to load ${url} (${retry.status}). First bytes: ${txt.slice(0, 80)}`);
    }
    const ct2 = retry.headers.get("content-type") || "";
    if (!ct2.includes("application/json")) {
      const txt = await retry.text().catch(() => "");
      throw new Error(`Expected JSON from ${url}. Got ${ct2}. First bytes: ${txt.slice(0, 80)}`);
    }
    return retry.json();
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Expected JSON from ${url}. Got ${ct}. First bytes: ${txt.slice(0, 80)}`);
  }

  return res.json();
}

export async function exportFinancePDF() {
  // 1) Fresh data
  const [txs, users, pays] = await Promise.all([
    getJson(`${API_BASE}/transactions`),
    getJson(`${API_BASE}/users`),
    getJson(`${API_BASE}/buyer/payments`),
  ]);

  const usersById = new Map((users || []).map((u) => [u._id, u]));

  // 2) Rows
  const txRows = (txs || [])
    .sort(
      (a, b) =>
        new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0)
    )
    .map((t, i) => {
      const staffUser = usersById.get?.(t.staffId);
      const staffName = staffUser
        ? `${staffUser.firstName || ""} ${staffUser.lastName || ""}`.trim()
        : t.staffId || "";
      return [
        pad(i + 1),
        t.name || t.title || "",
        (t.type || "").toUpperCase(),
        formatCurrency(t.amount),
        t.date
          ? new Date(t.date).toLocaleDateString()
          : t.createdAt
          ? new Date(t.createdAt).toLocaleDateString()
          : "",
        (t.description || "").replace(/\s+/g, " ").trim(),
        t.orderId || "",
        staffName,
      ];
    });

  const staffRows = (users || [])
    .filter((u) => (u.role || "").toLowerCase() !== "admin")
    .map((u, i) => [
      pad(i + 1, 3),
      `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      u.email || "",
      u.phone || "",
      u.role || "",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
    ]);

  const payRows = (pays || [])
    .sort(
      (a, b) =>
        new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0)
    )
    .map((p, i) => [
      "P" + pad(i + 1),
      p.orderId || "",
      p.buyerId || "",
      formatCurrency(p.amount), // <-- fixed: use p.amount (not t.amount)
      (p.method || "").toUpperCase(),
      p.date
        ? new Date(p.date).toLocaleDateString()
        : p.createdAt
        ? new Date(p.createdAt).toLocaleDateString()
        : "",
      (p.description || "").replace(/\s+/g, " ").trim(),
    ]);

  // 3) PDF
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const title = "Finance Report";
  const generatedOn = new Date().toLocaleString();

  doc.setFontSize(16);
  doc.text(title, 40, 40);
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedOn}`, 40, 58);

  // Transactions (Page 1)
  let y = 80;
  doc.setFontSize(12);
  doc.text("Transactions", 40, y);
  y += 10;
  autoTable(doc, {
    startY: y,
    head: [["Txn #", "Name", "Type", "Amount", "Date", "Description", "Order ID", "Staff"]],
    body: txRows,
    styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
    columnStyles: { 5: { cellWidth: 160 } },
    didDrawPage: (data) => {
      const str = `Page ${doc.getNumberOfPages()}`;
      doc.setFontSize(10);
      const pageH = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      doc.text(str, data.settings.margin.left, pageH - 10);
    },
  });

  // Staff (Page 2)
  doc.addPage();
  y = 40;
  doc.setFontSize(12);
  doc.text("Staff", 40, y);
  y += 10;
  autoTable(doc, {
    startY: y,
    head: [["#", "Name", "Email", "Phone", "Role", "Created"]],
    body: staffRows,
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Payments (Page 3)
  doc.addPage();
  y = 40;
  doc.setFontSize(12);
  doc.text("Payments", 40, y);
  y += 10;
  autoTable(doc, {
    startY: y,
    head: [["Pay #", "Order ID", "Buyer ID", "Amount", "Method", "Date", "Description"]],
    body: payRows,
    styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
    columnStyles: { 6: { cellWidth: 180 } },
  });

  // 4) Download
  doc.save(`finance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
