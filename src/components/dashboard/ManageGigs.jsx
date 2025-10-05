import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ManageGigs = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [fishStocks, setFishStocks] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    image: "",
    productCode: "",
    fishCode: "",
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("http://localhost:5000/api/products", { headers });
      console.log("Fetched products:", res.data);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);
      toast.error("Failed to fetch products");
    }
  };

  // Fetch fish stocks (for creating gigs from available stock)
  const fetchFishStocks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fishstocks");
      setFishStocks(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch fish stocks");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchFishStocks();
  }, []);

  // Poll fish stock periodically to reflect real-time changes in displayed gig stock
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchFishStocks();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Check if product code is unique
  const isProductCodeUnique = (code) => {
    if (editingProduct && editingProduct.productCode === code) return true; // allow same code when editing
    return !products.some((p) => p.productCode.toLowerCase() === code.toLowerCase());
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "price" ? Number(value) : value,
    }));
  };

  // Add or Update product
const handleSubmit = async () => {
  try {
    if (!formData.productCode || !formData.title || !formData.price || !formData.image) {
      return toast.error("Please fill in all required fields");
    }

    // Validate product code uniqueness
    if (!isProductCodeUnique(formData.productCode)) {
      return toast.error("Product code already exists. Please use a different code.");
    }

    if (editingProduct) {
      // Update product using productCode instead of _id
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(
        `http://localhost:5000/api/products/${editingProduct.productCode}`,
        formData,
        { headers }
      );
      toast.success("Product updated successfully!");
    } else {
      // Create product
      // Clean up data for product creation
      const productData = {
        title: formData.title,
        price: formData.price,
        image: formData.image,
        fishCode: formData.fishCode,
        productCode: formData.productCode
      };
      console.log("Sending product data:", productData);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post("http://localhost:5000/api/products", productData, { headers });
      toast.success("Product added successfully!");
    }

    setShowForm(false);
    setEditingProduct(null);
    setFormData({ title: "", price: 0, image: "", productCode: "", fishCode: "" });
    fetchProducts();
  } catch (err) {
    console.error("Error details:", err);
    console.error("Response data:", err.response?.data);
    console.error("Status:", err.response?.status);
    const errorMessage = err.response?.data?.message || err.message || "Operation failed";
    toast.error(errorMessage);
  }
};

  // Delete product
const handleDelete = async (productCode) => {
  if (!window.confirm("Are you sure you want to delete this product?")) return;
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.delete(`http://localhost:5000/api/products/${productCode}`, { headers });
    toast.success("Product deleted successfully!");
    fetchProducts();
  } catch (err) {
    console.error("Delete error:", err);
    console.error("Response data:", err.response?.data);
    console.error("Status:", err.response?.status);
    console.error("Product code being deleted:", productCode);
    const errorMessage = err.response?.data?.message || err.message || "Failed to delete product";
    toast.error(errorMessage);
  }
};

// --- Edit product
const handleEdit = (product) => {
  setEditingProduct(product);
  setFormData({
    title: product.title,
    price: product.price,
    image: product.image,
    productCode: product.productCode,   
    fishCode: product.fishCode,         
  });
  setShowForm(true);
};

  // When selecting a fish from available stock, auto-fill title, stock and image
const handleFishSelect = (fishCode) => {
  const selected = fishStocks.find((f) => f.fishCode === fishCode); // 👈 match fishCode
  if (!selected) return;
  if (!selected.stock || selected.stock <= 0) {
    toast.error("Selected fish is out of stock");
    return;
  }
  setFormData((prev) => ({
    ...prev,
    title: selected.title,
    image: selected.image || "",
    fishCode: selected.fishCode, // 👈 assign fishCode to product
  }));
};

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500/90 text-white";
      case "Out of Stock":
        return "bg-red-500/90 text-white";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

const getCurrentStockForGig = (gig) => {
  const matched = fishStocks.find((f) => f.fishCode === gig.fishCode);
  if (matched && typeof matched.stock === "number") return matched.stock;
  return gig.stock;
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Gigs</h1>
          <p className="text-muted-foreground">Add and manage your guppy listings</p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ title: "", price: 0, image: "", productCode: "", fishCode: "" });
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-primary to-black hover:opacity-90 hover-scale"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Gig
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search your gigs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-aqua/20 focus:border-aqua"
        />
      </div>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl w-full bg-gray-200">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Gig" : "Add New Gig"}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update your guppy listing"
                : "Create a new guppy listing"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productCode">Product Code</Label>
                <Input
                  id="productCode"
                  value={formData.productCode}
                  onChange={handleInputChange}
                  placeholder="Enter unique product code"
                  disabled={editingProduct}
                  className={formData.productCode && !isProductCodeUnique(formData.productCode) ? "border-red-500 focus:border-red-500" : ""}
                />
                {formData.productCode && !isProductCodeUnique(formData.productCode) && (
                  <p className="text-sm text-red-500">Product code already exists</p>
                )}
                {formData.productCode && isProductCodeUnique(formData.productCode) && (
                  <p className="text-sm text-green-600">Product code is available</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rs.)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Gig Title</Label>
                {editingProduct ? (
                  <Input id="title" value={formData.title} onChange={handleInputChange} />
                ) : (
                  <Select onValueChange={handleFishSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select from available fish stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {fishStocks
                        .filter((f) => (f?.stock || 0) > 0)
                        .map((f) => (
                          <SelectItem key={f._id} value={f.fishCode}>
                            {f.title} (Stock: {f.stock})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={formData.image} onChange={handleInputChange} disabled={!editingProduct} readOnly={!editingProduct} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-primary to-black hover:opacity-90"
              >
                {editingProduct ? "Update Gig" : "Create Gig"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Products */}
      <div className="space-y-4">
        <div className="grid gap-4">
          {products
            .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((gig) => (
              <Card key={gig._id} className="hover-scale animate-fade-in border-aqua/10">
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-aqua/10 rounded-lg flex items-center justify-center">
                      <img
                        src={gig.image}
                        alt={gig.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{gig.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-lg font-bold text-aqua">
                          Rs. {gig.price.toFixed(2)}
                        </span>
                        <Badge
                          className={getStatusColor(getCurrentStockForGig(gig) > 0 ? "In Stock" : "Out of Stock")}
                        >
                          {getCurrentStockForGig(gig) > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Code: {gig.productCode}</span>
                        <span>Stock: {getCurrentStockForGig(gig)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-blue-500/10 hover:text-blue-500"
                    onClick={() => handleEdit(gig)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-500/10 hover:text-red-500"
                      onClick={() => handleDelete(gig.productCode)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ManageGigs;
