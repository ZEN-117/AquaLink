import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Package, History, Search, Filter, Download, RefreshCw, FileText } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useUserDetails } from "@/hooks/useUserDetails";

const InventoryHistory = () => {
  const { user, displayName, fullName } = useUserDetails();
  const [history, setHistory] = useState([]);
  const [assignedItems, setAssignedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedLoading, setAssignedLoading] = useState(true);
  
  // General history filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  
  // Assigned items filters
  const [assignedSearchTerm, setAssignedSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [assignedUserFilter, setAssignedUserFilter] = useState("all");
  const [assignedDateFilter, setAssignedDateFilter] = useState("");
  
  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [sections, setSections] = useState([]);

  // Fetch inventory history
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setAssignedLoading(true);
      const response = await axios.get("http://localhost:5000/api/inventory-history");
      const historyData = response.data || [];
      
      // Sort by date (newest first)
      historyData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
      setHistory(historyData);
      
      // Extract assigned items from the same data
      extractAssignedItems(historyData);
      
      // Extract unique users for general history
      const uniqueUsers = [...new Set(historyData.map(item => item.user))].filter(Boolean);
      setUsers(uniqueUsers);
    } catch (err) {
      console.error("Failed to fetch inventory history:", err);
      toast.error("Failed to load inventory history");
    } finally {
      setLoading(false);
      setAssignedLoading(false);
    }
  };

  // Extract assigned items from the main history data
  const extractAssignedItems = (historyData) => {
    const assignedData = historyData.filter(item => item.action === 'ASSIGNED');
    
    // Sort by date (newest first)
    assignedData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    setAssignedItems(assignedData);
    
    // Extract unique users and sections from assigned items
    const uniqueUsers = [...new Set(assignedData.map(item => item.user))].filter(Boolean);
    const uniqueSections = [...new Set(assignedData.map(item => item.assignedSection))].filter(Boolean);
    setAssignedUsers(uniqueUsers);
    setSections(uniqueSections);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter history based on search and filters (exclude assigned items)
  const filteredHistory = history.filter((item) => {
    // Exclude assigned items - they have their own table
    if (item.action === 'ASSIGNED') return false;
    
    const matchesSearch = searchTerm === "" || 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || item.action === actionFilter;
    
    const matchesUser = userFilter === "all" || item.user === userFilter;
    
    const matchesDate = dateFilter === "" || 
      new Date(item.dateTime).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesAction && matchesUser && matchesDate;
  });

  // Filter assigned items based on search and filters
  const filteredAssignedItems = assignedItems.filter((item) => {
    const matchesSearch = assignedSearchTerm === "" || 
      item.itemName.toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
      (item.assignedSection && item.assignedSection.toLowerCase().includes(assignedSearchTerm.toLowerCase())) ||
      item.user.toLowerCase().includes(assignedSearchTerm.toLowerCase());
    
    const matchesSection = sectionFilter === "all" || 
      (item.assignedSection && item.assignedSection === sectionFilter) ||
      (sectionFilter === "N/A" && (!item.assignedSection || item.assignedSection === "N/A"));
    
    const matchesUser = assignedUserFilter === "all" || item.user === assignedUserFilter;
    
    const matchesDate = assignedDateFilter === "" || 
      new Date(item.dateTime).toISOString().split('T')[0] === assignedDateFilter;
    
    return matchesSearch && matchesSection && matchesUser && matchesDate;
  });

  // Get action badge color
  const getActionBadge = (action) => {
    const badges = {
      'CREATED': { color: 'bg-green-500', text: 'Created' },
      'UPDATED': { color: 'bg-blue-500', text: 'Updated' },
      'DELETED': { color: 'bg-red-500', text: 'Deleted' }
    };
    
    const badge = badges[action] || { color: 'bg-gray-500', text: action };
    
    return (
      <Badge className={`${badge.color} text-white hover:${badge.color}`}>
        {badge.text}
      </Badge>
    );
  };

  // Get section badge color
  const getSectionBadge = (section) => {
    if (!section || section === "N/A") {
      return (
        <Badge className="bg-gray-500 text-white hover:bg-gray-500">
          N/A
        </Badge>
      );
    }
    
    const badges = {
      'Large Tank Section': { color: 'bg-blue-500', text: 'Large Tank' },
      'Medium Tank Section': { color: 'bg-green-500', text: 'Medium Tank' },
      'Small Tank Section': { color: 'bg-yellow-500', text: 'Small Tank' }
    };
    
    const badge = badges[section] || { color: 'bg-gray-500', text: section };
    
    return (
      <Badge className={`${badge.color} text-white hover:${badge.color}`}>
        {badge.text}
      </Badge>
    );
  };

  // Format date and time
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  // Export inventory history to PDF
  const exportHistoryToPDF = () => {
    try {
      console.log("Starting PDF export for inventory history...");
      console.log("Filtered history data:", filteredHistory);
      console.log("jsPDF available:", typeof jsPDF);
      
      if (typeof jsPDF === 'undefined') {
        throw new Error('jsPDF library not loaded');
      }
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('Inventory History Report', 20, 20);
      
      // Date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Table data
      const tableData = filteredHistory.map(item => {
        const { date, time } = formatDateTime(item.dateTime);
        return [
          item.itemName,
          item.quantity,
          item.action,
          item.user || 'Unknown User',
          date,
          time,
          `${item.previousStock} to ${item.newStock}`
        ];
      });
      
      console.log("Table data prepared:", tableData);
      
      // Table headers
      const headers = ['Item Name', 'Quantity', 'Action', 'Username', 'Date', 'Time', 'Stock Change'];
      
      // Generate table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      console.log("Table generated, saving PDF...");
      
      // Save the PDF
      const fileName = `inventory-history-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      console.log("PDF saved successfully:", fileName);
      toast.success("Inventory history exported to PDF successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF: " + error.message);
    }
  };

  // Export assigned items to PDF
  const exportAssignedToPDF = () => {
    try {
      console.log("Starting PDF export for assigned items...");
      console.log("Filtered assigned items data:", filteredAssignedItems);
      console.log("jsPDF available:", typeof jsPDF);
      
      if (typeof jsPDF === 'undefined') {
        throw new Error('jsPDF library not loaded');
      }
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('Assigned Items Report', 20, 20);
      
      // Date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Table data
      const tableData = filteredAssignedItems.map(item => {
        const { date, time } = formatDateTime(item.dateTime);
        return [
          item.itemName,
          item.assignedSection,
          item.quantity,
          item.user || 'Unknown User',
          date,
          time,
          `${item.previousStock} to ${item.newStock}`
        ];
      });
      
      console.log("Assigned items table data prepared:", tableData);
      
      // Table headers
      const headers = ['Item Name', 'Assigned Section', 'Quantity', 'Username', 'Date', 'Time', 'Stock Change'];
      
      // Generate table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [128, 0, 128] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      console.log("Assigned items table generated, saving PDF...");
      
      // Save the PDF
      const fileName = `assigned-items-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      console.log("Assigned items PDF saved successfully:", fileName);
      toast.success("Assigned items exported to PDF successfully");
    } catch (error) {
      console.error("Error exporting assigned items PDF:", error);
      toast.error("Failed to export assigned items PDF: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory History</h1>
          <p className="text-muted-foreground">Track all inventory movements and assignments</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={fetchHistory} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </Button>
        </div>
      </div>


      {/* Tabs for switching between tables */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Inventory History
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Assigned Items
          </TabsTrigger>
        </TabsList>

        {/* Inventory History Tab */}
        <TabsContent value="history" className="space-y-4">
          {/* Export Button */}
          <div className="flex justify-end">
            <Button 
              onClick={exportHistoryToPDF} 
              className="bg-gradient-to-r from-blue-500 to-black hover:opacity-90 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export History PDF
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
          <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search items, users..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>

              {/* Action Filter */}
              <div>
                <select 
                  value={actionFilter} 
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">All Actions</option>
                  <option value="CREATED">Created</option>
                  <option value="UPDATED">Updated</option>
                  <option value="DELETED">Deleted</option>
                </select>
              </div>

              {/* User Filter */}
              <div>
                <select 
                  value={userFilter} 
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">All Users</option>
                  {users.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <Input 
                  type="date" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="text-sm"
                />
            </div>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setActionFilter("all");
                  setUserFilter("all");
                  setDateFilter("");
                }}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </Card>

      {/* History Table */}
      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Item Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Action</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Username</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Time</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stock Change</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading history...
          </div>
                </td>
              </tr>
            ) : filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-muted-foreground">
                  No history records found
                </td>
              </tr>
            ) : filteredHistory.map((item, index) => {
              const { date, time } = formatDateTime(item.dateTime);
              const stockChange = item.newStock - item.previousStock;
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {item.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionBadge(item.action)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{item.user}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.previousStock} → {item.newStock}
                      </span>
                      {stockChange !== 0 && (
                        <Badge 
                          className={`text-xs ${
                            stockChange > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {stockChange > 0 ? '+' : ''}{stockChange}
                        </Badge>
                      )}
          </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Summary Stats */}
      {filteredHistory.length > 0 && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {filteredHistory.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredHistory.filter(item => item.action === 'CREATED').length}
              </div>
              <div className="text-sm text-muted-foreground">Items Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredHistory.filter(item => item.action === 'UPDATED').length}
              </div>
              <div className="text-sm text-muted-foreground">Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredHistory.filter(item => item.action === 'DELETED').length}
              </div>
              <div className="text-sm text-muted-foreground">Deletions</div>
            </div>
          </div>
        </Card>
      )}
        </TabsContent>

        {/* Assigned Items Tab */}
        <TabsContent value="assigned" className="space-y-4">
          {/* Export Button */}
          <div className="flex justify-end">
            <Button 
              onClick={exportAssignedToPDF} 
              className="bg-gradient-to-r from-purple-500 to-black hover:opacity-90 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export Assigned PDF
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search items, sections, users..." 
                  value={assignedSearchTerm} 
                  onChange={(e) => setAssignedSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>

              {/* Section Filter */}
              <div>
                <select 
                  value={sectionFilter} 
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">All Sections</option>
                  <option value="N/A">N/A (No Section)</option>
                  {sections.filter(section => section && section !== "N/A").map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div>
                <select 
                  value={assignedUserFilter} 
                  onChange={(e) => setAssignedUserFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">All Users</option>
                  {assignedUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <Input 
                  type="date" 
                  value={assignedDateFilter} 
                  onChange={(e) => setAssignedDateFilter(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setAssignedSearchTerm("");
                  setSectionFilter("all");
                  setAssignedUserFilter("all");
                  setAssignedDateFilter("");
                }}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </Card>

          {/* Assigned Items Table */}
          <Card className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Item Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Assigned Section</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stock Change</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {assignedLoading ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading assigned items...
                      </div>
                    </td>
                  </tr>
                ) : filteredAssignedItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-muted-foreground">
                      No assigned items found
                    </td>
                  </tr>
                ) : filteredAssignedItems.map((item, index) => {
                  const { date, time } = formatDateTime(item.dateTime);
                  const stockChange = item.newStock - item.previousStock;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {item.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSectionBadge(item.assignedSection)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}</span>
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{item.user}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {item.previousStock} → {item.newStock}
                          </span>
                          {stockChange !== 0 && (
                            <Badge 
                              className={`text-xs ${
                                stockChange > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {stockChange > 0 ? '+' : ''}{stockChange}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Summary Stats */}
          {filteredAssignedItems.length > 0 && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {filteredAssignedItems.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredAssignedItems.filter(item => item.assignedSection === 'Large Tank Section').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Large Tank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredAssignedItems.filter(item => item.assignedSection === 'Medium Tank Section').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Medium Tank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredAssignedItems.filter(item => item.assignedSection === 'Small Tank Section').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Small Tank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {filteredAssignedItems.filter(item => !item.assignedSection || item.assignedSection === 'N/A').length}
                  </div>
                  <div className="text-sm text-muted-foreground">N/A</div>
          </div>
        </div>
      </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryHistory;
