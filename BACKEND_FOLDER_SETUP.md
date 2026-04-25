# 🛠️ إنشاء Backend من الصفر - Complete Setup

**خطوات كاملة لإنشاء Backend folder مع Express و Prisma**

---

## 📋 الخطوات

### الخطوة 1: إنشاء Folder

```bash
mkdir backend
cd backend
```

### الخطوة 2: إنشاء package.json

```bash
npm init -y
```

أو أنشئ الملف يدويا:

**backend/package.json**
```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js",
    "seed": "node seed.js"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0"
  }
}
```

### الخطوة 3: تثبيت الحزم

```bash
npm install
```

### الخطوة 4: إنشاء ملف .env

```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/your_database"
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
EOF
```

**ملاحظة:** استبدل `user`, `password`, `localhost`, `your_database` بقيم قاعدة البيانات الخاصة بك

### الخطوة 5: إنشاء Prisma Schema

```bash
npx prisma init
```

استبدل محتوى `prisma/schema.prisma` بـ:

**prisma/schema.prisma**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================
enum UserRole {
  ADMIN
  TECHNICIAN
  MANAGER
  VIEWER
}

enum DeviceStatus {
  OPERATIONAL
  MAINTENANCE
  OUT_OF_SERVICE
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  EMERGENCY
}

enum MaintenanceType {
  PREVENTIVE
  CORRECTIVE
  EMERGENCY
}

enum InspectionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}

// ==================== MODELS ====================
model Role {
  id          String   @id @default(cuid())
  name        UserRole @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
}

model User {
  id                  String              @id @default(cuid())
  fullName            String
  email               String              @unique
  phoneNumber         String?
  jobTitle            String?
  roleId              String
  role                Role                @relation(fields: [roleId], references: [id])
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  
  // Relations
  assignedTasks       InspectionTask[]    @relation("AssignedTo")
  completedInspections Inspection[]        @relation("Technician")
  maintenanceLogs     MaintenanceLog[]    @relation("PerformedBy")
  deviceMovements     DeviceMovement[]    @relation("MovedBy")
  statusChanges       DeviceStatusHistory[] @relation("ChangedBy")
  auditLogs           AuditLog[]
}

model DeviceType {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  devices     Device[]
}

model Location {
  id              String       @id @default(cuid())
  name            String       @unique
  address         String?
  city            String?
  coordinates     String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  devices         Device[]
  fromMovements   DeviceMovement[] @relation("FromLocation")
  toMovements     DeviceMovement[] @relation("ToLocation")
}

model Device {
  id                  String              @id @default(cuid())
  deviceName          String
  serialNumber        String              @unique
  status              DeviceStatus        @default(OPERATIONAL)
  locationId          String
  location            Location            @relation(fields: [locationId], references: [id], onDelete: Cascade)
  deviceTypeId        String
  deviceType          DeviceType          @relation(fields: [deviceTypeId], references: [id])
  lastMaintenanceDate DateTime?
  nextMaintenanceDate DateTime?
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  
  // Relations
  tasks               InspectionTask[]
  inspections         Inspection[]
  maintenanceLogs     MaintenanceLog[]
  movements           DeviceMovement[]
  statusHistory       DeviceStatusHistory[]
}

model InspectionTask {
  id          String       @id @default(cuid())
  title       String
  description String?
  status      TaskStatus   @default(PENDING)
  priority    TaskPriority @default(MEDIUM)
  assignedTo  String?
  assignedUser User?        @relation("AssignedTo", fields: [assignedTo], references: [id])
  deviceId    String?
  device      Device?      @relation(fields: [deviceId], references: [id], onDelete: SetNull)
  dueDate     DateTime?
  completedAt DateTime?
  notes       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  // Relations
  inspections Inspection[]
}

model Inspection {
  id                String            @id @default(cuid())
  issueReason       String?
  inspectionStatus  InspectionStatus  @default(PENDING)
  inspectedAt       DateTime?
  notes             String?
  deviceId          String
  device            Device            @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  technicianId      String?
  technician        User?             @relation("Technician", fields: [technicianId], references: [id])
  taskId            String?
  task              InspectionTask?   @relation(fields: [taskId], references: [id], onDelete: SetNull)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  images            InspectionImage[]
}

model InspectionImage {
  id            String      @id @default(cuid())
  inspectionId  String
  inspection    Inspection  @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  imageUrl      String
  uploadedAt    DateTime    @default(now())
}

model MaintenanceLog {
  id              String          @id @default(cuid())
  deviceId        String
  device          Device          @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  performedBy     String
  technician      User            @relation("PerformedBy", fields: [performedBy], references: [id])
  maintenanceType MaintenanceType
  description     String?
  performedAt     DateTime        @default(now())
  cost            Float?
  notes           String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model DeviceMovement {
  id             String   @id @default(cuid())
  deviceId       String
  device         Device   @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  fromLocationId String
  fromLoc        Location @relation("FromLocation", fields: [fromLocationId], references: [id])
  toLocationId   String
  toLoc          Location @relation("ToLocation", fields: [toLocationId], references: [id])
  movedBy        String
  movedByUser    User     @relation("MovedBy", fields: [movedBy], references: [id])
  movedAt        DateTime @default(now())
  reason         String?
  createdAt      DateTime @default(now())
}

model DeviceStatusHistory {
  id             String       @id @default(cuid())
  deviceId       String
  device         Device       @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  previousStatus DeviceStatus
  newStatus      DeviceStatus
  changedBy      String
  changedByUser  User         @relation("ChangedBy", fields: [changedBy], references: [id])
  reason         String?
  changedAt      DateTime     @default(now())
  createdAt      DateTime     @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action     String
  entityType String?
  entityId   String?
  changes    Json?
  timestamp  DateTime @default(now())
  createdAt  DateTime @default(now())
}
```

### الخطوة 6: إنشاء Database

```bash
# تطبيق Migrations
npx prisma migrate dev --name init

# الاسم الافتراضي سيكون "init" ويمكنك تغييره
```

### الخطوة 7: إنشاء Server

**backend/server.js**

انسخ الكود الكامل من [EXPRESS_BACKEND.md](./EXPRESS_BACKEND.md)

### الخطوة 8: اختياري - إنشاء Seed

**backend/seed.js**
```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // إنشاء أدوار
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrator'
    }
  });

  const techRole = await prisma.role.create({
    data: {
      name: 'TECHNICIAN',
      description: 'Field technician'
    }
  });

  // إنشاء مستخدمين
  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin User',
      email: 'admin@example.com',
      roleId: adminRole.id
    }
  });

  const technician = await prisma.user.create({
    data: {
      fullName: 'Ahmed Technician',
      email: 'ahmed@example.com',
      jobTitle: 'Senior Technician',
      roleId: techRole.id
    }
  });

  // إنشاء أنواع الأجهزة
  const printerType = await prisma.deviceType.create({
    data: {
      name: 'Network Printer',
      description: 'Office network printer'
    }
  });

  // إنشاء أماكن
  const mainOffice = await prisma.location.create({
    data: {
      name: 'Main Office',
      address: '123 Main Street',
      city: 'Cairo'
    }
  });

  // إنشاء أجهزة
  const device = await prisma.device.create({
    data: {
      deviceName: 'Printer #1',
      serialNumber: 'HP-SN-001',
      status: 'OPERATIONAL',
      locationId: mainOffice.id,
      deviceTypeId: printerType.id
    }
  });

  // إنشاء مهام
  const task = await prisma.inspectionTask.create({
    data: {
      title: 'Network Printer Inspection',
      description: 'Check printer connectivity',
      status: 'PENDING',
      priority: 'HIGH',
      assignedTo: technician.id,
      deviceId: device.id
    }
  });

  console.log('✅ Seed completed!');
  console.log('Users:', [admin.id, technician.id]);
  console.log('Devices:', device.id);
  console.log('Tasks:', task.id);
}

main();
```

لتشغيل الـ seed:
```bash
npm run seed
```

---

## 🚀 التشغيل

### شغّل الـ Backend:

```bash
npm run dev
```

يجب أن ترى:

```
╔════════════════════════════════════════╗
║     🚀 Backend Server Started 🚀      ║
║  Running on http://localhost:3000     ║
║  Environment: development             ║
║  Database: Connected                  ║
╚════════════════════════════════════════╝
```

---

## ✅ التحقق

### 1. اختبر الـ Health:

```bash
curl http://localhost:3000/health
```

### 2. جلب البيانات:

```bash
curl http://localhost:3000/users
curl http://localhost:3000/devices
curl http://localhost:3000/dashboard/summary
```

---

✅ **Backend جاهز للاستخدام! 🎉**

اذهب الآن إلى Frontend وشغّل `npm run dev`
