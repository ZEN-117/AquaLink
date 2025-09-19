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

const ManageGigs = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    stock: 0,
    image: "",
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "price" || id === "stock" ? Number(value) : value,
    }));
  };

  // Add or Update product
  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.price || !formData.image) {
        return toast.error("Please fill in all required fields");
      }

      if (editingProduct) {
        // Update product
        await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, formData);
        toast.success("Product updated successfully!");
      } else {
        // Create product
        await axios.post("http://localhost:5000/api/products", formData);
        toast.success("Product added successfully!");
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({ title: "", price: 0, stock: 0, image: "" });
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price,
      stock: product.stock,
      image: product.image,
    });
    setShowForm(true);
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
            setFormData({ title: "", price: 0, stock: 0, image: "" });
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
                <Label htmlFor="title">Gig Title</Label>
                <Input id="title" value={formData.title} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={formData.image} onChange={handleInputChange} />
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
                          ${gig.price.toFixed(2)}
                        </span>
                        <Badge
                          className={getStatusColor(gig.stock > 0 ? "In Stock" : "Out of Stock")}
                        >
                          {gig.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Stock: {gig.stock}</span>
                        <span>Views: {gig.views}</span>
                        <span>Orders: {gig.orders}</span>
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
                      onClick={() => handleDelete(gig._id)}
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
