import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:5000";

const Cart = () => {
  const { user } = useAuth();
  const uid = useMemo(() => (user?._id || "guest"), [user]); // ✅ single source of truth

  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const fetchCart = async () => {
    try {
      // ✅ fetch using the same uid used when adding to cart
      const { data } = await axios.get(`${API_BASE}/api/cart/${uid}`);
      const items = (data?.items || []).map((i) => ({
        id: i?.productId?._id || i?.productId?.id,         // tolerate either key
        name: i?.productId?.title || "Product",
        price: Number(i?.productId?.price ?? 0),
        image: i?.productId?.image,
        quantity: Number(i?.quantity ?? 1),
        description: i?.productId?.description || "",
      }));
      setCartItems(items);
    } catch (e) {
      console.error("❌ fetchCart error:", e);
      toast.error("Failed to load cart");
    }
  };

  useEffect(() => {
    fetchCart();
    // optional: re-fetch if user changes (login/logout)
  }, [uid]);

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems((items) => items.map((it) => (it.id === id ? { ...it, quantity: newQty } : it)));
  };

  const removeItem = (id) => setCartItems((items) => items.filter((it) => it.id !== id));
  const clearCart = () => setCartItems([]);

  const applyPromoCode = () => {
    const codes = { FISH10: 0.1, NEWBIE: 0.15, GUPPY20: 0.2 };
    const v = codes[promoCode.toUpperCase()];
    if (v) { setDiscount(v); toast.success("Promo code applied!"); }
    else { toast.error("Invalid promo code"); }
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = subtotal * discount;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + shipping + tax;

  const handleCheckout = async () => {
    try {
      await axios.post(`${API_BASE}/api/orders/checkout`, { userId: uid });
      toast.success("Order placed!");
      setCartItems([]);
    } catch (e) {
      console.error("❌ checkout error:", e);
      toast.error("Checkout failed");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any fish to your cart yet.
            </p>
            <Button asChild variant="ocean" size="lg">
              <Link to="/marketplace">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/marketplace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-muted">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-muted-foreground text-sm">{item.description}</p>
                          <Badge variant="secondary" className="mt-2">Premium Quality</Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({(discount * 100)}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Promo Code</label>
                  <div className="flex space-x-2">
                    <Input placeholder="Enter code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="flex-1" />
                    <Button variant="outline" onClick={applyPromoCode}>Apply</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCheckout} className="w-full" variant="ocean" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
