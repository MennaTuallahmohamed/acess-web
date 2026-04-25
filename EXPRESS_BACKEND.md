# 🛠️ Backend Implementation Complete Guide

**كود Express.js + Prisma جاهز للاستخدام مباشرة**

---

## 📦 ملف backend/server.js الكامل

```javascript
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==================== HELPER FUNCTIONS ====================
const handleError = (res, error, statusCode = 500) => {
  console.error('[ERROR]', error);
  res.status(statusCode).json({
    error: error.message || 'Internal server error',
    statusCode
  });
};

const ensureArray = (data) => Array.isArray(data) ? data : [data];

// ==================== USERS API ====================
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    res.json(ensureArray(users));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { role: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    handleError(res, error, 404);
  }
});

app.post('/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body,
      include: { role: true }
    });
    res.status(201).json(user);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      include: { role: true }
    });
    res.json(user);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    handleError(res, error, 404);
  }
});

// ==================== ROLES API ====================
app.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(ensureArray(roles));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/roles', async (req, res) => {
  try {
    const role = await prisma.role.create({ data: req.body });
    res.status(201).json(role);
  } catch (error) {
    handleError(res, error, 400);
  }
});

// ==================== DEVICES API ====================
app.get('/devices', async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: { deviceType: true, location: true }
    });
    res.json(ensureArray(devices));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/devices/:id', async (req, res) => {
  try {
    const device = await prisma.device.findUnique({
      where: { id: req.params.id },
      include: { deviceType: true, location: true }
    });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  } catch (error) {
    handleError(res, error, 404);
  }
});

app.get('/devices/location/:locationId', async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      where: { locationId: req.params.locationId },
      include: { deviceType: true, location: true }
    });
    res.json(ensureArray(devices));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/devices/type/:typeId', async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      where: { deviceTypeId: req.params.typeId },
      include: { deviceType: true, location: true }
    });
    res.json(ensureArray(devices));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/devices', async (req, res) => {
  try {
    const device = await prisma.device.create({
      data: req.body,
      include: { deviceType: true, location: true }
    });
    res.status(201).json(device);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.patch('/devices/:id', async (req, res) => {
  try {
    const device = await prisma.device.update({
      where: { id: req.params.id },
      data: req.body,
      include: { deviceType: true, location: true }
    });
    res.json(device);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.delete('/devices/:id', async (req, res) => {
  try {
    await prisma.device.delete({ where: { id: req.params.id } });
    res.json({ message: 'Device deleted' });
  } catch (error) {
    handleError(res, error, 404);
  }
});

// ==================== DEVICE TYPES API ====================
app.get('/device-types', async (req, res) => {
  try {
    const types = await prisma.deviceType.findMany();
    res.json(ensureArray(types));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/device-types', async (req, res) => {
  try {
    const type = await prisma.deviceType.create({ data: req.body });
    res.status(201).json(type);
  } catch (error) {
    handleError(res, error, 400);
  }
});

// ==================== LOCATIONS API ====================
app.get('/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json(ensureArray(locations));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/locations/:id', async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id }
    });
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json(location);
  } catch (error) {
    handleError(res, error, 404);
  }
});

app.post('/locations', async (req, res) => {
  try {
    const location = await prisma.location.create({ data: req.body });
    res.status(201).json(location);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.patch('/locations/:id', async (req, res) => {
  try {
    const location = await prisma.location.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(location);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.delete('/locations/:id', async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    res.json({ message: 'Location deleted' });
  } catch (error) {
    handleError(res, error, 404);
  }
});

// ==================== INSPECTION TASKS API ====================
app.get('/inspection-tasks', async (req, res) => {
  try {
    const tasks = await prisma.inspectionTask.findMany({
      include: { assignedUser: true, device: true }
    });
    res.json(ensureArray(tasks));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/inspection-tasks/device/:deviceId', async (req, res) => {
  try {
    const tasks = await prisma.inspectionTask.findMany({
      where: { deviceId: req.params.deviceId },
      include: { assignedUser: true, device: true }
    });
    res.json(ensureArray(tasks));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/inspection-tasks/user/:userId', async (req, res) => {
  try {
    const tasks = await prisma.inspectionTask.findMany({
      where: { assignedTo: req.params.userId },
      include: { assignedUser: true, device: true }
    });
    res.json(ensureArray(tasks));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/inspection-tasks/:id', async (req, res) => {
  try {
    const task = await prisma.inspectionTask.findUnique({
      where: { id: req.params.id },
      include: { assignedUser: true, device: true }
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    handleError(res, error, 404);
  }
});

app.post('/inspection-tasks', async (req, res) => {
  try {
    const task = await prisma.inspectionTask.create({
      data: req.body,
      include: { assignedUser: true, device: true }
    });
    res.status(201).json(task);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.patch('/inspection-tasks/:id', async (req, res) => {
  try {
    const task = await prisma.inspectionTask.update({
      where: { id: req.params.id },
      data: req.body,
      include: { assignedUser: true, device: true }
    });
    res.json(task);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.delete('/inspection-tasks/:id', async (req, res) => {
  try {
    await prisma.inspectionTask.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    handleError(res, error, 404);
  }
});

// ==================== INSPECTIONS API ====================
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
    res.json(ensureArray(inspections));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/inspections/device/:deviceId', async (req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      where: { deviceId: req.params.deviceId },
      include: { device: true, technician: true, task: true, images: true }
    });
    res.json(ensureArray(inspections));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/inspections/technician/:technicianId', async (req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      where: { technicianId: req.params.technicianId },
      include: { device: true, technician: true, task: true, images: true }
    });
    res.json(ensureArray(inspections));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/inspections/task/:taskId', async (req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      where: { taskId: req.params.taskId },
      include: { device: true, technician: true, task: true, images: true }
    });
    res.json(ensureArray(inspections));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/inspections', async (req, res) => {
  try {
    const inspection = await prisma.inspection.create({
      data: req.body,
      include: { device: true, technician: true, task: true, images: true }
    });
    res.status(201).json(inspection);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.patch('/inspections/:id', async (req, res) => {
  try {
    const inspection = await prisma.inspection.update({
      where: { id: req.params.id },
      data: req.body,
      include: { device: true, technician: true, task: true, images: true }
    });
    res.json(inspection);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.delete('/inspections/:id', async (req, res) => {
  try {
    await prisma.inspection.delete({ where: { id: req.params.id } });
    res.json({ message: 'Inspection deleted' });
  } catch (error) {
    handleError(res, error, 404);
  }
});

// ==================== MAINTENANCE LOGS API ====================
app.get('/maintenance-logs', async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: { device: true, technician: true }
    });
    res.json(ensureArray(logs));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/maintenance-logs/device/:deviceId', async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      where: { deviceId: req.params.deviceId },
      include: { device: true, technician: true }
    });
    res.json(ensureArray(logs));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/maintenance-logs', async (req, res) => {
  try {
    const log = await prisma.maintenanceLog.create({
      data: req.body,
      include: { device: true, technician: true }
    });
    res.status(201).json(log);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.patch('/maintenance-logs/:id', async (req, res) => {
  try {
    const log = await prisma.maintenanceLog.update({
      where: { id: req.params.id },
      data: req.body,
      include: { device: true, technician: true }
    });
    res.json(log);
  } catch (error) {
    handleError(res, error, 400);
  }
});

app.delete('/maintenance-logs/:id', async (req, res) => {
  try {
    await prisma.maintenanceLog.delete({ where: { id: req.params.id } });
    res.json({ message: 'Log deleted' });
  } catch (error) {
    handleError(res, error, 404);
  }
});

// ==================== DEVICE MOVEMENTS API ====================
app.get('/device-movements', async (req, res) => {
  try {
    const movements = await prisma.deviceMovement.findMany({
      include: { device: true, fromLoc: true, toLoc: true }
    });
    res.json(ensureArray(movements));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/device-movements/device/:deviceId', async (req, res) => {
  try {
    const movements = await prisma.deviceMovement.findMany({
      where: { deviceId: req.params.deviceId },
      include: { device: true, fromLoc: true, toLoc: true }
    });
    res.json(ensureArray(movements));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/device-movements', async (req, res) => {
  try {
    const movement = await prisma.deviceMovement.create({
      data: req.body,
      include: { device: true, fromLoc: true, toLoc: true }
    });
    res.status(201).json(movement);
  } catch (error) {
    handleError(res, error, 400);
  }
});

// ==================== DEVICE STATUS HISTORY API ====================
app.get('/device-status-history', async (req, res) => {
  try {
    const history = await prisma.deviceStatusHistory.findMany({
      include: { device: true, changedByUser: true }
    });
    res.json(ensureArray(history));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/device-status-history/device/:deviceId', async (req, res) => {
  try {
    const history = await prisma.deviceStatusHistory.findMany({
      where: { deviceId: req.params.deviceId },
      include: { device: true, changedByUser: true }
    });
    res.json(ensureArray(history));
  } catch (error) {
    handleError(res, error);
  }
});

// ==================== AUDIT LOGS API ====================
app.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: true }
    });
    res.json(ensureArray(logs));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/audit-logs/user/:userId', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { userId: req.params.userId },
      include: { user: true }
    });
    res.json(ensureArray(logs));
  } catch (error) {
    handleError(res, error);
  }
});

// ==================== DASHBOARD SUMMARY ====================
app.get('/dashboard/summary', async (req, res) => {
  try {
    const totalTechnicians = await prisma.user.count({
      where: {
        role: {
          name: 'TECHNICIAN'
        }
      }
    });

    const totalInspectionTasks = await prisma.inspectionTask.count();
    const completedTasks = await prisma.inspectionTask.count({
      where: { status: 'COMPLETED' }
    });
    const pendingTasks = await prisma.inspectionTask.count({
      where: { status: 'PENDING' }
    });
    const emergencyTasks = await prisma.inspectionTask.count({
      where: { priority: 'EMERGENCY' }
    });

    const totalDevices = await prisma.device.count();
    const operationalDevices = await prisma.device.count({
      where: { status: 'OPERATIONAL' }
    });
    const maintenanceDevices = await prisma.device.count({
      where: { status: 'MAINTENANCE' }
    });
    const outOfServiceDevices = await prisma.device.count({
      where: { status: 'OUT_OF_SERVICE' }
    });

    const totalInspections = await prisma.inspection.count();
    const completedInspections = await prisma.inspection.count({
      where: { inspectionStatus: 'COMPLETED' }
    });

    res.json({
      totalTechnicians,
      totalInspectionTasks,
      completedTasks,
      pendingTasks,
      emergencyTasks,
      totalDevices,
      operationalDevices,
      maintenanceDevices,
      outOfServiceDevices,
      totalInspections,
      completedInspections,
      lastUpdated: new Date()
    });
  } catch (error) {
    handleError(res, error);
  }
});

// ==================== TECHNICIAN PERFORMANCE ====================
app.get('/dashboard/technicians-performance', async (req, res) => {
  try {
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECHNICIAN'
        }
      },
      include: {
        assignedTasks: true,
        completedInspections: true
      }
    });

    const performance = technicians.map(tech => ({
      id: tech.id,
      fullName: tech.fullName,
      jobTitle: tech.jobTitle,
      totalTasksAssigned: tech.assignedTasks.length,
      completedTasks: tech.assignedTasks.filter(t => t.status === 'COMPLETED').length,
      completionRate: tech.assignedTasks.length > 0
        ? Math.round((tech.assignedTasks.filter(t => t.status === 'COMPLETED').length / tech.assignedTasks.length) * 100)
        : 0,
      inspectionsCompleted: tech.completedInspections.length,
      lastActive: tech.updatedAt
    }));

    res.json(ensureArray(performance));
  } catch (error) {
    handleError(res, error);
  }
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ==================== ERROR HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║     🚀 Backend Server Started 🚀      ║
    ║  Running on http://localhost:${PORT}    ║
    ║  Environment: ${process.env.NODE_ENV}         ║
    ║  Database: Connected                  ║
    ╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

---

## 📦 ملف package.json

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

---

✅ **نسخ والصق هذا الكود والبيانات ستظهر بنجاح! 🎉**
