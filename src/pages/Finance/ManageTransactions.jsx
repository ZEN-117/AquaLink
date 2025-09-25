// src/pages/Finance/ManageTransactions.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils"; // Rs formatter (centralized)

export default function ManageTransactions() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    amount: 0,
    type: "CR",
    date: new Date().toISOString().slice(0, 10),
  });

  const base = "http://localhost:5000";

  const getList = async () => {
    try {
      const { data } = await axios.get(`${base}/api/transactions`, { headers: { Accept: "application/json" } });
      setItems(data || []);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to fetch transactions");
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const onSubmit = async () => {
    try {
      if (!form.name || !form.amount || !form.type) {
        return toast.error("Fill all required fields");
      }

      // Validate amount
      if (form.amount <= 0) {
        return toast.error("Amount must be greater than 0");
      }

      // Validate description length
      if (form.description && form.description.length > 100) {
        return toast.error("Description cannot exceed 100 characters");
      }

      // Validate date (not in future)
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        return toast.error("Cannot select future dates");
      }

      const payload = {
        ...form,
        date: new Date(form.date),
        amount: Number(form.amount),
      };

      if (editing) {
        await axios.patch(`${base}/api/transactions/${editing._id}`, payload);
        toast.success("Transaction updated");
      } else {
        await axios.post(`${base}/api/transactions`, payload);
        toast.success("Transaction created");
      }

      setShowForm(false);
      setEditing(null);
      setForm({
        name: "",
        description: "",
        amount: 0,
        type: "CR",
        date: new Date().toISOString().slice(0, 10),
      });
      getList();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Operation failed");
    }
  };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name,
      description: row.description || "",
      amount: row.amount,
      type: row.type,
      date: (row.date ? new Date(row.date) : new Date()).toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await axios.delete(`${base}/api/transactions/${id}`);
      toast.success("Deleted");
      getList();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Delete failed");
    }
  };

  const filtered = (items || []).filter(
    (i) =>
      (i.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.description || "").toLowerCase().includes(search.toLowerCase())
  );

  // Helper to render +/–Rs with nice formatting
  const renderSignedAmount = (row) => {
    const sign = row.type === "DR" ? "-" : "+"; // DR = expense, CR = income
    const amt = Number(row.amount || 0);
    return `${sign}${formatCurrency(amt)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Transactions</h1>
          <p className="text-muted-foreground">Create, edit, and delete financial records</p>
        </div>
        <Button
          onClick={() => {
            setShowForm((s) => !s);
            setEditing(null);
          }}
          className="bg-gradient-to-r from-primary to-black"
        >
          <Plus className="w-4 h-4 mr-2" /> New Transaction
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-aqua/20"
          placeholder="Search transactions..."
        />
      </div>

      {showForm && (
        <Card className="border-aqua/20">
          <CardHeader>
            <CardTitle>{editing ? "Edit Transaction" : "Add Transaction"}</CardTitle>
            <CardDescription>
              {editing ? "Update the financial entry" : "Create a new financial entry"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Rs)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="border-aqua/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CR">Credit (Income)</SelectItem>
                    <SelectItem value="DR">Debit (Expense)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={100}
                placeholder="Enter description (max 100 characters)"
              />
              {form.description && (
                <p className="text-xs text-muted-foreground">
                  {form.description.length}/100 characters
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={onSubmit} className="bg-gradient-to-r from-primary to-black">
                {editing ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Transactions</h2>
        {filtered.map((row) => (
          <Card key={row._id} className="border-aqua/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{row.name}</span>
                  <Badge
                    className={
                      row.type === "CR"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }
                  >
                    {row.type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{row.description}</div>
                <div className="text-xs text-muted-foreground">
                  {row.date ? new Date(row.date).toLocaleDateString() : ""}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`text-lg font-bold ${
                    row.type === "CR" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {renderSignedAmount(row)}
                </div>
                <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-red-500/10 hover:text-red-500"
                  onClick={() => onDelete(row._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-muted-foreground">No transactions found.</div>
        )}
      </div>
    </div>
  );
}
