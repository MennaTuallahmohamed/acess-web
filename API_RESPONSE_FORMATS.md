# 📡 API Response Formats

**تحديد صيغ الـ API Responses التي يتوقعها Frontend من Prisma Backend**

---

## ✅ Format القياسي لـ Endpoints

### 1️⃣ GET Endpoints (جلب البيانات)

**Format:**
```json
[
  { "id": "1", "name": "Ahmed", ... },
  { "id": "2", "name": "Sara", ... }
]
```

أو مع relationships:
```json
[
  {
    "id": "1",
    "name": "Printer #1",
    "location": {
      "id": "loc-1",
      "name": "Main Office"
    },
    "deviceType": {
      "id": "type-1",
      "name": "Network Printer"
    }
  }
]
```

---

## 📋 Detailed Response Formats

### Users Endpoint
**GET /users**
```json
[
  {
    "id": "user-1",
    "fullName": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "phoneNumber": "0123456789",
    "jobTitle": "Senior Technician",
    "roleId": "role-1",
    "role": {
      "id": "role-1",
      "name": "TECHNICIAN",
      "description": "Field technician"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "user-2",
    "fullName": "Sara Mohamed",
    "email": "sara@example.com",
    "phoneNumber": "0987654321",
    "jobTitle": "Junior Technician",
    "roleId": "role-1",
    "role": { ... },
    "createdAt": "2024-01-16T10:30:00Z",
    "updatedAt": "2024-01-16T10:30:00Z"
  }
]
```

### Devices Endpoint
**GET /devices**
```json
[
  {
    "id": "device-1",
    "deviceName": "Printer Main Office",
    "serialNumber": "HP-SN-001",
    "status": "OPERATIONAL",
    "locationId": "loc-1",
    "location": {
      "id": "loc-1",
      "name": "Main Office",
      "address": "123 Main Street"
    },
    "deviceTypeId": "type-1",
    "deviceType": {
      "id": "type-1",
      "name": "Network Printer"
    },
    "lastMaintenanceDate": "2024-01-10T00:00:00Z",
    "nextMaintenanceDate": "2024-02-10T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "device-2",
    "deviceName": "Scanner Floor 2",
    "serialNumber": "SC-SN-002",
    "status": "MAINTENANCE",
    "locationId": "loc-2",
    "location": { ... },
    "deviceTypeId": "type-2",
    "deviceType": { ... },
    "lastMaintenanceDate": "2024-01-01T00:00:00Z",
    "nextMaintenanceDate": "2024-01-31T00:00:00Z",
    "createdAt": "2024-01-05T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Inspections Endpoint
**GET /inspections**
```json
[
  {
    "id": "insp-1",
    "issueReason": "Device not responding",
    "inspectionStatus": "COMPLETED",
    "inspectedAt": "2024-01-15T14:30:00Z",
    "notes": "Fixed network connection. Device operational now.",
    "deviceId": "device-1",
    "device": {
      "id": "device-1",
      "deviceName": "Printer Main Office"
    },
    "technicianId": "user-1",
    "technician": {
      "id": "user-1",
      "fullName": "Ahmed Hassan"
    },
    "taskId": "task-1",
    "task": {
      "id": "task-1",
      "title": "Network Printer Inspection"
    },
    "images": [
      {
        "id": "img-1",
        "imageUrl": "https://storage.example.com/images/001.jpg",
        "uploadedAt": "2024-01-15T14:30:00Z"
      }
    ],
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  },
  {
    "id": "insp-2",
    "issueReason": "Routine maintenance",
    "inspectionStatus": "PENDING",
    "inspectedAt": null,
    "notes": null,
    "deviceId": "device-2",
    "device": { ... },
    "technicianId": null,
    "technician": null,
    "taskId": "task-2",
    "task": { ... },
    "images": [],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### Inspection Tasks Endpoint
**GET /inspection-tasks**
```json
[
  {
    "id": "task-1",
    "title": "Network Printer Inspection",
    "description": "Check printer connectivity and functionality",
    "status": "COMPLETED",
    "priority": "HIGH",
    "assignedTo": "user-1",
    "assignedUser": {
      "id": "user-1",
      "fullName": "Ahmed Hassan"
    },
    "deviceId": "device-1",
    "device": {
      "id": "device-1",
      "deviceName": "Printer Main Office"
    },
    "dueDate": "2024-01-20T23:59:59Z",
    "completedAt": "2024-01-15T14:30:00Z",
    "notes": "Device working properly",
    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  },
  {
    "id": "task-2",
    "title": "Scanner Maintenance",
    "description": "Perform routine maintenance on scanner",
    "status": "PENDING",
    "priority": "MEDIUM",
    "assignedTo": "user-2",
    "assignedUser": { ... },
    "deviceId": "device-2",
    "device": { ... },
    "dueDate": "2024-01-25T23:59:59Z",
    "completedAt": null,
    "notes": null,
    "createdAt": "2024-01-12T00:00:00Z",
    "updatedAt": "2024-01-12T00:00:00Z"
  }
]
```

### Locations Endpoint
**GET /locations**
```json
[
  {
    "id": "loc-1",
    "name": "Main Office",
    "address": "123 Main Street",
    "city": "Cairo",
    "coordinates": "30.0444°N, 31.2357°E",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "loc-2",
    "name": "Branch Office",
    "address": "456 Branch Avenue",
    "city": "Giza",
    "coordinates": "29.9961°N, 31.1290°E",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Maintenance Logs Endpoint
**GET /maintenance-logs**
```json
[
  {
    "id": "log-1",
    "deviceId": "device-1",
    "device": { ... },
    "performedBy": "user-1",
    "technician": { ... },
    "maintenanceType": "PREVENTIVE",
    "description": "Replaced toner cartridge",
    "performedAt": "2024-01-15T10:00:00Z",
    "cost": 250,
    "notes": "Device working at 100%",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### Device Status History Endpoint
**GET /device-status-history**
```json
[
  {
    "id": "hist-1",
    "deviceId": "device-1",
    "previousStatus": "OPERATIONAL",
    "newStatus": "MAINTENANCE",
    "changedBy": "user-1",
    "reason": "Scheduled maintenance",
    "changedAt": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### Device Movements Endpoint
**GET /device-movements**
```json
[
  {
    "id": "move-1",
    "deviceId": "device-1",
    "device": { ... },
    "fromLocation": "loc-1",
    "toLocation": "loc-2",
    "movedBy": "user-1",
    "movedAt": "2024-01-15T10:00:00Z",
    "reason": "Transferred to new office",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### Audit Logs Endpoint
**GET /audit-logs**
```json
[
  {
    "id": "audit-1",
    "userId": "user-1",
    "user": { ... },
    "action": "CREATED_INSPECTION",
    "entityType": "Inspection",
    "entityId": "insp-1",
    "changes": {
      "status": ["PENDING", "COMPLETED"]
    },
    "timestamp": "2024-01-15T14:30:00Z",
    "createdAt": "2024-01-15T14:30:00Z"
  }
]
```

### Dashboard Summary Endpoint
**GET /dashboard/summary**
```json
{
  "totalTechnicians": 15,
  "totalInspectionTasks": 120,
  "completedTasks": 85,
  "pendingTasks": 25,
  "emergencyTasks": 10,
  "totalDevices": 50,
  "operationalDevices": 45,
  "maintenanceDevices": 4,
  "outOfServiceDevices": 1,
  "needsMaintenanceDevices": 5,
  "totalInspections": 200,
  "completedInspections": 180,
  "pendingInspections": 20,
  "lastUpdated": "2024-01-15T14:30:00Z"
}
```

### Technician Performance Endpoint
**GET /dashboard/technicians-performance**
```json
[
  {
    "id": "user-1",
    "fullName": "Ahmed Hassan",
    "jobTitle": "Senior Technician",
    "totalTasksAssigned": 45,
    "completedTasks": 42,
    "completionRate": 93.3,
    "averageCompletionTime": "2.5 hours",
    "inspectionsCompleted": 50,
    "lastActive": "2024-01-15T14:30:00Z"
  },
  {
    "id": "user-2",
    "fullName": "Sara Mohamed",
    "jobTitle": "Junior Technician",
    "totalTasksAssigned": 30,
    "completedTasks": 28,
    "completionRate": 93.3,
    "averageCompletionTime": "3.0 hours",
    "inspectionsCompleted": 32,
    "lastActive": "2024-01-15T10:00:00Z"
  }
]
```

---

## 🔄 Filtered/Query Endpoints

### Get Devices by Location
**GET /devices/location/:locationId**
```json
[
  { "id": "device-1", ... },
  { "id": "device-2", ... }
]
```

### Get Tasks by User
**GET /inspection-tasks/user/:userId**
```json
[
  { "id": "task-1", ... },
  { "id": "task-3", ... }
]
```

### Get Inspections by Device
**GET /inspections/device/:deviceId**
```json
[
  { "id": "insp-1", ... },
  { "id": "insp-5", ... }
]
```

---

## ❌ Error Response Format

```json
{
  "error": "Not found",
  "message": "Device with id 'invalid' not found",
  "statusCode": 404
}
```

---

## ✅ Success POST/PATCH Responses

```json
{
  "id": "created-entity-id",
  "name": "New Entity",
  "status": "Created successfully",
  "createdAt": "2024-01-15T14:30:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

---

✅ **هذه الصيغ يجب أن يتبعها Backend حتى يعمل Frontend بشكل صحيح!**
