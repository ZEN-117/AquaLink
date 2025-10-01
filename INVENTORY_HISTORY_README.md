# Inventory History System

## Overview
The inventory history system tracks all changes made to inventory items including creation, updates, assignments, and deletions. This provides a complete audit trail for inventory management.

## Features

### 1. Automatic History Logging
The system automatically logs the following actions:
- **Item Creation**: When new inventory items are added
- **Item Updates**: When existing items are modified (stock changes, name changes, etc.)
- **Item Assignments**: When items are assigned to different tank sections
- **Item Deletions**: When items are removed from inventory

### 2. History Data Structure
Each history entry contains:
- `itemName`: Name of the inventory item
- `assignedSection`: Tank section where item was assigned (or "N/A" for non-assignment actions)
- `quantity`: Quantity involved in the action
- `dateTime`: Timestamp of the action (ISO format)
- `user`: User who performed the action (retrieved from localStorage)
- `action`: Type of action (CREATED, UPDATED, ASSIGNED, DELETED)
- `previousStock`: Stock level before the action
- `newStock`: Stock level after the action

### 3. History Viewing Interface
The InventoryHistory component provides:
- **Real-time data fetching** from the backend API
- **Advanced filtering** by:
  - Action type (Created, Updated, Assigned, Deleted)
  - User
  - Date range
  - Search terms (item name, section, user)
- **Export functionality** to CSV format
- **Summary statistics** showing counts by action type
- **Responsive table view** with all history details

### 4. Backend Integration
The system integrates with the backend API endpoint:
- `GET /api/inventory-history` - Fetch all history records
- `POST /api/inventory-history` - Create new history entries

## Usage

### Viewing History
1. Navigate to the Inventory History section in the dashboard
2. Use the filters to narrow down results:
   - Search by item name, section, or user
   - Filter by action type
   - Filter by specific user
   - Filter by date
3. Use the "Clear" button to reset all filters

### Exporting Data
1. Apply any desired filters
2. Click the "Export CSV" button
3. A CSV file will be downloaded with all visible history records

### Refreshing Data
Click the "Refresh" button to fetch the latest history data from the backend.

## Technical Implementation

### Frontend Components
- `FishInventory.jsx`: Modified to log history on all inventory operations
- `InventoryHistory.jsx`: New component for viewing and managing history

### History Logging Points
1. **Item Assignment** (`handleAssign` function):
   - Logs each item assignment with tank section details
   - Tracks stock reduction from assignments

2. **Item Creation** (`handleSubmit` function):
   - Logs when new items are added to inventory
   - Records initial stock levels

3. **Item Updates** (`handleSubmit` function):
   - Logs when existing items are modified
   - Tracks stock changes and other modifications

4. **Item Deletion** (`handleDelete` function):
   - Logs when items are removed from inventory
   - Records final stock levels before deletion

### Error Handling
- History logging failures don't interrupt main operations
- Failed history entries are logged to console but don't break the user experience
- Toast notifications provide user feedback for all operations

## API Endpoints Required

The backend should implement these endpoints:

### GET /api/inventory-history
Returns all inventory history records sorted by date (newest first).

### POST /api/inventory-history
Creates a new history entry with the following body:
```json
{
  "itemName": "string",
  "assignedSection": "string",
  "quantity": number,
  "dateTime": "ISO string",
  "user": "string",
  "action": "CREATED|UPDATED|ASSIGNED|DELETED",
  "previousStock": number,
  "newStock": number
}
```

## Database Schema

The inventory history should be stored with the following fields:
- `_id`: Unique identifier
- `itemName`: String
- `assignedSection`: String
- `quantity`: Number
- `dateTime`: Date/DateTime
- `user`: String
- `action`: Enum (CREATED, UPDATED, ASSIGNED, DELETED)
- `previousStock`: Number
- `newStock`: Number
- `createdAt`: Auto-generated timestamp
- `updatedAt`: Auto-generated timestamp

## Security Considerations

- User information is retrieved from localStorage (ensure proper authentication)
- History entries are created automatically and cannot be manually modified
- All operations are logged for audit purposes
- Export functionality respects current filter settings

## Future Enhancements

Potential improvements for the inventory history system:
1. **Bulk operations logging**: Track bulk updates or imports
2. **Advanced analytics**: Charts and graphs for inventory trends
3. **Automated reports**: Scheduled history reports
4. **Notification system**: Alerts for specific inventory events
5. **User activity tracking**: More detailed user action logging
6. **Data retention policies**: Automatic cleanup of old history records
