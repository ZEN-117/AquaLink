import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calendar, CreditCard, User, MapPin, Phone, Mail, History } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

const IncomingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchOrders();
    fetchOrderHistory();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/orders/all`);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(`${API_BASE}/api/orders/all/history`);
      setOrderHistory(response.data || []);
    } catch (error) {
      console.error("Failed to load order history:", error);
      toast.error("Failed to load order history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/orders/${orderId}/status`, {
        status: newStatus
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // If order is delivered, move it to history and refresh both lists
      if (newStatus === 'delivered') {
        const orderToMove = orders.find(order => order._id === orderId);
        if (orderToMove) {
          setOrders(orders.filter(order => order._id !== orderId));
          setOrderHistory([orderToMove, ...orderHistory]);
        }
      }
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'processing';
      case 'processing': return 'shipped';
      case 'shipped': return 'delivered';
      case 'delivered': return null; // No next status
      case 'cancelled': return null; // No next status
      default: return 'processing';
    }
  };

  // Component to render order cards
  const OrderCard = ({ order, showStatusManagement = true }) => (
    <Card key={order._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{order._id.slice(-8)}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                {order.payment?.method === 'credit_card' ? 'Credit Card' : 
                 order.payment?.method === 'cash_on_delivery' ? 'Cash on Delivery' : 
                 'Unknown'}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Information */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.shippingAddress?.fullName || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{order.userEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.shippingAddress?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.country || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Order Items</h3>
          {order.items.map((item, idx) => (
            <div key={`${order._id}-${idx}`} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <span className="font-medium">{item.title}</span>
                <span className="text-muted-foreground ml-2">× {item.quantity}</span>
              </div>
              <span className="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="pt-3 border-t space-y-2">
          {order.subtotal && Number(order.subtotal) > 0 && Number(order.subtotal) !== Number(order.totalAmount) && (
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>Rs. {Number(order.subtotal).toFixed(2)}</span>
            </div>
          )}
          {Number(order.shipping) > 0 && (
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>Rs. {Number(order.shipping).toFixed(2)}</span>
            </div>
          )}
          {Number(order.tax) > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>Rs. {Number(order.tax).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total</span>
            <span>Rs. {Number(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Status Management - Only show for active orders */}
        {showStatusManagement && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Update Status:</span>
              <div className="flex items-center gap-2">
                <Select
                  value={order.status}
                  onValueChange={(newStatus) => updateOrderStatus(order._id, newStatus)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {getNextStatus(order.status) && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                    className="ml-2"
                  >
                    Next Step
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading || historyLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Incoming Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and track order history</p>
        </div>
      </div>

      {/* Tabbed Navigation Section */}
      <div className="bg-aqua/20 rounded-lg p-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-8 py-3 rounded-md transition-all duration-200 font-medium ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-primary to-black text-white shadow-sm'
                : 'bg-white/50 border border-aqua/20 text-aqua/70 hover:bg-white/70 hover:text-aqua'
            }`}
          >
            <Package className="h-4 w-4" />
            Active Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-8 py-3 rounded-md transition-all duration-200 font-medium ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-primary to-black text-white shadow-sm'
                : 'bg-white/50 border border-aqua/20 text-aqua/70 hover:bg-white/70 hover:text-aqua'
            }`}
          >
            <History className="h-4 w-4" />
            Order History ({orderHistory.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No active orders.</p>
              <p className="text-muted-foreground text-sm">Customer orders will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} showStatusManagement={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {orderHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No order history yet.</p>
              <p className="text-muted-foreground text-sm">Delivered orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orderHistory.map((order) => (
                <OrderCard key={order._id} order={order} showStatusManagement={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IncomingOrders;
