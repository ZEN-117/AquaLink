// src/pages/Finance/SalaryManagement.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

// ---- CONFIG ----
// Common Sri Lanka contributions
const EPF_RATE = 0.08; // 8% employee (deducted from net)
const ETF_RATE = 0.03; // 3% employer (usually NOT deducted from net)
const INCLUDE_ETF_IN_NET = false; // set true if you still want ETF deducted from net

const BASE_URL = "http://localhost:5000";

export default function SalaryManagement() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [autoContrib, setAutoContrib] = useState(true);

  const [form, setForm] = useState({
    staffId: "",
    staffName: "",
    periodStart: "",
    periodEnd: "",
    basicSalary: 0,
    allowances: 0,
    otHoursWeekday: 0,
    otHoursHoliday: 0,
    epf: 0,
    etf: 0,
    loan: 0,
    tax: 0,
  });

  // Auto-calc EPF/ETF when basic changes (if enabled)
  useEffect(() => {
    if (!autoContrib) return;
    const basic = Number(form.basicSalary) || 0;
    const epf = +(basic * EPF_RATE).toFixed(2);
    const etf = +(basic * ETF_RATE).toFixed(2);
    setForm((prev) => ({ ...prev, epf, etf }));
  }, [form.basicSalary, autoContrib]);

  // Calculations preview
  const calc = useMemo(() => {
    const basic = Number(form.basicSalary) || 0;
    const daily = basic / 28;
    const hourly = daily / 8;

    const otW = (Number(form.otHoursWeekday) || 0) * (hourly * 1.0); // weekday/Sat OT
    const otH = (Number(form.otHoursHoliday) || 0) * (hourly * 1.5); // Sun/holiday OT

    const gross = basic + (Number(form.allowances) || 0) + otW + otH;

    const epf = Number(form.epf) || 0;
    const etf = Number(form.etf) || 0;
    const loan = Number(form.loan) || 0;
    const tax = Number(form.tax) || 0;

    const totalDeductions = epf + loan + tax + (INCLUDE_ETF_IN_NET ? etf : 0);
    const net = gross - totalDeductions;

    return { daily, hourly, otW, otH, gross, net };
  }, [form]);

  const getList = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/salaries`);
      setItems(data);
    } catch {
      toast.error("Failed to fetch salaries");
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const onSubmit = async () => {
    try {
      if (!form.staffId || !form.staffName || !form.periodStart || !form.periodEnd || !form.basicSalary) {
        return toast.error("Fill all required fields");
      }
      await axios.post(
        `${BASE_URL}/api/salaries`,
        {
          ...form,
          basicSalary: Number(form.basicSalary),
          allowances: Number(form.allowances),
          otHoursWeekday: Number(form.otHoursWeekday),
          otHoursHoliday: Number(form.otHoursHoliday),
          epf: Number(form.epf),
          etf: Number(form.etf),
          loan: Number(form.loan),
          tax: Number(form.tax),
        }
      );
      toast.success("Salary run saved");
      setShowForm(false);
      setForm({
        staffId: "",
        staffName: "",
        periodStart: "",
        periodEnd: "",
        basicSalary: 0,
        allowances: 0,
        otHoursWeekday: 0,
        otHoursHoliday: 0,
        epf: 0,
        etf: 0,
        loan: 0,
        tax: 0,
      });
      getList();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Operation failed");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete salary record?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/salaries/${id}`);
      toast.success("Deleted");
      getList();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salary Management</h1>
          <p className="text-muted-foreground">
            Create payroll, calculate daily/hourly salaries, and record deductions
          </p>
        </div>
        <Button
          onClick={() => setShowForm((s) => !s)}
          className="bg-gradient-to-r from-primary to-black"
        >
          <Plus className="w-4 h-4 mr-2" /> New Salary Run
        </Button>
      </div>

      {showForm && (
        <Card className="border-aqua/20">
          <CardHeader>
            <CardTitle>Create Salary Run</CardTitle>
            <CardDescription>
              Daily = basic/28, Hourly = daily/8; OT weekday ×1.0, weekend/holiday ×1.5
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Staff & period */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Staff ID</Label>
                <Input
                  value={form.staffId}
                  onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Staff Name</Label>
                <Input
                  value={form.staffName}
                  onChange={(e) => setForm({ ...form, staffName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Period Start</Label>
                <Input
                  type="date"
                  value={form.periodStart}
                  onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Period End</Label>
                <Input
                  type="date"
                  value={form.periodEnd}
                  onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                />
              </div>
            </div>

            {/* Salary & OT */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Basic Salary</Label>
                <Input
                  type="number"
                  value={form.basicSalary}
                  onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Allowances</Label>
                <Input
                  type="number"
                  value={form.allowances}
                  onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>OT Hours (Weekday/Sat)</Label>
                <Input
                  type="number"
                  value={form.otHoursWeekday}
                  onChange={(e) => setForm({ ...form, otHoursWeekday: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>OT Hours (Sun/Holiday)</Label>
                <Input
                  type="number"
                  value={form.otHoursHoliday}
                  onChange={(e) => setForm({ ...form, otHoursHoliday: e.target.value })}
                />
              </div>
            </div>

            {/* Auto-calc toggle + Contributions */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Contributions:</span>{" "}
                EPF {EPF_RATE * 100}% (employee), ETF {ETF_RATE * 100}% (employer)
                {INCLUDE_ETF_IN_NET ? " — ETF deducted" : " — ETF not deducted"}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoContrib}
                  onChange={(e) => setAutoContrib(e.target.checked)}
                  className="h-4 w-4"
                />
                Auto-calculate EPF & ETF
              </label>
            </div>

            {/* Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>EPF ({EPF_RATE * 100}%)</Label>
                <Input
                  type="number"
                  value={form.epf}
                  readOnly={autoContrib}
                  onChange={(e) => setForm({ ...form, epf: e.target.value })}
                  className={autoContrib ? "opacity-70 cursor-not-allowed" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>ETF ({ETF_RATE * 100}%)</Label>
                <Input
                  type="number"
                  value={form.etf}
                  readOnly={autoContrib}
                  onChange={(e) => setForm({ ...form, etf: e.target.value })}
                  className={autoContrib ? "opacity-70 cursor-not-allowed" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Loan</Label>
                <Input
                  type="number"
                  value={form.loan}
                  onChange={(e) => setForm({ ...form, loan: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax</Label>
                <Input
                  type="number"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: e.target.value })}
                />
              </div>
            </div>

            {/* Preview Calculations */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
              <Stat label="Daily Salary" value={`$${calc.daily.toFixed(2)}`} />
              <Stat label="Hourly Salary" value={`$${calc.hourly.toFixed(2)}`} />
              <Stat label="OT Weekday Amt" value={`$${calc.otW.toFixed(2)}`} />
              <Stat label="OT Holiday Amt" value={`$${calc.otH.toFixed(2)}`} />
              <Stat label="Gross" value={`$${calc.gross.toFixed(2)}`} />
            </div>
            <div className="pt-2">
              <Stat big label="Net Salary" value={`$${calc.net.toFixed(2)}`} />
            </div>

            <div className="flex gap-2">
              <Button onClick={onSubmit} className="bg-gradient-to-r from-primary to-black">
                Save Salary Run
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Salary Runs</h2>
        {items.map((it) => (
          <Card key={it._id} className="border-aqua/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {it.staffName} ({it.staffId})
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(it.periodStart).toLocaleDateString()} –{" "}
                  {new Date(it.periodEnd).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Basic ${Number(it.basicSalary).toFixed(2)} • Allowances $
                  {Number(it.allowances).toFixed(2)} • OT $
                  {Number((it.otWeekdayAmt || 0) + (it.otHolidayAmt || 0)).toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-foreground">
                  ${Number(it.netSalary).toFixed(2)}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-red-500/10 hover:text-red-500"
                  onClick={() => onDelete(it._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="text-muted-foreground">No salary runs yet.</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, big }) {
  return (
    <div className={`p-3 rounded-lg bg-aqua/5 ${big ? "text-xl font-bold" : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-foreground">{value}</div>
    </div>
  );
}
