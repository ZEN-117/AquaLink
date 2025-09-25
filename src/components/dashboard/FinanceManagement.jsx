// src/components/dashboard/FinanceManagement.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { exportFinancePDF } from "@/lib/exportFinancePDF";
import { formatCurrency } from "../../utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "http://localhost:5000/api";

// --- helpers ---
const currency = (n) => formatCurrency(n);

// Normalize any backend string ("$900.00", "+$900", "900") to "+Rs …"/"-Rs …"
const renderSignedAmount = (val) => {
  const s = String(val ?? "").trim();
  const isNeg = s.startsWith("-");
  // pull numeric content
  const num = typeof val === "number" ? Math.abs(val) : Math.abs(parseFloat(s.replace(/[^0-9.-]/g, ""))) || 0;
  const out = formatCurrency(num);
  return (isNeg ? "-" : "+") + out;
};

// Color green when positive, red when negative
const amountColor = (val) => (String(val ?? "").trim().startsWith("-") ? "text-red-500" : "text-green-500");

// --- main ---
export default function FinanceManagement() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  // Withdraw modal state
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmt, setWithdrawAmt] = useState("");

  // fetch overview
  const fetchOverview = async () => {
    try {
      setError(false);
      const r = await fetch(`${API_BASE}/finance/overview`, { cache: "no-store" });
      if (!r.ok) throw new Error("Failed to load overview");
      const j = await r.json();
      setData(j);
    } catch (e) {
      console.error(e);
      setError(true);
      toast.error("Failed to load finance overview");
    } finally {
      setLoading(false);
    }
  };

  // initial + live updates via SSE
  useEffect(() => {
    fetchOverview();
    const src = new EventSource(`${API_BASE}/finance/events`);
    src.addEventListener("finance", fetchOverview);
    src.onerror = () => src.close();
    return () => {
      src.removeEventListener("finance", fetchOverview);
      src.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = data?.totals || {};
  const earnings = data?.earnings || [];
  const recent = data?.recent || [];

  // ===== Export Report (PDF) =====
  const onExportPDF = async () => {
    try {
      await exportFinancePDF();
    } catch (e) {
      console.error(e);
      toast.error("Export failed");
    }
  };

  // ===== Withdraw Funds (creates a DR transaction) =====
  const onWithdraw = async () => {
    const amount = Number(withdrawAmt);
    if (!amount || amount <= 0) {
      return toast.error("Enter a valid amount");
    }
    if (totals.availableBalance != null && amount > totals.availableBalance) {
      return toast.error("Amount exceeds available balance");
    }
    try {
      await axios.post(`${API_BASE}/transactions`, {
        name: "Owner Withdrawal",
        description: "Manual withdrawal from available balance",
        amount,
        type: "DR",
        date: new Date(),
      });
      toast.success("Withdrawal recorded");
      setWithdrawOpen(false);
      setWithdrawAmt("");
      // overview auto-refreshes via SSE
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to record withdrawal");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-500";
      case "Processing":
        return "bg-yellow-500/10 text-yellow-500";
      case "Failed":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Management</h1>
          <p className="text-muted-foreground">Track your earnings, payments, and financial analytics</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onExportPDF}
            variant="outline"
            className="border-aqua/20 hover:bg-aqua/10"
            disabled={isLoading || isError || !data}
            title="Export a full PDF report: Transactions, Staff, Payments"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>

          <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-black hover:opacity-90">
                <Wallet className="w-4 h-4 mr-2" />
                Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  This will record a debit transaction and reduce your available balance.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={withdrawAmt}
                    onChange={(e) => setWithdrawAmt(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Available: {currency(totals.availableBalance ?? 0)}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={onWithdraw} className="bg-gradient-to-r from-primary to-black">
                  Confirm Withdrawal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading/Error states */}
      {isLoading && <div className="text-muted-foreground">Loading finance overview…</div>}
      {isError && <div className="text-red-500">Failed to load finance overview.</div>}

      {/* Financial Overview */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="animate-fade-in border-aqua/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <div className="p-2 rounded-lg bg-aqua/10">
                <DollarSign className="w-4 h-4 text-aqua" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {currency(totals.availableBalance)}
              </div>
              <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-aqua/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month (Net)</CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{currency(totals.thisMonthNet)}</div>
              <p className="text-xs text-green-500">Auto-updates as you record items</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-aqua/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CreditCard className="w-4 h-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{currency(totals.lifetimeEarnings)}</div>
              <p className="text-xs text-muted-foreground">Lifetime income (payments + CR transactions)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Earnings */}
      {!isLoading && !isError && (
        <Card className="animate-fade-in border-aqua/10">
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Your net performance over the last 4 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earnings.map((m, idx) => (
                <div
                  key={m.month + idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-aqua/5 hover:bg-aqua/10 transition-colors"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-aqua" />
                    <div>
                      <h3 className="font-medium text-foreground">{m.month}</h3>
                      <p className="text-sm text-muted-foreground">Monthly net</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">{currency(m.amount)}</div>
                    <div className={`flex items-center gap-1 text-sm ${m.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {m.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(m.growth)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {!isLoading && !isError && (
        <Card className="animate-fade-in border-aqua/10">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent payments, sales, and withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent.map((row, index) => (
                <div
                  key={`${row.source}-${row.id}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-aqua/10 hover:bg-aqua/5 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{row.type}</span>
                      <Badge className={getStatusColor(row.status)}>{row.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{row.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.date ? new Date(row.date).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${amountColor(row.amount)}`}>
                      {renderSignedAmount(row.amount)}
                    </div>
                    <p className="text-xs text-muted-foreground">{row.id}</p>
                  </div>
                </div>
              ))}
              {recent.length === 0 && <div className="text-muted-foreground">No recent activity.</div>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
