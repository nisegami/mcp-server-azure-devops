# Azure DevOps Time Logs Tools

This document describes the tools available for working with Azure DevOps time logs.

## Table of Contents

- [`create_time_log`](#create_time_log) - Create a new time log entry for a work item
- [`read_time_logs`](#read_time_logs) - Read time log entries with optional filtering

## create_time_log

Creates a new time log entry for a work item.

### Description

The `create_time_log` tool allows you to log time spent on work items in Azure DevOps. This is useful for tracking effort, generating reports, and maintaining accurate records of work performed. Time logs can be categorized by type of work and include detailed comments about the activities performed.

### Parameters

```json
{
  "minutes": 120,
  "date": "2025-01-15",
  "workItemId": 1234,
  "type": "Development - Project",
  "comment": "Implemented user authentication feature"
}
```

| Parameter    | Type   | Required | Description                                                    |
| ------------ | ------ | -------- | -------------------------------------------------------------- |
| `minutes`    | number | Yes      | The number of minutes spent on the work item (minimum: 1)     |
| `date`       | string | Yes      | The date of the time log in YYYY-MM-DD format                 |
| `workItemId` | number | Yes      | The ID of the work item the time is logged against            |
| `type`       | string | Yes      | The type of work performed (see available types below)        |
| `comment`    | string | Yes      | A comment or description of the work performed                 |

#### Available Work Types

The `type` parameter must be one of the following predefined values:

- `Administration`
- `Analysis`
- `Deployment`
- `Design`
- `Development - Production Support`
- `Development - Project`
- `Documentation`
- `Leave - Annual`
- `Leave - Other`
- `Leave - Sick`
- `Lost Time`
- `Meeting`
- `Planning`
- `Public Holiday`
- `Research`
- `Routine Support`
- `Self Training`
- `Testing`
- `Time Off`
- `Training`
- `Troubleshooting`
- `User Support`

### Response

The tool returns the created time log entry object containing:

- `id`: The unique identifier of the time log entry
- `minutes`: The number of minutes logged
- `user`: The display name of the user who created the log
- `userId`: The unique identifier of the user
- `date`: The date of the time log
- `dateWeek`: The ISO week format (YYYY-Www) of the date
- `workItemId`: The ID of the associated work item
- `type`: The type of work performed
- `comment`: The description of the work performed

Example response:

```json
{
  "id": "12345",
  "minutes": 120,
  "user": "John Doe",
  "userId": "user-guid-123",
  "date": "2025-01-15",
  "dateWeek": "2025-W03",
  "workItemId": 1234,
  "type": "Development - Project",
  "comment": "Implemented user authentication feature"
}
```

### Error Handling

The tool may throw the following errors:

- ValidationError: If required parameters are missing or invalid (e.g., minutes < 1, invalid date format, invalid work type)
- AuthenticationError: If authentication fails
- PermissionError: If the user doesn't have permission to log time for the specified work item
- ResourceNotFoundError: If the specified work item doesn't exist
- GeneralError: For other unexpected errors

Error messages will include details about what went wrong and suggestions for resolution.

### Example Usage

```typescript
// Basic time log entry
const timeLog = await mcpClient.callTool('create_time_log', {
  minutes: 120,
  date: '2025-01-15',
  workItemId: 1234,
  type: 'Development - Project',
  comment: 'Implemented user authentication feature with OAuth integration'
});
console.log(`Created time log entry with ID ${timeLog.id}`);

// Meeting time log
const meetingLog = await mcpClient.callTool('create_time_log', {
  minutes: 60,
  date: '2025-01-15',
  workItemId: 5678,
  type: 'Meeting',
  comment: 'Sprint planning meeting - discussed upcoming features and priorities'
});

// Testing time log
const testingLog = await mcpClient.callTool('create_time_log', {
  minutes: 90,
  date: '2025-01-15',
  workItemId: 9012,
  type: 'Testing',
  comment: 'Performed integration testing for payment processing module'
});

// Documentation time log
const docsLog = await mcpClient.callTool('create_time_log', {
  minutes: 45,
  date: '2025-01-15',
  workItemId: 3456,
  type: 'Documentation',
  comment: 'Updated API documentation with new endpoint specifications'
});
```

## read_time_logs

Reads time log entries with optional filtering by date range and work item IDs.

### Description

The `read_time_logs` tool retrieves time log entries from Azure DevOps with various filtering options. By default, it shows only the current user's time logs, but can be filtered by date ranges, specific weeks, or work item IDs. This is useful for generating time reports, tracking progress, and analyzing work patterns.

### Parameters

All parameters are optional, allowing for flexible filtering:

```json
{
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31",
  "dateWeek": "2025-W03",
  "workItemIds": [1234, 5678]
}
```

| Parameter     | Type     | Required | Description                                                           |
| ------------- | -------- | -------- | --------------------------------------------------------------------- |
| `dateFrom`    | string   | No       | Start date for filtering time logs in YYYY-MM-DD format              |
| `dateTo`      | string   | No       | End date for filtering time logs in YYYY-MM-DD format                |
| `dateWeek`    | string   | No       | Filter time logs by a specific ISO week in YYYY-Www format           |
| `workItemIds` | number[] | No       | Array of work item IDs to filter time logs by                        |

### Filtering Logic

- If no parameters are provided, returns all time logs for the current user
- `dateFrom` and `dateTo` can be used together to specify a date range
- `dateWeek` provides a convenient way to filter by a specific week (e.g., "2025-W03")
- `workItemIds` filters to show only time logs for specific work items
- Multiple filters can be combined (e.g., specific work items within a date range)

### Response

The tool returns a `TimeLogApiResponse` object containing:

- `count`: The total number of time log entries returned
- `value`: An array of time log entry objects

Each time log entry in the `value` array contains:

- `id`: The unique identifier of the time log entry
- `minutes`: The number of minutes logged
- `user`: The display name of the user who created the log
- `userId`: The unique identifier of the user
- `date`: The date of the time log
- `dateWeek`: The ISO week format (YYYY-Www) of the date
- `workItemId`: The ID of the associated work item
- `type`: The type of work performed
- `comment`: The description of the work performed

Example response:

```json
{
  "count": 3,
  "value": [
    {
      "id": "12345",
      "minutes": 120,
      "user": "John Doe",
      "userId": "user-guid-123",
      "date": "2025-01-15",
      "dateWeek": "2025-W03",
      "workItemId": 1234,
      "type": "Development - Project",
      "comment": "Implemented user authentication feature"
    },
    {
      "id": "12346",
      "minutes": 60,
      "user": "John Doe",
      "userId": "user-guid-123",
      "date": "2025-01-15",
      "dateWeek": "2025-W03",
      "workItemId": 5678,
      "type": "Meeting",
      "comment": "Sprint planning meeting"
    },
    {
      "id": "12347",
      "minutes": 90,
      "user": "John Doe",
      "userId": "user-guid-123",
      "date": "2025-01-16",
      "dateWeek": "2025-W03",
      "workItemId": 1234,
      "type": "Testing",
      "comment": "Unit testing for authentication module"
    }
  ]
}
```

### Error Handling

The tool may throw the following errors:

- ValidationError: If parameters are in invalid format (e.g., invalid date format, invalid week format)
- AuthenticationError: If authentication fails
- PermissionError: If the user doesn't have permission to read time logs
- GeneralError: For other unexpected errors

Error messages will include details about what went wrong and suggestions for resolution.

### Example Usage

```typescript
// Get all time logs for the current user
const allLogs = await mcpClient.callTool('read_time_logs', {});
console.log(`Found ${allLogs.count} time log entries`);

// Get time logs for a specific date range
const rangeLogs = await mcpClient.callTool('read_time_logs', {
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
});
console.log(`Found ${rangeLogs.count} time logs in January 2025`);

// Get time logs for a specific week
const weekLogs = await mcpClient.callTool('read_time_logs', {
  dateWeek: '2025-W03'
});
console.log(`Found ${weekLogs.count} time logs in week 3 of 2025`);

// Get time logs for specific work items
const workItemLogs = await mcpClient.callTool('read_time_logs', {
  workItemIds: [1234, 5678, 9012]
});
console.log(`Found ${workItemLogs.count} time logs for specified work items`);

// Combine filters: specific work items in a date range
const filteredLogs = await mcpClient.callTool('read_time_logs', {
  dateFrom: '2025-01-15',
  dateTo: '2025-01-20',
  workItemIds: [1234]
});
console.log(`Found ${filteredLogs.count} time logs for work item 1234 between Jan 15-20`);

// Calculate total time for a work item
const workItemTimeLogs = await mcpClient.callTool('read_time_logs', {
  workItemIds: [1234]
});
const totalMinutes = workItemTimeLogs.value.reduce((sum, log) => sum + log.minutes, 0);
const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
console.log(`Total time logged for work item 1234: ${totalHours} hours`);

// Generate weekly report
const weeklyReport = await mcpClient.callTool('read_time_logs', {
  dateWeek: '2025-W03'
});
const timeByType = weeklyReport.value.reduce((acc, log) => {
  acc[log.type] = (acc[log.type] || 0) + log.minutes;
  return acc;
}, {});
console.log('Time by work type:', timeByType);
```

### Implementation Details

The `read_time_logs` tool:

1. Establishes a connection to Azure DevOps using the provided credentials
2. Constructs query parameters based on the provided filters
3. Handles date parsing and validation for `dateFrom`, `dateTo`, and `dateWeek` parameters
4. Converts ISO week format (YYYY-Www) to appropriate date ranges when `dateWeek` is specified
5. Filters results by work item IDs if provided
6. Returns time logs for the current authenticated user by default
7. Handles errors and provides meaningful error messages

### Related Tools

- [`create_time_log`](#create_time_log): Create new time log entries
- [`get_work_item`](./work-items.md#get_work_item): Get details about work items referenced in time logs
- [`list_work_items`](./work-items.md#list_work_items): List work items to find IDs for time logging

### Common Use Cases

#### Weekly Time Tracking

```typescript
// Get current week's time logs
const currentWeek = new Date().toISOString().slice(0, 4) + '-W' + 
  String(Math.ceil((new Date().getDate()) / 7)).padStart(2, '0');
const weeklyLogs = await mcpClient.callTool('read_time_logs', {
  dateWeek: currentWeek
});
```

#### Project Time Analysis

```typescript
// Get all time logs for project work items
const projectWorkItems = [1001, 1002, 1003, 1004]; // Project work item IDs
const projectLogs = await mcpClient.callTool('read_time_logs', {
  workItemIds: projectWorkItems
});

// Calculate total project time
const totalProjectTime = projectLogs.value.reduce((sum, log) => sum + log.minutes, 0);
```

#### Monthly Reporting

```typescript
// Get previous month's time logs
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);
const monthStart = lastMonth.toISOString().slice(0, 8) + '01';
const monthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
  .toISOString().slice(0, 10);

const monthlyLogs = await mcpClient.callTool('read_time_logs', {
  dateFrom: monthStart,
  dateTo: monthEnd
});