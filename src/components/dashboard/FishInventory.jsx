import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Search } from "lucide-react";

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all"); // new: filter by category

  // add/edit
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    itemCode: "",
    itemName: "",
    stock: 0,
    category: "food",
  });

  // assign
  const [showAssign, setShowAssign] = useState(false);
  const [assignRows, setAssignRows] = useState([
    { itemCode: "", qty: "", tank: "Large Tank Section", error: "" },
  ]);

  // low stock alert dialog
  const [showLowStock, setShowLowStock] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);

  // ---------- Backend fetch ----------
  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fishinventory");
      const data = res.data || [];
      setInventory(data);

      // check low stock on fetch
      const low = data.filter((i) => Number(i.stock) < 10);
      if (low.length > 0) {
        setLowStockItems(low);
        setShowLowStock(true);
      } else {
        setLowStockItems([]);
        setShowLowStock(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to Fetch Inventory");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // ---------- Form handlers ----------
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "stock" ? Number(value) : value,
    }));
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      stock: item.stock,
      category: item.category,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/fishinventory/${id}`);
      toast.success("Item deleted successfully");
      fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.itemCode || !formData.itemName || formData.stock === "") {
        return toast.error("Please fill in all required fields");
      }

      // Validate quantity
      if (formData.stock <= 0) {
        return toast.error("Quantity must be greater than 0");
      }

      if (editingItem) {
        await axios.put(
          `http://localhost:5000/api/fishinventory/${editingItem._id}`,
          formData
        );
        toast.success("Item updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/fishinventory", formData);
        toast.success("Item added successfully");
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({ itemCode: "", itemName: "", stock: 0, category: "food" });
      await fetchInventory(); // re-fetch and trigger low-stock check
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  // ---------- Status badge ----------
  const getStatusBadge = (stock) => {
    if (Number(stock) < 10)
      return (
        <Badge className="bg-red-600/90 text-white hover:bg-red-600">
          Low Stock
        </Badge>
      );
    return (
      <Badge className="bg-green-500/90 text-white hover:bg-green-500">
        In Stock
      </Badge>
    );
  };

  // ---------- Assign Items logic ----------
  // open assign modal and reset rows (so tank defaults are correct)
  const openAssignModal = () => {
    setAssignRows([{ itemCode: "", qty: "", tank: "Large Tank Section", error: "" }]);
    setShowAssign(true);
  };

  const addAssignRow = () => {
    setAssignRows([...assignRows, { itemCode: "", qty: "", tank: "Large Tank Section", error: "" }]);
  };

  const updateAssignRow = (index, field, value) => {
    const rows = [...assignRows];
    rows[index][field] = value;
    rows[index].error = "";
    setAssignRows(rows);
  };

  const handleAssign = async () => {
    let anyAssigned = false;
    const lowWarnings = [];
    const updates = [];

    // Validate and prepare updates
    assignRows.forEach((row) => {
      // Skip empty rows
      if (!row.itemCode && !row.qty) return;

      const item = inventory.find((i) => i.itemCode === row.itemCode);
      if (!item) {
        row.error = "Invalid item";
        return;
      }

      const qty = parseInt(row.qty, 10);
      if (!qty || qty <= 0) {
        row.error = "Enter valid qty";
        return;
      }

      if (qty > Number(item.stock)) {
        row.error = `Only ${item.stock} left`;
        return;
      }

      // Valid row - prepare for update
      updates.push({
        id: item._id,
        deduction: qty,
        rowData: row
      });
      
      // Check for low stock after deduction
      const newStock = Number(item.stock) - qty;
      if (newStock < 10) {
        lowWarnings.push(`${item.itemName} is low (${newStock} left)`);
      }
    });

    // Check if there are any errors in any row
    const hasErrors = assignRows.some(r => r.error);
    if (hasErrors) {
      toast.error("Please fix errors before assigning");
      return;
    }

    // If no updates to process
    if (updates.length === 0) {
      toast.error("No valid assignments to process");
      return;
    }

    try {
      // Process all updates
      for (const update of updates) {
        const item = inventory.find(i => i._id === update.id);
        if (item) {
          const newStock = Number(item.stock) - update.deduction;
          await axios.put(
            `http://localhost:5000/api/fishinventory/${update.id}`,
            { ...item, stock: newStock }
          );
          anyAssigned = true;
        }
      }

      if (anyAssigned) {
        toast.success("Items assigned successfully");
        
        // Show low stock warnings if any
        lowWarnings.forEach((w) => toast(w, { icon: "⚠️" }));
        
        // Close the dialog
        setShowAssign(false);
        setAssignRows([{ itemCode: "", qty: "", tank: "Large Tank Section", error: "" }]);
        
        // Refresh inventory
        await fetchInventory();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign items");
    }
  };

  // Filtering for rendering - UPDATED to filter by category
  const filteredInventory = inventory
    .filter(
      (item) =>
        (item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (categoryFilter === "all" || item.category === categoryFilter)
    )
    .sort((a, b) => {
      // Sort by category first, then by item name
      return String(a.category || "").localeCompare(String(b.category || "")) ||
             String(a.itemName || "").localeCompare(String(b.itemName || ""));
    });

  // ---------- Low-stock dialog close helper ----------
  const dismissLowStock = () => {
    setShowLowStock(false);
    setLowStockItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage stock levels of all items</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={openAssignModal}
            className="bg-gradient-to-r from-blue-500 to-black hover:opacity-90"
          >
            Assign Items
          </Button>
          <Button
            onClick={() => { setEditingItem(null); setFormData({ itemCode: "", itemName: "", stock: 0, category: "food" }); setShowForm(true); }}
            className="bg-gradient-to-r from-primary to-black hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-aqua/20 focus:border-aqua"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="medicine">Medicine</option>
            <option value="food">Food</option>
            <option value="equipment">Equipment</option>
            <option value="tank">Tank</option>
          </select>
        </div>
      </div>

      {/* Inventory Table (kept UI same) */}
      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Item Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Item Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.itemCode}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {String(item.category).charAt(0).toUpperCase() + String(item.category).slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.stock)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="hover:bg-blue-500/10 hover:text-blue-500"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item._id)}
                    className="hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add/Edit Form Modal (kept UI same; itemCode disabled while editing) */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl w-2xl bg-gray-200">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update your inventory item" : "Add a new inventory item"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemCode">Item Code</Label>
                <Input
                  id="itemCode"
                  value={formData.itemCode}
                  onChange={handleInputChange}
                  disabled={!!editingItem} // disable when editing
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" value={formData.itemName} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Quantity</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  min="1"
                  step="1"
                  value={formData.stock} 
                  onChange={handleInputChange}
                  placeholder="Enter quantity (minimum 1)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" value={formData.category} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="food">Food</option>
                  <option value="tank">Tank</option>
                  <option value="medicine">Medicine</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-primary to-black hover:opacity-90">
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Items Modal (kept UI, added Tank dropdown + inline validation) */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="sm:max-w-3xl w-3xl bg-gray-200">
          <DialogHeader>
            <DialogTitle>Assign Items</DialogTitle>
            <DialogDescription>Deduct stock by assigning items to tanks</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {assignRows.map((row, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                {/* Tank dropdown (NEW) */}
                <select
                  value={row.tank}
                  onChange={(e) => updateAssignRow(idx, "tank", e.target.value)}
                  className="w-1/3 border rounded px-2 py-2"
                >
                  <option value="Large Tank Section">Large Tank Section</option>
                  <option value="Medium Tank Section">Medium Tank Section</option>
                  <option value="Small Tank Section">Small Tank Section</option>
                </select>

                {/* Item dropdown populated from inventory (kept UI) */}
                <select
                  value={row.itemCode}
                  onChange={(e) => updateAssignRow(idx, "itemCode", e.target.value)}
                  className="w-1/2 border rounded px-2 py-2"
                >
                  <option value="">Select Item</option>
                  {inventory.map((i) => (
                    <option key={i._id} value={i.itemCode}>
                      {i.itemCode} - {i.itemName} (stock: {i.stock})
                    </option>
                  ))}
                </select>

                {/* Qty */}
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Qty (min 1)"
                  value={row.qty}
                  onChange={(e) => updateAssignRow(idx, "qty", e.target.value)}
                  className="w-1/6"
                />

                {/* inline error */}
                {row.error && <p className="text-red-500 text-xs mt-2">{row.error}</p>}
              </div>
            ))}

            <Button variant="outline" onClick={addAssignRow}>
              + Add Row
            </Button>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleAssign} className="bg-gradient-to-r from-blue-500 to-black hover:opacity-90">
                Assign
              </Button>
              <Button variant="outline" onClick={() => setShowAssign(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Low-stock Alert Dialog (NEW) */}
      <Dialog open={showLowStock} onOpenChange={setShowLowStock}>
        <DialogContent className="sm:max-w-md w-full bg-white">
          <DialogHeader>
            <DialogTitle>Low Stock Alert</DialogTitle>
            <DialogDescription>Items below the threshold (less than 10)</DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            {lowStockItems.map((it) => (
              <div key={it._id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-semibold">{it.itemName} <span className="text-sm text-muted-foreground">({it.itemCode})</span></div>
                  <div className="text-sm text-muted-foreground">Category: {String(it.category)}</div>
                </div>
                <div className="text-sm font-bold text-red-600">{it.stock}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={dismissLowStock}>Dismiss</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;