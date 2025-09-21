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

// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const FishStock = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fishStocks, setFishStocks] = useState([]);
  const [editingFish, setEditingFish] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "stock" ? Number(value) : value,
    }));
  };

  // Inline validation for unique fishCode
  const isFishCodeUnique = (code) => {
    if (editingFish && editingFish.fishCode === code) return true; // allow same code when editing
    return !fishStocks.some((f) => f.fishCode.toLowerCase() === code.toLowerCase());
  };

  const uploadImageToBackend = async (file) => {
    // Validate file
    if (!file) {
      toast.error("No file selected");
      return null;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return null;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return null;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      console.log("Uploading image to backend...", file.name);
      
      const response = await axios.post('http://localhost:5000/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });
      
      console.log("Upload successful:", response.data.imageUrl);
      return response.data.imageUrl;
    } catch (err) {
      console.error("Backend upload error:", err);
      console.error("Error response:", err.response?.data);
      
      // Handle specific error types
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        toast.error("Network error. Please check your internet connection.");
      } else if (err.response?.status === 400) {
        toast.error("Invalid file format or no file provided.");
      } else if (err.response?.status === 413) {
        toast.error("File too large. Please choose a smaller image.");
      } else {
        toast.error(`Image upload failed: ${err.response?.data?.message || err.message}`);
      }
      return null;
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      if (!formData.fishCode || !formData.title || !formData.stock) {
        return toast.error("Please fill in all required fields");
      }

      if (!isFishCodeUnique(formData.fishCode)) {
        return toast.error("You already added this fish Code, Try new fish Code");
      }

      // Handle image upload first
      let imageUrl = null;
      if (formData.imageFile) {
        console.log("Starting image upload...");
        imageUrl = await uploadImageToBackend(formData.imageFile);
        if (!imageUrl) {
          toast.error("Failed to upload image. Please try again.");
          return;
        }
        console.log("Image uploaded successfully:", imageUrl);
      } else if (editingFish?.image) {
        imageUrl = editingFish.image;
      }

      const payload = {
        fishCode: formData.fishCode,
        title: formData.title,
        stock: formData.stock,
        image: imageUrl,
      };

      console.log("Submitting payload:", payload);

      if (editingFish) {
        await axios.put(
          `http://localhost:5000/api/fishstocks/${editingFish._id}`,
          payload
        );
        toast.success("Fish stock updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/fishstocks", payload);
        toast.success("Fish stock added successfully!");
      }

      setShowForm(false);
      setEditingFish(null);
      setFormData({ fishCode: "", title: "", stock: 0, imageFile: null });
      fetchFishStocks();
    } catch (err) {
      console.error("Submit error:", err);
      console.error("Error response:", err.response?.data);
      toast.error(`Operation failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

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

  const handleEdit = (fish) => {
    setEditingFish(fish);
    setFormData({
      fishCode: fish.fishCode,
      title: fish.title,
      stock: fish.stock,
      imageFile: null,
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
            setEditingFish(null);
            setFormData({ fishCode: "", title: "", stock: 0, imageFile: null });
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-primary to-black hover:opacity-90 hover-scale"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Fish Stock
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

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl w-full  bg-gray-200">
          <DialogHeader>
            <DialogTitle>
              {editingFish ? "Edit Fish Stock" : "Add New Fish Stock"}
            </DialogTitle>
            <DialogDescription>
              {editingFish
                ? "Update your fish stock record"
                : "Create a new fish stock record"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fishCode">Fish Code</Label>
                <Input
                  id="fishCode"
                  value={formData.fishCode}
                  onChange={handleInputChange}
                  placeholder="Enter unique fish code"
                  className={formData.fishCode && !isFishCodeUnique(formData.fishCode) ? "border-red-500 focus:border-red-500" : ""}
                />
                {formData.fishCode && !isFishCodeUnique(formData.fishCode) && (
                  <p className="text-sm text-red-500">Fish code already exists</p>
                )}
                {formData.fishCode && isFishCodeUnique(formData.fishCode) && (
                  <p className="text-sm text-green-600">Fish code is available</p>
                )}
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

              <div className="space-y-2">
                <Label htmlFor="image">Fish Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("File size must be less than 5MB");
                        e.target.value = ""; // Clear the input
                        return;
                      }
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        toast.error("Please select an image file");
                        e.target.value = ""; // Clear the input
                        return;
                      }
                    }
                    setFormData((prev) => ({
                      ...prev,
                      imageFile: file,
                    }));
                  }}
                />
                {formData.imageFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.imageFile.name} ({(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {editingFish?.image && !formData.imageFile && (
                  <p className="text-sm text-muted-foreground">
                    Current image: {editingFish.image.split('/').pop()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-black hover:opacity-90"
              >
                {isSubmitting ? (
                  <>
                    {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Processing..."}
                  </>
                ) : (
                  editingFish ? "Update Fish Stock" : "Create Fish Stock"
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {fishStocks
          .filter((f) =>
            f.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((fish) => (
            <Card
              key={fish._id}
              className="group flex flex-col overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow bg-white border border-aqua/10"
            >
              {/* Image */}
              <div className="relative w-full h-45 bg-aqua/5 overflow-hidden">
                {fish.image ? (
                  <img
                    src={fish.image}
                    alt={fish.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              {/* Content */}
              <CardContent className="flex-1 flex flex-col p-4">
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {fish.title}
                </h3>

                <div className="flex items-start justify-between mt-2">
                  <div className="text-sm text-muted-foreground">
                    Stock: {fish.stock}
                  </div>
                  <Badge
                    className={getStatusColor(
                      fish.stock > 0 ? "In Stock" : "Out of Stock"
                    )}
                  >
                    {fish.stock > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <span className="mt-1 text-xs text-muted-foreground">
                  Code: {fish.fishCode}
                </span>

                <div className="mt-auto flex items-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-blue-500/10 hover:text-blue-500"
                    onClick={() => handleEdit(fish)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-red-500/10 hover:text-red-500"
                    onClick={() => handleDelete(fish._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default FishStock;
