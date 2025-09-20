// src/pages/Finance/SalaryManagement.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SalaryManagement() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

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

  const calc = useMemo(() => {
    const basic = Number(form.basicSalary) || 0;
    const daily = basic / 28;
    const hourly = daily / 8;
    const otW = (Number(form.otHoursWeekday) || 0) * (hourly * 1.0);
    const otH = (Number(form.otHoursHoliday) || 0) * (hourly * 1.5);
    const gross =
      basic + (Number(form.allowances) || 0) + otW + otH;
    const net =
      gross -
      ((Number(form.epf) || 0) +
        (Number(form.etf) || 0) +
        (Number(form.loan) || 0) +
        (Number(form.tax) || 0));
    return { daily, hourly, otW, otH, gross, net };
  }, [form]);

  const getList = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/salaries",
        { headers: { "x-role": "owner" } } // server enforces owner-only
      );
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
        "http://localhost:5000/api/salaries",
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
        },
        { headers: { "x-role": "owner" } }
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
      await axios.delete(
        `http://localhost:5000/api/salaries/${id}`,
        { headers: { "x-role": "owner" } }
      );
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>EPF</Label>
                <Input
                  type="number"
                  value={form.epf}
                  onChange={(e) => setForm({ ...form, epf: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ETF</Label>
                <Input
                  type="number"
                  value={form.etf}
                  onChange={(e) => setForm({ ...form, etf: e.target.value })}
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
                  Basic ${it.basicSalary.toFixed(2)} • Allowances ${it.allowances.toFixed(2)} • OT $
                  {((it.otWeekdayAmt || 0) + (it.otHolidayAmt || 0)).toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-foreground">
                  ${it.netSalary.toFixed(2)}
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
