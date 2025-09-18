import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ManageGigs = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const existingGigs = [
    {
      id: 1,
      title: "Premium Rainbow Guppy Male",
      price: "$25.00",
      stock: 8,
      status: "Active",
      image: "/src/assets/guppy-rainbow.jpg",
      views: 124,
      orders: 15
    },
    {
      id: 2,
      title: "Blue Moscow Guppy Pair",
      price: "$18.00",
      stock: 12,
      status: "Active",
      image: "/src/assets/guppy-blue.jpg",
      views: 89,
      orders: 8
    },
    {
      id: 3,
      title: "Red Delta Guppy Female",
      price: "$15.00",
      stock: 0,
      status: "Out of Stock",
      image: "/src/assets/guppy-red.jpg",
      views: 67,
      orders: 12
    }
  ];

  // ✅ Removed TypeScript type annotation
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
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
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-primary to-black hover:opacity-90 hover-scale"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Gig
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search your gigs..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-aqua/20 focus:border-aqua"
        />
      </div>

      {/* Add Gig Form */}
      {showAddForm && (
        <Card className="animate-fade-in border-aqua/20">
          <CardHeader>
            <CardTitle>Add New Gig</CardTitle>
            <CardDescription>Create a new guppy listing for your marketplace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Gig Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Premium Rainbow Guppy Male"
                  className="border-aqua/20 focus:border-aqua"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-base">Price ($)</Label>
                <Input 
                  id="price" 
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  className="border-aqua/20 focus:border-aqua"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base">Category</Label>
                <Select>
                  <SelectTrigger className="border-aqua/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male Guppy</SelectItem>
                    <SelectItem value="female">Female Guppy</SelectItem>
                    <SelectItem value="pair">Guppy Pair</SelectItem>
                    <SelectItem value="fry">Guppy Fry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-base">Stock Quantity</Label>
                <Input 
                  id="stock" 
                  type="number"
                  placeholder="10"
                  className="border-aqua/20 focus:border-aqua"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea 
                id="description"
                placeholder="Describe your guppy's characteristics, breeding lineage, care instructions..."
                rows={4}
                className="border-aqua/20 focus:border-aqua"
              />
            </div>
            
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-primary to-black hover:opacity-90">
                Create Gig
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="border-aqua/20 hover:bg-aqua/10"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Gigs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Your Gigs</h2>
        <div className="grid gap-4">
          {existingGigs.map((gig) => (
            <Card key={gig.id} className="hover-scale animate-fade-in border-aqua/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
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
                        <span className="text-lg font-bold text-aqua">{gig.price}</span>
                        <Badge className={getStatusColor(gig.status)}>
                          {gig.status}
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
                    <Button variant="outline" size="sm" className="hover:bg-aqua/10">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-aqua/10">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-red-500/10 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
