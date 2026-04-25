# 🔧 Backend Setup Guide - Prisma Integration

**الهدف:** ضمان أن جميع البيانات تظهر من قاعدة البيانات إلى Dashboard

---

## ⚙️ المتطلبات الأساسية

### 1. تثبيت Prisma و المكتبات المطلوبة

```bash
npm install @prisma/client prisma
npm install cors dotenv express
npm install bcryptjs
```

### 2. ملف `.env` للـ Backend

```env
# DATABASE
DATABASE_URL="postgresql://user:password@localhost:5432/your_database"

# API
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT (Optional)
JWT_SECRET=your_secret_key_here
```

---

## 📋 الـ Endpoints المطلوبة

### ✅ Users (المستخدمون)
```
GET    /users                  → جلب جميع المستخدمين
POST   /users                  → إنشاء مستخدم جديد
PATCH  /users/:id              → تعديل مستخدم
DELETE /users/:id              → حذف مستخدم
```

### ✅ Roles (الأدوار)
```
GET    /roles                  → جلب جميع الأدوار
POST   /roles                  → إنشاء دور جديد
PATCH  /roles/:id              → تعديل دور
```

### ✅ Devices (الأجهزة)
```
GET    /devices                → جلب جميع الأجهزة
GET    /devices/location/:id   → الأجهزة في الموقع
GET    /devices/type/:id       → الأجهزة من النوع
POST   /devices                → إنشاء جهاز
PATCH  /devices/:id            → تعديل جهاز
DELETE /devices/:id            → حذف جهاز
```

### ✅ Device Types (أنواع الأجهزة)
```
GET    /device-types           → جلب جميع الأنواع
POST   /device-types           → إنشاء نوع جديد
PATCH  /device-types/:id       → تعديل النوع
```

### ✅ Locations (الموقع)
```
GET    /locations              → جلب جميع الأماكن
POST   /locations              → إنشاء مكان جديد
PATCH  /locations/:id          → تعديل المكان
DELETE /locations/:id          → حذف المكان
```

### ✅ Inspection Tasks (مهام الفحص)
```
GET    /inspection-tasks                    → جلب جميع المهام
GET    /inspection-tasks/device/:id         → المهام للجهاز
GET    /inspection-tasks/user/:id           → مهام المستخدم
POST   /inspection-tasks                    → إنشاء مهمة جديدة
PATCH  /inspection-tasks/:id                → تعديل المهمة
DELETE /inspection-tasks/:id                → حذف المهمة
```

### ✅ Inspections (الفحوصات)
```
GET    /inspections                         → جلب جميع الفحوصات
GET    /inspections/device/:id              → الفحوصات للجهاز
GET    /inspections/technician/:id          → فحوصات الفني
GET    /inspections/task/:id                → الفحوصات للمهمة
POST   /inspections                         → إنشاء فحص جديد
PATCH  /inspections/:id                     → تعديل الفحص
DELETE /inspections/:id                     → حذف الفحص
```

### ✅ Inspection Images (صور الفحص)
```
GET    /inspection-images/inspection/:id    → صور الفحص
POST   /inspection-images                   → إضافة صورة
DELETE /inspection-images/:id               → حذف الصورة
```

### ✅ Maintenance Logs (سجلات الصيانة)
```
GET    /maintenance-logs                    → جلب جميع السجلات
GET    /maintenance-logs/device/:id         → السجلات للجهاز
POST   /maintenance-logs                    → إنشاء سجل جديد
PATCH  /maintenance-logs/:id                → تعديل السجل
DELETE /maintenance-logs/:id                → حذف السجل
```

### ✅ Device Movements (حركة الأجهزة)
```
GET    /device-movements                    → جلب جميع الحركات
GET    /device-movements/device/:id         → حركات الجهاز
POST   /device-movements                    → إنشاء حركة جديدة
```

### ✅ Device Status History (سجل حالة الجهاز)
```
GET    /device-status-history               → جلب جميع السجلات
GET    /device-status-history/device/:id    → سجلات الجهاز
```

### ✅ Audit Logs (سجلات التدقيق)
```
GET    /audit-logs                          → جلب جميع السجلات
GET    /audit-logs/user/:id                 → سجلات المستخدم
```

### ✅ Dashboard Summary
```
GET    /dashboard/summary      → ملخص الـ Dashboard (إحصائيات عامة)
GET    /dashboard/technicians-performance   → أداء الفنيين
```

---

## 📝 مثال على كود Backend (Express + Prisma)

### 1. إعداد الـ Server

**backend/server.js**
```javascript
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ================== USERS ==================
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================== DEVICES ==================
app.get('/devices', async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: { deviceType: true, location: true }
    });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/devices/location/:id', async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      where: { locationId: req.params.id },
      include: { deviceType: true, location: true }
    });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== INSPECTIONS ==================
app.get('/inspections', async (req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      include: {
        device: true,
        technician: true,
        task: true,
        images: true
      }
    });
    res.json(inspections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== DASHBOARD SUMMARY ==================
app.get('/dashboard/summary', async (req, res) => {
  try {
    const totalTechnicians = await prisma.user.count({
      where: { role: { name: 'TECHNICIAN' } }
    });

    const totalInspectionTasks = await prisma.inspectionTask.count();
    const completedTasks = await prisma.inspectionTask.count({
      where: { status: 'COMPLETED' }
    });
    const pendingTasks = await prisma.inspectionTask.count({
      where: { status: 'PENDING' }
    });

    const totalDevices = await prisma.device.count();
    const needsMaintenanceDevices = await prisma.device.count({
      where: { status: 'MAINTENANCE' }
    });

    res.json({
      totalTechnicians,
      totalInspectionTasks,
      completedTasks,
      pendingTasks,
      totalDevices,
      needsMaintenanceDevices
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
```

---

## 🚀 خطوات التشغيل

### 1. تشغيل الـ Backend
```bash
cd backend
npm install
npm run dev
```

### 2. تشغيل الـ Frontend
```bash
cd dashboard-react
npm run dev
```

### 3. التحقق من الاتصال
- افتح `http://localhost:5173`
- يجب أن ترى جميع البيانات تظهر من الـ API

---

## 🔍 التحقق من البيانات

### في الـ Browser Console:
```javascript
// اختبر جلب البيانات
fetch('http://localhost:3000/users')
  .then(r => r.json())
  .then(data => console.log('Users:', data))

fetch('http://localhost:3000/devices')
  .then(r => r.json())
  .then(data => console.log('Devices:', data))

fetch('http://localhost:3000/inspections')
  .then(r => r.json())
  .then(data => console.log('Inspections:', data))
```

---

## ⚡ تصحيح الأخطاء الشائعة

### ❌ "Connection refused"
- تحقق من تشغيل الـ Backend على `localhost:3000`
- تحقق من `VITE_API_BASE_URL` في `.env`

### ❌ "No data appears"
- تحقق من أن الـ API يعيد بيانات (استخدم `curl` أو Postman)
- تأكد من أن قاعدة البيانات تحتوي على بيانات

### ❌ "CORS error"
- تحقق من أن `CORS_ORIGIN` يطابق Frontend URL
- أضف headers CORS صحيحة

---

## 📊 بيانات العينة

لإدراج بيانات تجريبية:

**backend/seed.js**
```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // إنشاء أدوار
  const techRole = await prisma.role.create({
    data: { name: 'TECHNICIAN', description: 'Field technician' }
  });

  // إنشاء مستخدمين
  await prisma.user.create({
    data: {
      fullName: 'Ahmed Technician',
      email: 'ahmed@example.com',
      roleId: techRole.id
    }
  });

  // إنشاء أماكن
  const location = await prisma.location.create({
    data: {
      name: 'Main Office',
      address: '123 Main St'
    }
  });

  // إنشاء أنواع أجهزة
  const deviceType = await prisma.deviceType.create({
    data: { name: 'Printer', description: 'Network Printer' }
  });

  // إنشاء أجهزة
  await prisma.device.create({
    data: {
      deviceName: 'Printer #1',
      serialNumber: 'SN001',
      locationId: location.id,
      deviceTypeId: deviceType.id,
      status: 'OPERATIONAL'
    }
  });

  console.log('✅ Seed data created!');
}

main();
```

---

✅ **بعد تطبيق هذه الخطوات، جميع البيانات ستظهر في Dashboard!**
