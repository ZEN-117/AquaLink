import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/utils";

const BASE_URL = "http://localhost:5000";

const types = [
  { value: "CR", label: "Credit (Income)" },
  { value: "DR", label: "Debit (Expense)" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ManageTransactions() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    amount: 0,
    type: "CR",
    date: todayISO(),        // transaction date
    recordedAt: todayISO(),  // updated date
    description: "",
  });

  const load = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/transactions`);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load transactions");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter(
      (i) =>
        i.name?.toLowerCase().includes(s) ||
        i.description?.toLowerCase().includes(s)
    );
  }, [items, q]);

  const reset = () =>
    setForm({
      name: "",
      amount: 0,
      type: "CR",
      date: todayISO(),
      recordedAt: todayISO(),
      description: "",
    });

  const submit = async () => {
    try {
      const payload = {
        ...form,
        amount: Number(form.amount) || 0,
      };
      if (editing) {
        await axios.patch(`${BASE_URL}/api/transactions/${editing}`, payload);
        toast.success("Transaction updated");
      } else {
        await axios.post(`${BASE_URL}/api/transactions`, payload);
        toast.success("Transaction created");
      }
      reset();
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Operation failed");
    }
  };

  const onEdit = (item) => {
    setEditing(item._id);
    setForm({
      name: item.name || "",
      amount: item.amount ?? 0,
      type: item.type || "CR",
      date: item.date ? new Date(item.date).toISOString().slice(0, 10) : todayISO(),
      recordedAt: item.recordedAt ? new Date(item.recordedAt).toISOString().slice(0, 10) : todayISO(),
      description: item.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/transactions/${id}`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Transactions</h1>
          <p className="text-muted-foreground">Create, edit, and delete financial records</p>
        </div>
        <Button onClick={() => { reset(); setEditing(null); }} className="bg-gradient-to-r from-primary to-black">
          <Plus className="w-4 h-4 mr-2" /> New Transaction
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-xl">
        <Input
          placeholder="Search transactions..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border-aqua/20"
        />
      </div>

      {/* Form */}
      <Card className="border-aqua/20">
        <CardHeader>
          <CardTitle>{editing ? "Edit Transaction" : "Add Transaction"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a new financial entry
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Name / Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (Rs)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Type / Transaction Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger className="border-aqua/20">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          {/* Row 3: Updated Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Updated Date</Label>
              <Input
                type="date"
                value={form.recordedAt}
                onChange={(e) => setForm({ ...form, recordedAt: e.target.value })}
              />
            </div>
            <div className="hidden md:block" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Enter description (max 100 characters)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={submit} className="bg-gradient-to-r from-primary to-black">
              {editing ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => { reset(); setEditing(null); }}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Transactions</h2>
        {filtered.map((it) => (
          <Card key={it._id} className="border-aqua/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {it.name}{" "}
                  <Badge variant="outline" className={it.type === "CR" ? "text-green-600" : "text-red-600"}>
                    {it.type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {it.description || "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {it.date ? `Transaction: ${new Date(it.date).toLocaleDateString()}` : ""}
                  {it.recordedAt ? ` • Updated: ${new Date(it.recordedAt).toLocaleDateString()}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-lg font-bold ${it.type === "CR" ? "text-green-600" : "text-red-600"}`}>
                  {`${it.type === "CR" ? "" : "-"}${formatCurrency(Number(it.amount || 0))}`}
                </div>
                <Button size="sm" variant="outline" onClick={() => onEdit(it)}>
                  <Pencil className="w-4 h-4" />
                </Button>
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
        {filtered.length === 0 && <div className="text-muted-foreground">No transactions yet.</div>}
      </div>
    </div>
  );
}
