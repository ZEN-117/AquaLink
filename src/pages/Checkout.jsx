import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle, Loader2, Download, CheckCircle2 } from "lucide-react";
import jsPDF from 'jspdf';
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:5000";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get cart data from location state or fetch it
  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  const [orderSummary, setOrderSummary] = useState(location.state?.orderSummary || {});
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    
    // Shipping Address
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Sri Lanka",
    
    // Shipping Method
    shippingMethod: "standard",
    
    // Payment Method
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    
    // Additional
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [tempOrderData, setTempOrderData] = useState(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Luhn algorithm for card number validation
  const isValidCardNumber = (cardNumber) => {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const shippingMethods = [
    { id: "standard", name: "Standard Delivery", price: 0, days: "3-5 business days" },
    { id: "express", name: "Express Delivery", price: 500, days: "1-2 business days" },
    { id: "overnight", name: "Overnight Delivery", price: 1000, days: "Next business day" },
  ];

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "bank", name: "Cash on Delivery", icon: Shield },
  ];

  // Fetch cart data if not provided
  useEffect(() => {
    if (!cartItems.length && user?.email) {
      fetchCartData();
    }
  }, [user]);

  const fetchCartData = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/cart/${user.email}`);
      const items = (data?.items || []).map((i) => ({
        id: i?.product?._id,
        name: i?.product?.title || "Product",
        price: Number(i?.product?.price ?? 0),
        image: i?.product?.image,
        quantity: Number(i?.quantity ?? 1),
        fishCode: i?.product?.fishCode || "",
      }));
      setCartItems(items);
      
      // Calculate order summary
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = 0; // Will be updated based on selected method
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
      
      setOrderSummary({ subtotal, shipping, tax, total });
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart data");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Special handler for phone number (limit to 10 digits)
  const handlePhoneChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    const limitedDigits = digitsOnly.slice(0, 10);
    handleInputChange("phone", limitedDigits);
  };

  // Special handler for expiry date (MM/YY format with auto-slash)
  const handleExpiryDateChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = digitsOnly.slice(0, 4);
    
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    
    handleInputChange("expiryDate", formatted);
  };

  // Special handler for card number (format with spaces)
  const handleCardNumberChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    const limitedDigits = digitsOnly.slice(0, 19);
    const formatted = limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
    handleInputChange("cardNumber", formatted);
  };

  // Special handler for CVV (limit to 4 digits)
  const handleCvvChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    const limitedDigits = digitsOnly.slice(0, 4);
    handleInputChange("cvv", limitedDigits);
  };

  // Generate PDF payment slip
  const generatePaymentSlip = () => {
    console.log("PDF Generation Debug:", {
      tempOrderData,
      orderId,
      cartItems,
      formData
    });
    
    if (!tempOrderData || !orderId) {
      console.error("Missing data for PDF generation:", { tempOrderData, orderId });
      toast.error("Unable to generate PDF. Missing order data.");
      return;
    }

    try {
      console.log("Starting PDF generation...");
      
      // Create PDF document in landscape orientation
      const doc = new jsPDF('landscape');
      console.log("PDF document created successfully");
      
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      const fullDateTime = `${currentDate} ${currentTime}`;
      console.log("Date and time generated:", { currentDate, currentTime });

      // Define colors (matching Dialog template style)
      const primaryColor = [59, 130, 246]; // Blue primary color
      const secondaryColor = [34, 197, 94]; // Light green for section titles
      const darkGray = [55, 65, 81]; // Dark gray for main text
      const lightGray = [107, 114, 128]; // Light gray for secondary text

      // Add border (thin lines on left, right, and bottom)
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(10, 10, 10, doc.internal.pageSize.height - 10); // Left border
      doc.line(doc.internal.pageSize.width - 10, 10, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10); // Right border
      doc.line(10, doc.internal.pageSize.height - 10, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10); // Bottom border

      // Header Section
      // AquaLink Logo/Brand (Primary Color)
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('AquaLink', 20, 30);
      console.log("Header added");
      
      // Main Title
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      doc.text('Payment confirmation', 20, 45);
      console.log("Title added");
      
      // Transaction ID (Primary Color)
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Transaction ID : ${orderId}`, 20, 55);
      console.log("Transaction ID added");
      
      // Summary statement
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Here is a summary of your recent payment.', 20, 65);
      console.log("Summary statement added");

      // Top right detail
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setFontSize(8);
      doc.text('Details of your payment from AquaLink App.', doc.internal.pageSize.width - 20, 20, { align: 'right' });

      // Main Content - Two Column Layout (optimized for landscape)
      const leftColumnX = 20;
      const rightColumnX = 120; // Reduced gap to keep order details in frame
      const sectionStartY = 80;

      // Left Section: Customer Information
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer information', leftColumnX, sectionStartY);
      console.log("Customer section header added");
      
      // Customer data
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const customerName = tempOrderData.shippingAddress?.firstName && tempOrderData.shippingAddress?.lastName 
        ? `${tempOrderData.shippingAddress.firstName} ${tempOrderData.shippingAddress.lastName}`
        : 'N/A';
      const customerEmail = tempOrderData.userEmail || 'N/A';
      const customerPhone = tempOrderData.shippingAddress?.phone || 'N/A';
      const customerAddress = tempOrderData.shippingAddress?.address || 'N/A';
      const customerCity = tempOrderData.shippingAddress?.city || 'N/A';
      const customerState = tempOrderData.shippingAddress?.state || '';
      const customerZip = tempOrderData.shippingAddress?.zipCode || 'N/A';
      const customerCountry = tempOrderData.shippingAddress?.country || 'N/A';
      
      console.log("Customer data extracted:", {
        customerName, customerEmail, customerPhone, customerAddress, customerCity, customerState, customerZip, customerCountry
      });
      
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
      doc.text(`${customerCity}${customerState ? ', ' + customerState : ''} ${customerZip}`, leftColumnX + 30, currentY);
      currentY += 8;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Country', leftColumnX, currentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(customerCountry, leftColumnX + 30, currentY);
      console.log("Customer information added");

      // Right Section: Order Summary (Transaction Details)
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Order details', rightColumnX, sectionStartY);
      console.log("Order details header added");

      // Create order items table
      const items = cartItems || [];
      const tableData = items.map(item => [
        item.name || 'Unknown Item',
        item.quantity || 1,
        `Rs. ${(item.price || 0).toFixed(2)}`,
        'Paid'
      ]);

      // Add total row
      const subtotal = tempOrderData.subtotal || 0;
      const shipping = tempOrderData.shipping || 0;
      const tax = tempOrderData.tax || 0;
      const total = tempOrderData.total || 0;
      
      console.log("Order totals:", { subtotal, shipping, tax, total });

      if (tableData.length > 0) {
        // Create table manually without autoTable (optimized for landscape)
        const tableStartY = sectionStartY + 10;
        const rowHeight = 12;
        const colWidths = [60, 15, 25, 25]; // Adjusted column widths to fit in frame
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
          doc.text(row[0], colPositions[0], currentTableY); // Item
          doc.text(row[1].toString(), colPositions[1], currentTableY); // Qty
          doc.text(row[2], colPositions[2], currentTableY); // Amount
          doc.text(row[3], colPositions[3], currentTableY); // Status
          
          // Row separator
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
        doc.text(`Rs. ${total.toFixed(2)}`, colPositions[2], totalY + 8);
        console.log("Order details table added manually");
      }

      // Payment Information Section
      const tableEndY = tableData.length > 0 ? (sectionStartY + 10 + (tableData.length * 12) + 30) : sectionStartY + 80;
      const paymentSectionY = Math.max(sectionStartY + 80, tableEndY);
      
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment information', leftColumnX, paymentSectionY);
      console.log("Payment section header added");
      
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
      
      const paymentMethodName = paymentMethods.find(m => m.id === tempOrderData.paymentMethod)?.name || 'Unknown';
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Payment Method', leftColumnX, paymentY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(paymentMethodName, leftColumnX + 30, paymentY);
      console.log("Payment information added");

      // Footer (moved to right side to avoid disturbing payment info)
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for your purchase!', doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 30, { align: 'right' });
      doc.text('For support, contact us at support@aqualink.com', doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 25, { align: 'right' });
      console.log("Footer added");

      // Save the PDF
      const fileName = `payment-receipt-${orderId}.pdf`;
      console.log("Attempting to save PDF with filename:", fileName);
      
      doc.save(fileName);
      console.log("PDF saved successfully!");
      
      toast.success("Payment slip downloaded successfully!");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (10 digits for Sri Lanka)
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Payment validation
    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
      if (!formData.expiryDate.trim()) newErrors.expiryDate = "Expiry date is required";
      if (!formData.cvv.trim()) newErrors.cvv = "CVV is required";
      if (!formData.cardName.trim()) newErrors.cardName = "Cardholder name is required";

      // Card number validation (Luhn algorithm)
      const cardNumber = formData.cardNumber.replace(/\s/g, "");
      if (cardNumber && !isValidCardNumber(cardNumber)) {
        newErrors.cardNumber = "Please enter a valid card number";
      }

      // CVV validation (3-4 digits)
      const cvvRegex = /^[0-9]{3,4}$/;
      if (formData.cvv && !cvvRegex.test(formData.cvv)) {
        newErrors.cvv = "Please enter a valid CVV (3-4 digits)";
      }

      // Expiry date validation (MM/YY format)
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (formData.expiryDate && !expiryRegex.test(formData.expiryDate)) {
        newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      } else if (formData.expiryDate && expiryRegex.test(formData.expiryDate)) {
        // Check if card is not expired
        const [month, year] = formData.expiryDate.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const currentDate = new Date();
        if (expiryDate < currentDate) {
          newErrors.expiryDate = "Card has expired";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Prepare order data for confirmation
    const orderData = {
      userEmail: formData.email,
      items: cartItems.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
      },
      shippingMethod: formData.shippingMethod,
      paymentMethod: formData.paymentMethod,
      subtotal: orderSummary.subtotal,
      shipping: orderSummary.shipping,
      tax: orderSummary.tax,
      total: orderSummary.total,
      notes: formData.notes,
      status: "pending"
    };

    // Store order data temporarily and show confirmation popup
    setTempOrderData(orderData);
    setShowPaymentConfirmation(true);
  };

  const handleConfirmPayment = async () => {
    if (!tempOrderData) return;

    setIsProcessingPayment(true);

    try {
      console.log("Creating order with data:", tempOrderData);
      
      // First, clear existing cart and sync cart items to backend database
      console.log("Syncing cart items to backend...");
      
      // Clear existing cart first
      try {
        await axios.delete(`${API_BASE}/api/cart/clear`, {
          data: { email: user?.email }
        });
        console.log("Cleared existing cart");
      } catch (clearError) {
        console.log("No existing cart to clear or clear failed:", clearError);
      }
      
      // Add items with correct quantities
      for (const item of cartItems) {
        try {
          await axios.post(`${API_BASE}/api/cart/add`, {
            email: user?.email,
            productId: item.id,
            quantity: item.quantity
          });
          console.log(`Added ${item.name} (qty: ${item.quantity}) to backend cart`);
        } catch (cartError) {
          console.error(`Failed to add ${item.name} to cart:`, cartError);
          // Continue with other items even if one fails
        }
      }
      
      // Transform shipping address to match backend expectations
      const transformedShippingAddress = {
        fullName: `${tempOrderData.shippingAddress.firstName} ${tempOrderData.shippingAddress.lastName}`,
        phone: tempOrderData.shippingAddress.phone,
        address: tempOrderData.shippingAddress.address,
        city: tempOrderData.shippingAddress.city,
        postalCode: tempOrderData.shippingAddress.zipCode,
        country: tempOrderData.shippingAddress.country
      };

      // Transform payment method to match backend expectations
      const transformedPaymentMethod = tempOrderData.paymentMethod === "card" ? "credit_card" : 
                                      tempOrderData.paymentMethod === "bank" ? "cash_on_delivery" : 
                                      "cash_on_delivery";

      // Create order in the database with correct totals
      const orderPayload = {
        email: user?.email,
        shippingAddress: transformedShippingAddress,
        paymentMethod: transformedPaymentMethod,
        // Include the correct totals from frontend calculation
        subtotal: tempOrderData.subtotal,
        shipping: tempOrderData.shipping,
        tax: tempOrderData.tax,
        totalAmount: tempOrderData.total
      };
      
      console.log("Sending order payload:", orderPayload);
      console.log("API endpoint:", `${API_BASE}/api/orders/place`);
      
      const response = await axios.post(`${API_BASE}/api/orders/place`, orderPayload);
      
      console.log("Order created successfully:", response.data);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store order ID and show success popup
      setOrderId(response.data._id);
      setShowPaymentConfirmation(false);
      setShowPaymentSuccess(true);
      
      toast.success("Order placed successfully!");

    } catch (error) {
      console.error("Payment processing error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || "Bad request. Please check your data.");
      } else if (error.response?.status === 404) {
        toast.error("Cart is empty. Please add items to your cart first.");
      } else if (error.response?.status === 500) {
        toast.error(`Server error: ${error.response.data?.message || "Please try again later."}`);
      } else if (error.code === 'ECONNREFUSED') {
        toast.error("Cannot connect to server. Please check your connection.");
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentConfirmation(false);
    setTempOrderData(null);
  };

  const updateShippingCost = (methodId) => {
    const method = shippingMethods.find(m => m.id === methodId);
    const newShipping = method ? method.price : 0;
    const newTotal = orderSummary.subtotal + newShipping + orderSummary.tax;
    
    setOrderSummary(prev => ({
      ...prev,
      shipping: newShipping,
      total: newTotal
    }));
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">No items to checkout</h1>
            <p className="text-muted-foreground mb-8">
              Your cart is empty. Add some items before proceeding to checkout.
            </p>
            <Button asChild variant="ocean" size="lg">
              <button onClick={() => navigate("/marketplace")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </button>
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
          <Button variant="ghost" onClick={() => navigate("/cart")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your order details and payment information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="771234567"
                      maxLength={10}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    <p className="text-xs text-muted-foreground">Enter 10-digit phone number (without +94)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className={errors.state ? "border-red-500" : ""}
                    />
                    {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className={errors.zipCode ? "border-red-500" : ""}
                    />
                    {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.shippingMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        handleInputChange("shippingMethod", method.id);
                        updateShippingCost(method.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.id}
                            checked={formData.shippingMethod === method.id}
                            onChange={() => {
                              handleInputChange("shippingMethod", method.id);
                              updateShippingCost(method.id);
                            }}
                            className="text-primary"
                          />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.days}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {method.price === 0 ? "Free" : `Rs. ${method.price}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleInputChange("paymentMethod", method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={() => handleInputChange("paymentMethod", method.id)}
                          className="text-primary"
                        />
                        <method.icon className="h-5 w-5" />
                        <p className="font-medium">{method.name}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Details */}
                {formData.paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name *</Label>
                      <Input
                        id="cardName"
                        value={formData.cardName}
                        onChange={(e) => handleInputChange("cardName", e.target.value)}
                        className={errors.cardName ? "border-red-500" : ""}
                      />
                      {errors.cardName && <p className="text-sm text-red-500">{errors.cardName}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={23}
                        className={errors.cardNumber ? "border-red-500" : ""}
                      />
                      {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          value={formData.expiryDate}
                          onChange={(e) => handleExpiryDateChange(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={errors.expiryDate ? "border-red-500" : ""}
                        />
                        {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          value={formData.cvv}
                          onChange={(e) => handleCvvChange(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          className={errors.cvv ? "border-red-500" : ""}
                        />
                        {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any special instructions for your order..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {orderSummary.subtotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{orderSummary.shipping === 0 ? "Free" : `Rs. ${orderSummary.shipping?.toFixed(2) || "0.00"}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>Rs. {orderSummary.tax?.toFixed(2) || "0.00"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>Rs. {orderSummary.total?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="ocean"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Proceed to Payment"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentConfirmation} onOpenChange={setShowPaymentConfirmation}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Confirm Your Order & Payment
            </DialogTitle>
            <DialogDescription>
              Please review your order details before proceeding with payment
            </DialogDescription>
          </DialogHeader>

          {tempOrderData && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Shipping Address</h3>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="font-medium">{tempOrderData.shippingAddress.firstName} {tempOrderData.shippingAddress.lastName}</p>
                  <p>{tempOrderData.shippingAddress.address}</p>
                  <p>{tempOrderData.shippingAddress.city}, {tempOrderData.shippingAddress.state} {tempOrderData.shippingAddress.zipCode}</p>
                  <p>{tempOrderData.shippingAddress.country}</p>
                  <p className="text-sm text-muted-foreground">Phone: {tempOrderData.shippingAddress.phone}</p>
                </div>
              </div>

              <Separator />

              {/* Shipping & Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Shipping Method</h3>
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="font-medium">
                      {shippingMethods.find(m => m.id === tempOrderData.shippingMethod)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shippingMethods.find(m => m.id === tempOrderData.shippingMethod)?.days}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Payment Method</h3>
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="font-medium">
                      {paymentMethods.find(m => m.id === tempOrderData.paymentMethod)?.name}
                    </p>
                    {tempOrderData.paymentMethod === "card" && (
                      <p className="text-sm text-muted-foreground">
                        Card ending in {formData.cardNumber.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Notes */}
              {tempOrderData.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Order Notes</h3>
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm">{tempOrderData.notes}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {tempOrderData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{tempOrderData.shipping === 0 ? "Free" : `Rs. ${tempOrderData.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>Rs. {tempOrderData.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>Rs. {tempOrderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelPayment}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isProcessingPayment}
              className="bg-gradient-to-r from-primary to-black hover:opacity-90"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Confirm Rs. {tempOrderData?.total.toFixed(2)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Success Dialog */}
      <Dialog open={showPaymentSuccess} onOpenChange={setShowPaymentSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Payment Successful!
            </DialogTitle>
            <DialogDescription>
              Your order has been processed successfully. You can download your payment receipt below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Success Message */}
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">Payment Completed</h3>
              <p className="text-sm text-muted-foreground">
                Your order #{orderId} has been confirmed and payment has been processed.
              </p>
            </div>

            {/* Order Summary */}
            {tempOrderData && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Order Total:</span>
                  <span className="font-semibold">Rs. {tempOrderData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Method:</span>
                  <span>{paymentMethods.find(m => m.id === tempOrderData.paymentMethod)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>{shippingMethods.find(m => m.id === tempOrderData.shippingMethod)?.name}</span>
                </div>
              </div>
            )}

            {/* Download Button */}
            <Button
              onClick={generatePaymentSlip}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Payment Receipt
            </Button>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentSuccess(false);
                navigate("/marketplace");
              }}
              className="flex-1"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => {
                setShowPaymentSuccess(false);
                navigate("/userdashboard/orders");
              }}
              className="flex-1 bg-gradient-to-r from-primary to-black hover:opacity-90"
            >
              View Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Checkout;
