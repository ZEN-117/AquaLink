import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import { Download, Package, Calendar, CreditCard, Trash2, History } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from 'jspdf';

const API_BASE = "http://localhost:5000";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (user?.email) {
      // Load current orders
      setLoading(true);
      axios
        .get(`${API_BASE}/api/orders/user/${user.email}`)
        .then((res) => setOrders(res.data || []))
        .catch((error) => {
          console.error("Failed to load orders:", error);
          toast.error("Failed to load orders");
        })
        .finally(() => setLoading(false));

      // Load order history
      setHistoryLoading(true);
      axios
        .get(`${API_BASE}/api/orders/user/${user.email}/history`)
        .then((res) => setOrderHistory(res.data || []))
        .catch((error) => {
          console.error("Failed to load order history:", error);
          toast.error("Failed to load order history");
        })
        .finally(() => setHistoryLoading(false));
    } else {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, [user]);

  // Generate PDF payment slip for an order
  const generatePaymentSlip = (order) => {
    try {
      const doc = new jsPDF('landscape');
      
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      const fullDateTime = `${currentDate} ${currentTime}`;

      // Define colors
      const primaryColor = [59, 130, 246]; // Blue primary color
      const secondaryColor = [34, 197, 94]; // Light green for section titles
      const darkGray = [55, 65, 81]; // Dark gray for main text
      const lightGray = [107, 114, 128]; // Light gray for secondary text

      // Add border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(10, 10, 10, doc.internal.pageSize.height - 10);
      doc.line(doc.internal.pageSize.width - 10, 10, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);
      doc.line(10, doc.internal.pageSize.height - 10, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);

      // Header Section
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('AquaLink', 20, 30);
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      doc.text('Payment confirmation', 20, 45);
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Transaction ID : ${order._id}`, 20, 55);
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Here is a summary of your recent payment.', 20, 65);

      // Top right detail
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setFontSize(8);
      doc.text('Details of your payment from AquaLink App.', doc.internal.pageSize.width - 20, 20, { align: 'right' });

      // Main Content - Two Column Layout
      const leftColumnX = 20;
      const rightColumnX = 120;
      const sectionStartY = 80;

      // Left Section: Customer Information
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer information', leftColumnX, sectionStartY);
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const customerName = order.shippingAddress?.fullName || 'N/A';
      const customerEmail = order.userEmail || 'N/A';
      const customerPhone = order.shippingAddress?.phone || 'N/A';
      const customerAddress = order.shippingAddress?.address || 'N/A';
      const customerCity = order.shippingAddress?.city || 'N/A';
      const customerZip = order.shippingAddress?.postalCode || 'N/A';
      const customerCountry = order.shippingAddress?.country || 'N/A';
      
      let currentY = sectionStartY + 10;
      
      // Customer details with labels
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Name', leftColumnX, currentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(customerName, leftColumnX + 30, currentY);
      currentY += 8;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Email', leftColumnX, currentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(customerEmail, leftColumnX + 30, currentY);
      currentY += 8;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Phone', leftColumnX, currentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(customerPhone, leftColumnX + 30, currentY);
      currentY += 8;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Address', leftColumnX, currentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(customerAddress, leftColumnX + 30, currentY);
      currentY += 8;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('City', leftColumnX, currentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`${customerCity} ${customerZip}`, leftColumnX + 30, currentY);
      currentY += 8;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Country', leftColumnX, currentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(customerCountry, leftColumnX + 30, currentY);

      // Right Section: Order Summary
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Order details', rightColumnX, sectionStartY);

      // Create order items table
      const items = order.items || [];
      const tableData = items.map(item => [
        item.title || 'Unknown Item',
        item.quantity || 1,
        `Rs. ${(item.price || 0).toFixed(2)}`,
        'Paid'
      ]);

      if (tableData.length > 0) {
        const tableStartY = sectionStartY + 10;
        const rowHeight = 12;
        const colPositions = [rightColumnX, rightColumnX + 60, rightColumnX + 75, rightColumnX + 100];
        
        // Table headers
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Item', colPositions[0], tableStartY);
        doc.text('Qty', colPositions[1], tableStartY);
        doc.text('Amount (Rs.)', colPositions[2], tableStartY);
        doc.text('Status', colPositions[3], tableStartY);
        
        // Header underline
        doc.setDrawColor(200, 200, 200);
        doc.line(rightColumnX, tableStartY + 3, rightColumnX + 125, tableStartY + 3);
        
        // Table rows
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setFont('helvetica', 'normal');
        
        let currentTableY = tableStartY + rowHeight;
        tableData.forEach((row, index) => {
          doc.text(row[0], colPositions[0], currentTableY);
          doc.text(row[1].toString(), colPositions[1], currentTableY);
          doc.text(row[2], colPositions[2], currentTableY);
          doc.text(row[3], colPositions[3], currentTableY);
          
          if (index < tableData.length - 1) {
            doc.setDrawColor(240, 240, 240);
            doc.line(rightColumnX, currentTableY + 3, rightColumnX + 125, currentTableY + 3);
          }
          
          currentTableY += rowHeight;
        });

        // Total row
        const totalY = currentTableY + 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(rightColumnX, totalY, rightColumnX + 125, totalY);
        
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Total', colPositions[1], totalY + 8);
        doc.text(`Rs. ${(order.totalAmount || 0).toFixed(2)}`, colPositions[2], totalY + 8);
      }

      // Payment Information Section
      const paymentSectionY = Math.max(sectionStartY + 80, (tableData.length > 0 ? (sectionStartY + 10 + (tableData.length * 12) + 30) : sectionStartY + 80));
      
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment information', leftColumnX, paymentSectionY);
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let paymentY = paymentSectionY + 10;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Date', leftColumnX, paymentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(fullDateTime, leftColumnX + 30, paymentY);
      paymentY += 8;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Status', leftColumnX, paymentY);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Success', leftColumnX + 30, paymentY);
      paymentY += 8;
      
      const paymentMethodName = order.payment?.method === 'credit_card' ? 'Credit Card' : 
                               order.payment?.method === 'cash_on_delivery' ? 'Cash on Delivery' : 
                               order.payment?.method || 'Unknown';
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Payment Method', leftColumnX, paymentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(paymentMethodName, leftColumnX + 30, paymentY);

      // Footer
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for your purchase!', doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 30, { align: 'right' });
      doc.text('For support, contact us at support@aqualink.com', doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 25, { align: 'right' });

      // Save the PDF
      const fileName = `payment-receipt-${order._id}.pdf`;
      doc.save(fileName);
      
      toast.success("Payment slip downloaded successfully!");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  const moveOrderToHistory = async (orderId) => {
    if (!window.confirm('Are you sure you want to move this order to history? This will remove it from your current orders.')) {
      return;
    }

    try {
      await axios.put(`${API_BASE}/api/orders/${orderId}/move-to-history`);
      // Remove from current orders and add to history
      const orderToMove = orders.find(order => order._id === orderId);
      if (orderToMove) {
        setOrders(orders.filter(order => order._id !== orderId));
        setOrderHistory([orderToMove, ...orderHistory]);
      }
      toast.success('Order moved to history successfully');
    } catch (error) {
      console.error('Failed to move order to history:', error);
      toast.error('Failed to move order to history');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer';
      case 'processing': return 'bg-blue-100 text-blue-800 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer';
      case 'shipped': return 'bg-purple-100 text-purple-800 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer';
      case 'delivered': return 'bg-green-100 text-green-800 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer';
      default: return 'bg-gray-100 text-gray-800 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer';
    }
  };

  // Component to render order cards
  const OrderCard = ({ order, showMoveToHistory = false }) => (
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePaymentSlip(order)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Receipt
            </Button>
            {showMoveToHistory && order.status === 'delivered' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveOrderToHistory(order._id)}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <History className="h-4 w-4" />
                Move to History
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
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
          {/* Only show subtotal if it's different from total (meaning there are additional fees) */}
          {order.subtotal && Number(order.subtotal) > 0 && Number(order.subtotal) !== Number(order.totalAmount) && (
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>Rs. {Number(order.subtotal).toFixed(2)}</span>
            </div>
          )}
          
          {/* Only show shipping if it's greater than 0 */}
          {Number(order.shipping) > 0 && (
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>Rs. {Number(order.shipping).toFixed(2)}</span>
            </div>
          )}
          
          {/* Only show tax if it's greater than 0 */}
          {Number(order.tax) > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>Rs. {Number(order.tax).toFixed(2)}</span>
            </div>
          )}
          
          {/* Always show total */}
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total</span>
            <span>Rs. {Number(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>
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
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage your orders and track order history</p>
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
            My Orders ({orders.length})
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
              <p className="text-muted-foreground text-lg">No orders yet.</p>
              <p className="text-muted-foreground text-sm">Your orders will appear here once you make a purchase.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} showMoveToHistory={true} />
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
              <p className="text-muted-foreground text-sm">Delivered orders will appear here when you move them to history.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orderHistory.map((order) => (
                <OrderCard key={order._id} order={order} showMoveToHistory={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
