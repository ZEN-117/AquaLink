import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/orders/${user?.id || "guest"}`)
      .then((res) => setOrders(res.data || []))
      .catch(() => toast.error("Failed to load orders"));
  }, [user]);

  if (orders.length === 0) {
    return <p className="text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id}>
          <CardHeader>
            <CardTitle>Order #{order._id.slice(-6)}</CardTitle>
            <CardDescription>
              Status: <span className="font-medium">{order.status}</span> • Placed {new Date(order.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.items.map((i, idx) => (
              <div key={`${order._id}-${idx}`} className="flex justify-between">
                <span>{i?.productId?.title || "Product"} × {i.quantity}</span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span>${Number(order.total || 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Orders;
