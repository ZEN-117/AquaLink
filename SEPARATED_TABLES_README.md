# Separated Inventory Tables System

## Overview
The inventory tracking system has been separated into two distinct tables to better organize and manage different types of inventory operations:

1. **AssignedItems Table** - Tracks all inventory assignments to tank sections
2. **InventoryHistory Table** - Tracks all other inventory operations (create, update, delete)

## Table Separation

### 1. AssignedItems Table
**Purpose**: Track all inventory items that have been assigned to specific tank sections.

**Data Fields**:
- `itemName`: Name of the inventory item
- `assignedSection`: Tank section where item was assigned (Large Tank, Medium Tank, Small Tank)
- `quantity`: Quantity assigned to the section
- `dateTime`: Timestamp of the assignment
- `user`: User who performed the assignment
- `action`: Always "ASSIGNED"
- `previousStock`: Stock level before assignment
- `newStock`: Stock level after assignment

**API Endpoint**: `GET/POST /api/assigned-items`

**Component**: `AssignedItems.jsx`

### 2. InventoryHistory Table
**Purpose**: Track all other inventory operations excluding assignments.

**Data Fields**:
- `itemName`: Name of the inventory item
- `quantity`: Quantity involved in the operation
- `dateTime`: Timestamp of the operation
- `user`: User who performed the operation
- `action`: CREATED, UPDATED, or DELETED
- `previousStock`: Stock level before operation
- `newStock`: Stock level after operation

**API Endpoint**: `GET/POST /api/inventory-history`

**Component**: `InventoryHistory.jsx`

## Features by Table

### AssignedItems Features
- **Section-based filtering**: Filter by tank section (Large, Medium, Small)
- **Assignment tracking**: Focus on items assigned to specific sections
- **Section badges**: Color-coded badges for different tank sections
- **Assignment statistics**: Count of assignments per tank section
- **Export functionality**: Export assigned items to CSV
- **Real-time updates**: Automatic refresh of assignment data

### InventoryHistory Features
- **Action-based filtering**: Filter by action type (Created, Updated, Deleted)
- **General inventory tracking**: Track all non-assignment operations
- **Action badges**: Color-coded badges for different actions
- **Operation statistics**: Count of operations by type
- **Export functionality**: Export history to CSV
- **Navigation link**: Direct link to AssignedItems table

## Navigation Between Tables

### From InventoryHistory to AssignedItems
- **Button**: "View Assigned Items" button in the header
- **Styling**: Purple-themed button to distinguish from other actions
- **Route**: `/assigned-items`

### From AssignedItems to InventoryHistory
- **Button**: "Back" button in the header
- **Functionality**: Uses browser history to return to previous page
- **Alternative**: Direct navigation to inventory history page

## Backend API Requirements

### AssignedItems Endpoints
```
GET /api/assigned-items
- Returns all assigned items
- Sorted by date (newest first)

POST /api/assigned-items
- Creates new assignment record
- Body: { itemName, assignedSection, quantity, dateTime, user, action, previousStock, newStock }
```

### InventoryHistory Endpoints
```
GET /api/inventory-history
- Returns all non-assignment inventory operations
- Sorted by date (newest first)

POST /api/inventory-history
- Creates new history record
- Body: { itemName, quantity, dateTime, user, action, previousStock, newStock }
```

## Database Schema

### AssignedItems Collection/Table
```sql
CREATE TABLE assigned_items (
  id PRIMARY KEY,
  itemName VARCHAR(255),
  assignedSection VARCHAR(255),
  quantity INT,
  dateTime DATETIME,
  user VARCHAR(255),
  action VARCHAR(50) DEFAULT 'ASSIGNED',
  previousStock INT,
  newStock INT,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### InventoryHistory Collection/Table
```sql
CREATE TABLE inventory_history (
  id PRIMARY KEY,
  itemName VARCHAR(255),
  quantity INT,
  dateTime DATETIME,
  user VARCHAR(255),
  action ENUM('CREATED', 'UPDATED', 'DELETED'),
  previousStock INT,
  newStock INT,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

## Component Structure

```
src/components/dashboard/
├── AssignedItems.jsx          # Assigned items table component
├── InventoryHistory.jsx       # General inventory history component
└── FishInventory.jsx          # Main inventory management (updated)
```

## Usage Workflow

### 1. Managing Inventory
- Use `FishInventory.jsx` for all inventory operations
- Assignments are automatically logged to `AssignedItems` table
- Other operations are logged to `InventoryHistory` table

### 2. Viewing Assigned Items
- Navigate to `/assigned-items` or use the "View Assigned Items" button
- Filter by section, user, or date
- Export assigned items data
- View assignment statistics

### 3. Viewing Inventory History
- Navigate to inventory history section in dashboard
- Filter by action type, user, or date
- Export history data
- View operation statistics
- Access assigned items via navigation button

## Benefits of Separation

### 1. **Focused Data Management**
- Assigned items have specific filtering and display needs
- General history operations have different requirements
- Cleaner, more focused user interfaces

### 2. **Better Performance**
- Smaller, more targeted queries
- Faster filtering and searching
- Reduced data transfer for specific use cases

### 3. **Improved User Experience**
- Clear separation of concerns
- Easier navigation and understanding
- Specialized features for each data type

### 4. **Scalability**
- Independent scaling of each table
- Easier maintenance and updates
- Better data organization

## Migration from Single Table

If migrating from a single inventory history table:

1. **Backend Migration**:
   - Create separate tables/collections
   - Migrate existing ASSIGNED records to AssignedItems
   - Migrate other records to InventoryHistory
   - Update API endpoints

2. **Frontend Migration**:
   - Deploy new components
   - Update routing
   - Test navigation between tables

## Future Enhancements

### AssignedItems Table
- **Return functionality**: Track items returned from sections
- **Section capacity**: Monitor section capacity limits
- **Assignment scheduling**: Schedule future assignments
- **Bulk assignments**: Assign multiple items at once

### InventoryHistory Table
- **Advanced analytics**: Charts and trends
- **Automated reports**: Scheduled history reports
- **Audit trails**: Enhanced security logging
- **Data retention**: Automatic cleanup policies

## Security Considerations

- **User authentication**: Ensure proper user identification
- **Data integrity**: Validate all operations before logging
- **Access control**: Restrict access based on user roles
- **Audit logging**: Maintain complete audit trails
- **Data export**: Secure export functionality

This separated table system provides a more organized, efficient, and user-friendly approach to inventory tracking while maintaining all the functionality of the original system.
