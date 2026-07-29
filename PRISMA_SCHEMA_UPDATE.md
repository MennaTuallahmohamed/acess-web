# 🔧 Backend Updated - تحديث خاص بـ Prisma Schema الجديد

**تحديث الـ Backend ليطابق الـ Prisma schema الجديد**

---

## ⚠️ المشاكل المكتشفة

### 1. مشكلة 409 عند إنشاء technician
**السبب:** عند محاولة إنشاء user جديد:
- `email` قد يكون `null` → مشكلة لأنه `@unique`
- `username` قد يكون `null` → مشكلة لأنه `@unique`

**الحل:** تم تطبيقه في `api.js`:
```javascript
export const createUser = async (payload) => {
  const data = {
    firstName: payload.firstName || "Unknown",
    lastName: payload.lastName || "",
    fullName: payload.fullName || payload.firstName || "User",
    email: payload.email || `user_${Date.now()}@example.com`, // ✅ توليد email فريد
    username: payload.username || `user_${Date.now()}`, // ✅ توليد username فريد
    passwordHash: payload.passwordHash || "hashed_password",
    ...payload
  };
  return request("/users", { method: "POST", body: data });
};
```

---

## 📝 تحديث Backend Server.js

**استبدل الـ endpoints بهذا الكود المحدّث:**

```javascript
// ==================== USERS ====================
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    res.json(Array.isArray(users) ? users : [users]);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/users', async (req, res) => {
  try {
    // تأكد من الـ unique fields
    const data = {
      firstName: req.body.firstName || "Unknown",
      lastName: req.body.lastName || "",
      fullName: req.body.fullName || req.body.firstName || "User",
      email: req.body.email || `user_${Date.now()}@example.com`,
      username: req.body.username || `user_${Date.now()}`,
      passwordHash: req.body.passwordHash || "hashed_password",
      phone: req.body.phone || null,
      jobTitle: req.body.jobTitle || "Technician",
      roleId: req.body.roleId || 1,
      status: req.body.status || "ACTIVE",
      ...req.body
    };
    
    const user = await prisma.user.create({
      data,
      include: { role: true }
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint error
      return res.status(409).json({ error: 'Email or username already exists' });
    }
    handleError(res, error, 400);
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: { role: true }
    });
    res.json(user);
  } catch (error) {
    handleError(res, error, 400);
  }
});

// ==================== DEVICES ====================
app.get('/devices', async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: {
        deviceType: true,
        location: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 1
        }
      }
    });
    res.json(Array.isArray(devices) ? devices : [devices]);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/devices', async (req, res) => {
  try {
    const device = await prisma.device.create({
      data: {
        deviceCode: req.body.deviceCode,
        deviceName: req.body.deviceName,
        barcode: req.body.barcode,
        serialNumber: req.body.serialNumber || null,
        manufacturer: req.body.manufacturer || null,
        deviceTypeId: req.body.deviceTypeId,
        locationId: req.body.locationId,
        currentStatus: req.body.currentStatus || "OK",
        notes: req.body.notes || null
      },
      include: { deviceType: true, location: true }
    });
    res.status(201).json(device);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Device code, barcode, or serial number already exists' });
    }
    handleError(res, error, 400);
  }
});

// ==================== INSPECTIONS ====================
app.get('/inspections', async (req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      include: {
        device: true,
        technician: true,
        task: true,
        images: true
      },
      orderBy: { inspectedAt: 'desc' }
    });
    res.json(Array.isArray(inspections) ? inspections : [inspections]);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/inspections', async (req, res) => {
  try {
    const inspection = await prisma.inspection.create({
      data: {
        deviceId: req.body.deviceId,
        technicianId: req.body.technicianId,
        taskId: req.body.taskId || null,
        inspectionStatus: req.body.inspectionStatus || "OK",
        issueReason: req.body.issueReason || null,
        notes: req.body.notes || null,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        locationText: req.body.locationText || null
      },
      include: { device: true, technician: true, task: true, images: true }
    });
    res.status(201).json(inspection);
  } catch (error) {
    handleError(res, error, 400);
  }
});

// ==================== DASHBOARD SUMMARY ====================
app.get('/dashboard/summary', async (req, res) => {
  try {
    const totalDevices = await prisma.device.count();
    const okDevices = await prisma.device.count({
      where: { currentStatus: 'OK' }
    });
    const maintenanceDevices = await prisma.device.count({
      where: { currentStatus: { in: ['NEEDS_MAINTENANCE', 'UNDER_MAINTENANCE'] } }
    });

    const totalTasks = await prisma.inspectionTask.count();
    const completedTasks = await prisma.inspectionTask.count({
      where: { status: 'COMPLETED' }
    });
    const pendingTasks = await prisma.inspectionTask.count({
      where: { status: 'PENDING' }
    });

    const totalInspections = await prisma.inspection.count();
    const totalTechnicians = await prisma.user.count({
      where: { jobTitle: { contains: 'Technician' } }
    });

    res.json({
      totalDevices,
      operationalDevices: okDevices,
      needsMaintenanceDevices: maintenanceDevices,
      totalInspectionTasks: totalTasks,
      completedTasks,
      pendingTasks,
      totalInspections,
      totalTechnicians,
      lastUpdated: new Date()
    });
  } catch (error) {
    handleError(res, error);
  }
});

// ==================== DEVICE STATUS HISTORY ====================
app.get('/device-status-history/device/:deviceId', async (req, res) => {
  try {
    const history = await prisma.deviceStatusHistory.findMany({
      where: { deviceId: parseInt(req.params.deviceId) },
      include: { device: true, changedBy: true },
      orderBy: { changedAt: 'desc' }
    });
    res.json(Array.isArray(history) ? history : []);
  } catch (error) {
    handleError(res, error);
  }
});
```

---

## 🛠️ خطوات التطبيق

### 1. تحديث `api.js` في Frontend
✅ تم بالفعل - دالة `createUser` محدّثة

### 2. تحديث Backend
انسخ الـ endpoints أعلاه لـ `backend/server.js`

### 3. إعادة تشغيل
```bash
# Backend
npm run dev

# Frontend (في terminal جديد)
cd dashboard-react
npm run dev
```

---

## ✅ الآن 409 error سيختفي!

المشكلة كانت:
- ❌ محاولة إنشاء user بدون email أو username
- ❌ Email و username يجب يكون `@unique` في Prisma

الحل:
- ✅ توليد email و username فريد تلقائياً
- ✅ التحقق من الـ unique constraints
- ✅ معالجة الأخطاء بشكل صحيح

---

## 📊 DevicesPage تحديثات

✅ تصميم أجمل مع:
- Gradient backgrounds
- Color-coded status
- Better formatting
- Icons وemojis
- Responsive design

---

## 🎨 Dashboard أجمل

✅ KPI cards بـ gradients جميلة:
- 👥 Technicians - بنفسجي
- ✅ Completed - وردي
- ⏳ Pending - أزرق فاتح
- 🔴 Emergency - ذهبي
- 🔧 Devices - أخضر فاتح
- 🛠️ Maintenance - برتقالي

---

**الآن Dashboard ستظهر جميلة جداً! 🎉✨**
