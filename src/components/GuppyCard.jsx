import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, Eye, ShoppingCart, Star } from "lucide-react";

const rarityColors = {
  Common: "bg-muted text-muted-foreground",
  Rare: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Epic: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Legendary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
};

const GuppyCard = ({
  id,
  name,
  image,
  price,
  originalPrice,
  rating,
  reviews,
  category,
  rarity,
  inStock,
  features,
  productCode,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card
      className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_20px_40px_-10px_hsl(var(--primary)/0.3)] hover:-translate-y-2 bg-card/50 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rarity Badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className={`${rarityColors[rarity]} font-medium text-xs px-2 py-1`}>
          {rarity}
        </Badge>
      </div>

      {/* Favorite Button */}
      <button
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300 group"
        onClick={() => setIsLiked(!isLiked)}
      >
        <Heart
          className={`h-4 w-4 transition-all duration-300 group-hover:scale-110 ${
            isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-12 left-3 z-10">
          <Badge className="bg-destructive text-destructive-foreground font-medium text-xs">
            -{discountPercentage}%
          </Badge>
        </div>
      )}

      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/30 to-background">
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />

          {/* Overlay on Hover */}
          <div
            className={`absolute inset-0 bg-primary/10 backdrop-blur-[1px] transition-all duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="wave" size="sm" className="shadow-lg">
                <Eye className="h-4 w-4 mr-2" />
                Quick View
              </Button>
            </div>
          </div>

          {/* Stock Indicator */}
          <div className="absolute bottom-3 right-3">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                inStock > 10
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : inStock > 0
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {inStock > 0 ? `${inStock} left` : "Out of stock"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category */}
          <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">
            {category}
          </p>

          {/* Product Code */}
          {productCode && (
            <p className="text-xs text-muted-foreground mb-1 font-mono">
              Code: {productCode}
            </p>
          )}

          {/* Name */}
          <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {rating} ({reviews} reviews)
            </span>
          </div>

          {/* Features */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {features.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{features.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">${price}</span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="ocean"
            className="w-full group-hover:shadow-lg transition-all duration-300"
            disabled={inStock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {inStock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuppyCard;
