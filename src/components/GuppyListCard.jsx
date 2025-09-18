import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";

const rarityColors = {
  Common: "bg-muted text-muted-foreground",
  Rare: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Epic: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Legendary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
};

const GuppyListCard = ({
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
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm w-full">
      <CardContent className="p-0">
        <div className="flex h-48">
          {/* Image Section */}
          <div className="relative w-56 h-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-secondary/30 to-background">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2">
              <Badge className={`${rarityColors[rarity]} font-medium text-xs px-2 py-1`}>
                {rarity}
              </Badge>
            </div>

            {discountPercentage > 0 && (
              <div className="absolute top-8 left-2">
                <Badge className="bg-destructive text-destructive-foreground font-medium text-xs">
                  -{discountPercentage}%
                </Badge>
              </div>
            )}

            {/* Favorite Button */}
            <button
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={`h-3 w-3 transition-all duration-300 ${
                  isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
              />
            </button>

            {/* Stock Indicator */}
            <div className="absolute bottom-2 right-2">
              <div
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
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

          {/* Details Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              {/* Category */}
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                {category}
              </p>

              {/* Name */}
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                {name}
              </h3>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {rating} ({reviews} reviews)
                </span>
              </div>

              {/* Features */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl font-bold text-primary">${price}</span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-start">
              <Button
                variant="ocean"
                size="sm"
                className="group-hover:shadow-md transition-all duration-300"
                disabled={inStock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {inStock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuppyListCard;