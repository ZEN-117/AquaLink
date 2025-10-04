// src/pages/InventoryPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useUserDetails } from "@/hooks/useUserDetails";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Search, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";

const InventoryPage = () => {
  const { user, displayName, fullName } = useUserDetails();
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // categories from DB: [{_id, name, lowStockThreshold}]
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryThreshold, setNewCategoryThreshold] = useState(10);

  // add/edit item UI
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    itemCode: "",
    itemName: "",
    stock: 0,
    category: "",
  });

  // show/hide new category section in add item modal
  const [showNewCategorySection, setShowNewCategorySection] = useState(false);

  // edit category states
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryThreshold, setEditCategoryThreshold] = useState(10);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState("");

  // assign dialog (unchanged)
  const [showAssign, setShowAssign] = useState(false);
  const [assignRows, setAssignRows] = useState([
    { itemCode: "", qty: "", tank: "Large Tank Section", error: "" },
  ]);

  // low-stock alert
  const [showLowStock, setShowLowStock] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);

  // loading
  const [loading, setLoading] = useState(true);

  // New states for 3 dots menu and delete category
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // ---------- Backend fetch ----------
  const fetchInventoryAndCategories = async () => {
    try {
      setLoading(true);
      const [invRes, catRes] = await Promise.all([
        axios.get("http://localhost:5000/api/fishinventory"),
        axios.get("http://localhost:5000/api/categories"),
      ]);
      const data = invRes.data || [];
      const cats = catRes.data || [];

      setInventory(data);
      setCategories(cats);

      // compute low stock items using per-category thresholds
      const catThresholdMap = {};
      for (const c of cats) catThresholdMap[c.name] = Number(c.lowStockThreshold ?? 10);

      // default threshold for unknown categories
      const defaultThreshold = 10;

      const low = data.filter((i) => {
        const catName = String(i.category || "").toLowerCase();
        const threshold = catThresholdMap[catName] ?? defaultThreshold;
        return Number(i.stock) < threshold;
      });

      if (low.length > 0) {
        setLowStockItems(low);
        setShowLowStock(true);
      } else {
        setLowStockItems([]);
        setShowLowStock(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch inventory or categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryAndCategories();
  }, []);

  // Add this useEffect hook after your other useEffects
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close the menu if clicked outside
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);
  

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
      category: item.category || "",
    });
    setShowForm(true);
    setShowNewCategorySection(false); // Hide new category section when editing
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      // Get item details before deletion for history logging
      const itemToDelete = inventory.find(item => item._id === id);
      
      await axios.delete(`http://localhost:5000/api/fishinventory/${id}`);
      
      // Log deletion in inventory history
      if (itemToDelete) {
        try {
          await axios.post("http://localhost:5000/api/inventory-history", {
            itemName: itemToDelete.itemName,
            assignedSection: "N/A",
            quantity: 0,
            dateTime: new Date().toISOString(),
            user: displayName || fullName || user?.email || 'Unknown User',
            action: 'DELETED',
            previousStock: itemToDelete.stock,
            newStock: 0
          });
        } catch (historyErr) {
          console.error("Failed to log deletion history:", historyErr);
        }
      }
      
      toast.success("Item deleted successfully");
      await fetchInventoryAndCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
    }
  };

  // Create or update item
  const handleSubmit = async () => {
    try {
      const code = String(formData.itemCode || "").trim();
      const name = String(formData.itemName || "").trim();
      const stock = Number(formData.stock);
      const category = String(formData.category || "").trim().toLowerCase();

      console.log("Form data validation:", { code, name, stock, category, isNaNStock: isNaN(stock) });
      console.log("Form data object:", formData);

      if (!code || !name || isNaN(stock) || category === "") {
        console.log("Validation failed:", { 
          codeEmpty: !code, 
          nameEmpty: !name, 
          stockNaN: isNaN(stock), 
          categoryEmpty: category === "" 
        });
        return toast.error("Please fill in all required fields");
      }

      // validations
      console.log("Starting validations...");
      
      // itemCode: max 6, start with letter, letters+numbers only
      if (code.length > 6) {
        console.log("Item code too long:", code.length);
        return toast.error("Item Code cannot exceed 6 characters");
      }
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(code)) {
        console.log("Item code format invalid:", code);
        return toast.error("Item Code must start with a letter and contain only letters and numbers");
      }

      // itemName: max 20, cannot start with number, letters/numbers/spaces/dash allowed
      if (name.length > 35) {
        console.log("Item name too long:", name.length);
        return toast.error("Item Name cannot exceed 20 characters");
      }
      if (!/^[A-Za-z][A-Za-z0-9\s-]*$/.test(name)) {
        console.log("Item name format invalid:", name);
        return toast.error("Item Name must start with a letter and can include letters, numbers, spaces and dashes");
      }

      // category must exist in categories list
      const normalizedCat = category.toLowerCase();
      console.log("Checking category:", normalizedCat, "Available categories:", categories.map(c => c.name));
      const catExists = categories.some((c) => c.name === normalizedCat);
      if (!catExists) {
        console.log("Category does not exist:", normalizedCat);
        return toast.error("Please select a valid category or add it");
      }

      if (stock <= 0) {
        console.log("Stock too low:", stock);
        return toast.error("Quantity must be greater than 0");
      }
      if (stock > 5000) {
        console.log("Stock too high:", stock);
        return toast.error("Quantity cannot exceed 5000");
      }
      
      console.log("All validations passed, proceeding with API call...");

      if (editingItem) {
        // update
        console.log("Updating item:", { code, name, stock, category: normalizedCat });
        const previousStock = editingItem.stock;
        await axios.put(`http://localhost:5000/api/fishinventory/${editingItem._id}`, {
          itemCode: code,
          itemName: name,
          stock,
          category: normalizedCat,
        });
        
        // Log update in inventory history
        try {
          await axios.post("http://localhost:5000/api/inventory-history", {
            itemName: name,
            assignedSection: "N/A",
            quantity: stock - previousStock,
            dateTime: new Date().toISOString(),
            user: displayName || fullName || user?.email || 'Unknown User',
            action: 'UPDATED',
            previousStock: previousStock,
            newStock: stock
          });
        } catch (historyErr) {
          console.error("Failed to log update history:", historyErr);
        }
        
        toast.success("Item updated successfully");
      } else {
        // create
        console.log("Creating item:", { code, name, stock, category: normalizedCat });
        console.log("Making API call to:", "http://localhost:5000/api/fishinventory");
        
        const createResponse = await axios.post("http://localhost:5000/api/fishinventory", {
          itemCode: code,
          itemName: name,
          stock,
          category: normalizedCat,
        });
        
        console.log("Item creation response:", createResponse.data);
        
        // Log creation in inventory history
        try {
          await axios.post("http://localhost:5000/api/inventory-history", {
            itemName: name,
            assignedSection: "N/A",
            quantity: stock,
            dateTime: new Date().toISOString(),
            user: displayName || fullName || user?.email || 'Unknown User',
            action: 'CREATED',
            previousStock: 0,
            newStock: stock
          });
        } catch (historyErr) {
          console.error("Failed to log creation history:", historyErr);
          console.error("History error response:", historyErr?.response?.data);
          console.error("History error status:", historyErr?.response?.status);
        }
        
        toast.success("Item added successfully");
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({ itemCode: "", itemName: "", stock: 0, category: "" });
      setShowNewCategorySection(false); // Reset new category section
      await fetchInventoryAndCategories();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      console.error("Error response:", err?.response?.data);
      console.error("Error status:", err?.response?.status);
      // If duplication or validation error, show message from backend if present
      if (err?.response?.data?.message) toast.error(err.response.data.message);
      else toast.error("Operation failed");
    }
  };

  // ---------- New Category handlers ----------
  // validate category name: start with letter, letters+numbers only
  const validateCategoryName = (name) => /^[A-Za-z][A-Za-z0-9]*$/.test(String(name || "").trim());

  const handleAddCategory = async () => {
    try {
      const name = (newCategoryName || "").trim().toLowerCase();
      const threshold = Number(newCategoryThreshold || 10);

      if (!name) return toast.error("Enter category name");
      if (!validateCategoryName(name)) {
        return toast.error("Category must start with a letter and contain only letters and numbers");
      }
      if (isNaN(threshold) || threshold < 0) return toast.error("Threshold must be a number >= 0");

      // Check if category already exists
      if (categories.some(c => c.name === name)) {
        return toast.error("Category already exists");
      }

      // POST to backend
      await axios.post("http://localhost:5000/api/categories", {
        name,
        lowStockThreshold: threshold,
      });

      toast.success("Category added");
      setNewCategoryName("");
      setNewCategoryThreshold(10);

      // refresh categories
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data || []);

      // Auto-select the newly added category in the form
      setFormData(prev => ({ ...prev, category: name }));
      
      // Optionally collapse the new category section after successful addition
      setShowNewCategorySection(false);
    } catch (err) {
      console.error(err);
      if (err?.response?.data?.message) toast.error(err.response.data.message);
      else toast.error("Failed to add category");
    }
  };

  // Reset new category section when opening add item modal
  const openAddItemModal = () => {
    setEditingItem(null);
    setFormData({ 
      itemCode: "", 
      itemName: "", 
      stock: 0, 
      category: (categories[0] ? categories[0].name : "") 
    });
    setShowNewCategorySection(false);
    setShowForm(true);
  };

  // ---------- Delete Category Handler ----------
  const handleDeleteCategory = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category to delete");
      return;
    }

    const category = categories.find(c => c._id === selectedCategory);
    if (!category) return;

    const itemsInCategory = inventory.filter(item => 
      String(item.category).toLowerCase() === category.name.toLowerCase()
    );

    const warningMessage = itemsInCategory.length > 0 
      ? `Are you sure you want to delete the category "${category.name}"? This will also delete ${itemsInCategory.length} item(s) assigned to this category. This action cannot be undone.`
      : `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`;

    if (!window.confirm(warningMessage)) return;

    try {
      // First, delete all items in this category if there are any
      if (itemsInCategory.length > 0) {
        const deletePromises = itemsInCategory.map(item => 
          axios.delete(`http://localhost:5000/api/fishinventory/${item._id}`)
        );
        await Promise.all(deletePromises);
      }
      
      // Then delete the category itself
      await axios.delete(`http://localhost:5000/api/categories/${selectedCategory}`);
      
      toast.success(`Category "${category.name}" and its ${itemsInCategory.length} item(s) deleted successfully`);
      setShowDeleteCategory(false);
      setSelectedCategory("");
      await fetchInventoryAndCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  // ---------- Edit Category Handler ----------
  const handleEditCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const threshold = Number(editCategoryThreshold);
    if (isNaN(threshold) || threshold < 0) {
      toast.error("Please enter a valid threshold value");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/categories/${editingCategory._id}`, {
        name: editCategoryName.trim().toLowerCase(),
        lowStockThreshold: threshold,
      });

      toast.success("Category updated successfully");
      setShowEditCategory(false);
      setEditingCategory(null);
      setEditCategoryName("");
      setEditCategoryThreshold(10);
      await fetchInventoryAndCategories();
    } catch (err) {
      console.error("Failed to update category:", err);
      toast.error("Failed to update category");
    }
  };

  // ---------- Handle Category Selection for Edit ----------
  const handleCategorySelection = (categoryId) => {
    setSelectedCategoryToEdit(categoryId);
    const category = categories.find(c => c._id === categoryId);
    if (category) {
      setEditingCategory(category);
      setEditCategoryName(category.name);
      setEditCategoryThreshold(category.lowStockThreshold || 10);
    }
  };

  // ---------- Status / low-stock helpers ----------
  // get threshold for a category name
  const getThresholdForCategory = (catName) => {
    if (!catName) return 10;
    const found = categories.find((c) => c.name === String(catName).toLowerCase());
    return found ? Number(found.lowStockThreshold ?? 10) : 10;
  };

  const getStatusBadge = (stock, catName) => {
    const threshold = getThresholdForCategory(catName);
    if (Number(stock) < threshold) {
      return (
        <Badge className="bg-red-600/90 text-white hover:bg-red-600">
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/90 text-white hover:bg-green-500">
        In Stock
      </Badge>
    );
  };

  // ---------- Assign Items logic (unchanged) ----------
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
    const historyEntries = [];

    assignRows.forEach((row) => {
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
      
      const newStock = Number(item.stock) - qty;
      updates.push({ id: item._id, deduction: qty, item: item, section: row.tank });
      
      // Create history entry for this assignment
      historyEntries.push({
        itemName: item.itemName,
        assignedSection: row.tank,
        quantity: qty,
        dateTime: new Date().toISOString(),
        user: displayName || fullName || user?.email || 'Unknown User',
        action: 'ASSIGNED',
        previousStock: item.stock,
        newStock: newStock
      });
      
      const threshold = getThresholdForCategory(item.category);
      if (newStock < threshold) lowWarnings.push(`${item.itemName} is low (${newStock} left)`);
    });

    const hasErrors = assignRows.some((r) => r.error);
    if (hasErrors) {
      toast.error("Fix row errors before assigning");
      return;
    }
    if (updates.length === 0) {
      toast.error("No valid assignments to process");
      return;
    }

    try {
      // Update inventory items
      for (const u of updates) {
        const item = inventory.find((i) => i._id === u.id);
        if (item) {
          const newStock = Number(item.stock) - u.deduction;
          await axios.put(`http://localhost:5000/api/fishinventory/${u.id}`, { ...item, stock: newStock });
        }
      }

      // Log assigned items to inventory history endpoint
      for (const historyEntry of historyEntries) {
        try {
          await axios.post("http://localhost:5000/api/inventory-history", historyEntry);
        } catch (historyErr) {
          console.error("Failed to log assigned item:", historyErr);
          console.error("Assignment error response:", historyErr?.response?.data);
          console.error("Assignment error status:", historyErr?.response?.status);
          // Don't fail the whole operation if history logging fails
        }
      }

      toast.success("Items assigned successfully");
      lowWarnings.forEach((w) => toast(w, { icon: "⚠️" }));
      setShowAssign(false);
      setAssignRows([{ itemCode: "", qty: "", tank: "Large Tank Section", error: "" }]);
      await fetchInventoryAndCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign items");
    }
  };

  // Filtering for rendering
  const filteredInventory = inventory
    .filter((item) => {
      const text = (searchTerm || "").toLowerCase();
      const matches = (item.itemCode || "").toLowerCase().includes(text) || (item.itemName || "").toLowerCase().includes(text);
      const catOk = categoryFilter === "all" || String(item.category) === categoryFilter;
      return matches && catOk;
    })
    .sort((a, b) => (String(a.category || "").localeCompare(String(b.category || "")) || String(a.itemName || "").localeCompare(String(b.itemName || ""))));

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

        <div className="flex gap-2 items-center">
          <Button onClick={openAssignModal} className="bg-gradient-to-r from-blue-500 to-black hover:opacity-90">Assign Items</Button>
          <Button onClick={openAddItemModal} className="bg-gradient-to-r from-primary to-black hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
          
          {/* 3 Dots Menu Button */}
          <div className="relative menu-container">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="h-10 w-10"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 bg-white border rounded-md shadow-lg z-50 w-48">
                <button
                  onClick={() => {
                    setSelectedCategoryToEdit("");
                    setEditCategoryName("");
                    setEditCategoryThreshold(10);
                    setEditingCategory(null);
                    setShowEditCategory(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Category
                </button>
                <button
                  onClick={() => {
                    setShowDeleteCategory(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Category
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search by code or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-aqua/20 focus:border-aqua" />
        </div>

        <div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded px-3 py-2 text-sm" aria-label="Filter by category">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c.name}>{c.name.charAt(0).toUpperCase() + c.name.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
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
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center">Loading...</td></tr>
            ) : filteredInventory.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center">No items</td></tr>
            ) : filteredInventory.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.itemCode}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">{String(item.category).charAt(0).toUpperCase() + String(item.category).slice(1)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.stock, item.category)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="hover:bg-blue-500/10 hover:text-blue-500"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item._id)} className="hover:bg-red-500/10 hover:text-red-500"><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add/Edit Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) {
          setEditingItem(null);
          setShowNewCategorySection(false);
        }
      }}>
        <DialogContent className="sm:max-w-3xl w-2xl bg-gray-200">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>{editingItem ? "Update your inventory item" : "Add a new inventory item"}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemCode">Item Code</Label>
                <Input id="itemCode" value={formData.itemCode} onChange={handleInputChange} disabled={!!editingItem} maxLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" value={formData.itemName} onChange={handleInputChange} maxLength={20} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Quantity</Label>
                <Input id="stock" type="number" min="1" step="1" max="5000" value={formData.stock} onChange={handleInputChange} placeholder="Enter quantity (minimum 1)" />
              </div>

              {/* Category dropdown */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div className="flex gap-2">
                  <select 
                    id="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c.name}>{c.name.charAt(0).toUpperCase() + c.name.slice(1)}</option>)}
                  </select>
                  
                  {/* Show New Category button only when adding new item (not editing) */}
                  {!editingItem && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewCategorySection(!showNewCategorySection)}
                      className="bg-gradient-to-r from-blue-500 to-black hover:opacity-90 text-white"
                    >
                      New Category
                      {showNewCategorySection ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* New Category Section - Full width like add item section */}
            {!editingItem && showNewCategorySection && (
              <div className="mt-2 p-4 border rounded bg-white space-y-3">
                <h4 className="font-medium text-sm">Add New Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newCategoryName" className="text-sm">Category Name</Label>
                    <Input 
                      id="newCategoryName"
                      placeholder="Enter Category Name" 
                      value={newCategoryName} 
                      maxLength={15}
                      onChange={(e) => setNewCategoryName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCategoryThreshold" className="text-sm">Low Stock Threshold</Label>
                    <Input 
                      id="newCategoryThreshold"
                      type="number" 
                      min="0" 
                      value={newCategoryThreshold} 
                      onChange={(e) => setNewCategoryThreshold(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-s text-muted-foreground">
                    Category Must Start With a letter.
                  </p>
                  <Button 
                    type="button" 
                    onClick={handleAddCategory} 
                    className="bg-gradient-to-r from-blue-500 to-black hover:opacity-90"
                    disabled={!newCategoryName.trim()}
                  >
                    Add Category
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-primary to-black hover:opacity-90">
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
              <Button variant="outline" onClick={() => { 
                setShowForm(false); 
                setEditingItem(null); 
                setShowNewCategorySection(false);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Items Modal */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="sm:max-w-4xl w-3xl bg-gray-200">
          <DialogHeader>
            <DialogTitle>Assign Items</DialogTitle>
            <DialogDescription>Deduct stock by assigning items to tanks</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {assignRows.map((row, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <select value={row.tank} onChange={(e) => updateAssignRow(idx, "tank", e.target.value)} className="w-1/3 border rounded px-2 py-2">
                  <option value="Large Tank Section">Large Tank Section</option>
                  <option value="Medium Tank Section">Medium Tank Section</option>
                  <option value="Small Tank Section">Small Tank Section</option>
                </select>

                <select value={row.itemCode} onChange={(e) => updateAssignRow(idx, "itemCode", e.target.value)} className="w-1/2 border rounded px-2 py-2">
                  <option value="">Select Item</option>
                  {inventory.map((i) => <option key={i._id} value={i.itemCode}>{i.itemCode} - {i.itemName} (stock: {i.stock})</option>)}
                </select>

                <Input type="number" min="1" step="1" placeholder="Qty (1-5000)" value={row.qty} onChange={(e) => updateAssignRow(idx, "qty", e.target.value)} className="w-1/5" />

                {row.error && <p className="text-red-500 text-xs mt-2">{row.error}</p>}
              </div>
            ))}

            <Button variant="outline" onClick={addAssignRow}>+ Add Row</Button>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleAssign} className="bg-gradient-to-r from-blue-500 to-black hover:opacity-90">Assign</Button>
              <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Low-stock Alert Dialog */}
      <Dialog open={showLowStock} onOpenChange={setShowLowStock}>
        <DialogContent className="sm:max-w-md w-full bg-white">
          <DialogHeader>
            <DialogTitle>Low Stock Alert</DialogTitle>
            <DialogDescription>Items below their category threshold</DialogDescription>
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

      {/* Delete Category Modal */}
      <Dialog open={showDeleteCategory} onOpenChange={setShowDeleteCategory}>
        <DialogContent className="sm:max-w-md w-full bg-gray-200">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>Select a category to delete. This will also delete all items in that category.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="deleteCategorySelect">Select Category</Label>
              <select 
                id="deleteCategorySelect"
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Choose a category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name.charAt(0).toUpperCase() + c.name.slice(1)} 
                    {inventory.some(item => String(item.category).toLowerCase() === c.name.toLowerCase()) && 
                      ` (${inventory.filter(item => String(item.category).toLowerCase() === c.name.toLowerCase()).length} items)`
                    }
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This will delete the category and all items associated with it. This action cannot be undone.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowDeleteCategory(false);
                setSelectedCategory("");
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteCategory}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!selectedCategory}
              >
                Delete Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={showEditCategory} onOpenChange={setShowEditCategory}>
        <DialogContent className="sm:max-w-md w-full bg-gray-200">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selectCategoryToEdit">Select Category to Edit</Label>
              <select
                id="selectCategoryToEdit"
                value={selectedCategoryToEdit}
                onChange={(e) => handleCategorySelection(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Choose a category to edit</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name.charAt(0).toUpperCase() + c.name.slice(1)} 
                    {inventory.some(item => String(item.category).toLowerCase() === c.name.toLowerCase()) && 
                      ` (${inventory.filter(item => String(item.category).toLowerCase() === c.name.toLowerCase()).length} items)`
                    }
                  </option>
                ))}
              </select>
            </div>

            {selectedCategoryToEdit && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="editCategoryName">Category Name</Label>
                  <Input
                    id="editCategoryName"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editCategoryThreshold">Low Stock Threshold</Label>
                  <Input
                    id="editCategoryThreshold"
                    type="number"
                    value={editCategoryThreshold}
                    onChange={(e) => setEditCategoryThreshold(Number(e.target.value))}
                    placeholder="Enter threshold value"
                    className="w-full"
                    min="0"
                  />
                </div>
              </>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditCategory(false);
                  setEditingCategory(null);
                  setEditCategoryName("");
                  setEditCategoryThreshold(10);
                  setSelectedCategoryToEdit("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditCategory}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!selectedCategoryToEdit}
              >
                Update Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;