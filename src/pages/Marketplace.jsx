import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuppyCard from "@/components/GuppyCard";
import GuppyListCard from "@/components/GuppyListCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Grid, List } from "lucide-react";

// Import guppy images
import guppyBlue from "@/assets/guppy-blue.jpg";
import guppyRed from "@/assets/guppy-red.jpg";
import guppyRainbow from "@/assets/guppy-rainbow.jpg";
import guppyPremium from "@/assets/guppy-premium.jpg";
import guppyCollection from "@/assets/guppy-collection.jpg";

const mockGuppies = [
  {
    id: "1",
    name: "Royal Blue Emperor",
    image: guppyBlue,
    price: 45,
    originalPrice: 60,
    rating: 4.8,
    reviews: 124,
    category: "Premium Males",
    rarity: "Epic",
    inStock: 8,
    features: ["Vibrant Blue", "Large Fins", "Breeding Quality"]
  },
  {
    id: "2",
    name: "Sunset Paradise Female",
    image: guppyRed,
    price: 35,
    rating: 4.9,
    reviews: 89,
    category: "Premium Females",
    rarity: "Rare",
    inStock: 12,
    features: ["Orange & Red", "Peaceful", "High Fertility"]
  },
  {
    id: "3",
    name: "Rainbow Platinum",
    image: guppyRainbow,
    price: 125,
    originalPrice: 150,
    rating: 5.0,
    reviews: 45,
    category: "Exclusive Collection",
    rarity: "Legendary",
    inStock: 3,
    features: ["Multi-Color", "Show Quality", "Champion Bloodline"]
  },
  {
    id: "4",
    name: "Silver Storm",
    image: guppyPremium,
    price: 55,
    rating: 4.7,
    reviews: 156,
    category: "Premium Males",
    rarity: "Epic",
    inStock: 6,
    features: ["Metallic Sheen", "Fast Growth", "Hardy"]
  },
  {
    id: "5",
    name: "Mixed Breeding Pair",
    image: guppyCollection,
    price: 80,
    originalPrice: 100,
    rating: 4.6,
    reviews: 203,
    category: "Breeding Pairs",
    rarity: "Rare",
    inStock: 15,
    features: ["Male & Female", "Compatible", "Proven Breeders"]
  },
  {
    id: "6",
    name: "Neon Tetra Tail",
    image: guppyBlue,
    price: 40,
    rating: 4.5,
    reviews: 98,
    category: "Specialty",
    rarity: "Common",
    inStock: 20,
    features: ["Unique Pattern", "Active", "Beginner Friendly"]
  }
];

const categories = ["All", "Premium Males", "Premium Females", "Breeding Pairs", "Exclusive Collection", "Specialty"];
const rarities = ["All", "Common", "Rare", "Epic", "Legendary"];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" }
];

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRarity, setSelectedRarity] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const filteredGuppies = mockGuppies.filter(guppy => {
    const matchesSearch =
      guppy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guppy.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || guppy.category === selectedCategory;
    const matchesRarity = selectedRarity === "All" || guppy.rarity === selectedRarity;

    return matchesSearch && matchesCategory && matchesRarity;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-black bg-clip-text text-transparent">
                Guppy Marketplace
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover premium guppy fish from trusted breeders worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Filters & search */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-lg font-medium text-foreground mb-2">
                    Search Guppies
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-lg font-medium text-foreground mb-2">
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rarity */}
                <div>
                  <label className="block text-lg font-medium text-foreground mb-2">
                    Rarity
                  </label>
                  <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rarities.map(rarity => (
                        <SelectItem key={rarity} value={rarity}>
                          {rarity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-lg font-medium text-foreground mb-2">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredGuppies.length} of {mockGuppies.length} guppies
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Guppy grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 w-full"
            }`}
          >
            {filteredGuppies.map((guppy, index) => (
              <div
                key={guppy.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {viewMode === "grid" ? (
                  <GuppyCard {...guppy} />
                ) : (
                  <GuppyListCard {...guppy} />
                )}
              </div>
            ))}
          </div>

          {/* No results */}
          {filteredGuppies.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No guppies found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setSelectedRarity("All");
                    setSortBy("newest");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Marketplace;
