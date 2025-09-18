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

const FishStock = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fishStocks, setFishStocks] = useState([]);
  const [editingFish, setEditingFish] = useState(null);

  const [formData, setFormData] = useState({
    fishCode: "",
    title: "",
    stock: 0,
    imageFile: null,
  });

  // Fetch fish stocks
  const fetchFishStocks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fishstocks");
      setFishStocks(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch fish stocks");
    }
  };

  useEffect(() => {
    fetchFishStocks();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "stock" ? Number(value) : value,
    }));
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "fish_stock_uploads"); // replace with your Cloudinary preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/di8rc2p4j/image/upload",
        data
      );
      return res.data.secure_url; // image URL
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
      return null;
    }
  };

  // Add or Update fish stock
  const handleSubmit = async () => {
    try {
      if (!formData.fishCode || !formData.title || !formData.stock) {
        return toast.error("Please fill in all required fields");
      }

      let imageUrl = null;
      if (formData.imageFile) {
        imageUrl = await uploadImageToCloudinary(formData.imageFile);
        if (!imageUrl) return;
      }

     const payload = {
        fishCode: formData.fishCode,
        title: formData.title,
        stock: formData.stock,
        image: formData.imageFile 
                ? await uploadImageToCloudinary(formData.imageFile)
                : editingFish?.image || null,
        };


      if (editingFish) {
        // Update
        await axios.put(
          `http://localhost:5000/api/fishstocks/${editingFish._id}`,
          payload
        );
        toast.success("Fish stock updated successfully!");
      } else {
        // Create
        await axios.post("http://localhost:5000/api/fishstocks", payload);
        toast.success("Fish stock added successfully!");
      }

      setShowForm(false);
      setEditingFish(null);
      setFormData({ fishCode: "", title: "", stock: 0, imageFile: null });
      fetchFishStocks();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  // Delete fish stock
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/fishstocks/${id}`);
      toast.success("Fish stock deleted successfully!");
      fetchFishStocks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete fish stock");
    }
  };

  // Edit fish stock
 const handleEdit = (fish) => {
  setEditingFish(fish);
  setFormData({
    fishCode: fish.fishCode,
    title: fish.title,
    stock: fish.stock,
    imageFile: null, // keep null, user can upload new image if needed
  });
  setShowForm(true);
};


  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500/90 text-white ";
      case "Out of Stock":
        return "bg-red-500/90 text-white ";
      default:
        return "bg-gray-500/10 text-gray-500 ";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Fish Stock</h1>
          <p className="text-muted-foreground">
            Add and manage your fish stock records
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingFish(null);
            setFormData({ fishCode: "", title: "", stock: 0, imageFile: null });
          }}
          className="bg-gradient-to-r from-primary to-black hover:opacity-90 hover-scale "
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-aqua/20 focus:border-aqua"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="animate-fade-in border-aqua/20">
          <CardHeader>
            <CardTitle>
              {editingFish ? "Edit Fish Stock" : "Add New Fish Stock"}
            </CardTitle>
            <CardDescription>
              {editingFish
                ? "Update your fish stock record"
                : "Create a new fish stock record"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fishCode">Fish Code</Label>
                <Input
                  id="fishCode"
                  value={formData.fishCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
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

              {/* Fish Image */}
              <div className="space-y-2">
                <Label htmlFor="image">Fish Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageFile: e.target.files[0],
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-primary to-black hover:opacity-90"
              >
                {editingFish ? "Update Fish Stock" : "Create Fish Stock"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-4">
        <div className="grid gap-4">
          {fishStocks
            .filter((f) =>
              f.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((fish) => (
              <Card
                key={fish._id}
                className="hover-scale animate-fade-in border-aqua/10"
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-aqua/10 rounded-lg flex items-center justify-center">
                      {fish.image ? (
                        <img
                          src={fish.image}
                          alt={fish.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No Image
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {fish.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge
                          className={getStatusColor(
                            fish.stock > 0 ? "In Stock" : "Out of Stock"
                          )}
                        >
                          {fish.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Fish Code: {fish.fishCode}</span>
                        <span>Stock: {fish.stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(fish)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-500/10 hover:text-red-500"
                      onClick={() => handleDelete(fish._id)}
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

export default FishStock;
