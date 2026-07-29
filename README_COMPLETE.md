# 📊 Access Dashboard - Complete Documentation

**Dashboard احترافي لإدارة الأجهزة والفحوصات والفنيين مع Prisma + Express + React**

---

## 🎯 ما هذا المشروع؟

Dashboard متقدم يعرض جميع بيانات نظام إدارة الأجهزة والفحوصات:
- ✅ ديزاين جميل وحديث (Rubick-style)
- ✅ رسوم بيانية احترافية (Recharts)
- ✅ بيانات حقيقية من Prisma Database
- ✅ إدارة كاملة للمستخدمين والأجهزة والفحوصات
- ✅ أداء سريع وسلس

---

## 📁 هيكل المشروع

```
.
├── dashboard-react/          # Frontend React + Vite
│   ├── src/
│   │   ├── pages/           # الصفحات الرئيسية
│   │   ├── components/      # المكونات المشتركة
│   │   ├── services/        # API service layer
│   │   ├── App.jsx          # التطبيق الرئيسي
│   │   └── index.css        # الأنماط العامة
│   ├── .env.example         # إعدادات البيئة
│   └── package.json
│
├── backend/                 # Backend Express + Prisma
│   ├── server.js            # Server الرئيسي
│   ├── prisma/
│   │   └── schema.prisma   # نموذج البيانات
│   ├── .env                 # متغيرات البيئة
│   └── package.json
│
└── docs/                    # الملفات التوثيقية
    ├── START.md             # ابدأ هنا 🚀
    ├── BACKEND_SETUP.md     # إعداد الـ Backend
    ├── EXPRESS_BACKEND.md   # كود Backend جاهز
    ├── API_RESPONSE_FORMATS.md # صيغ الـ API
    └── DATA_VERIFICATION.md # التحقق من البيانات
```

---

## 🚀 ابدأ بسرعة

### Option 1: استخدم الكود الجاهز (الأسرع)

```bash
# 1. انسخ الكود من EXPRESS_BACKEND.md وأنشئ backend/server.js

# 2. شغّل الـ Backend
cd backend
npm install
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/db" > .env
npm run dev

# 3. في Terminal منفصل، شغّل الـ Frontend
cd dashboard-react
npm install
npm run dev

# 4. افتح http://localhost:5173 في المتصفح
```

### Option 2: اتبع التعليمات الكاملة

اقرأ [START.md](./START.md) للتفاصيل الكاملة.

---

## 📚 الملفات التوثيقية

| الملف | الوصف |
|------|--------|
| **[START.md](./START.md)** | 🚀 ابدأ من هنا - خطوات سريعة |
| **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** | 🔧 إعداد Backend التفصيلي |
| **[EXPRESS_BACKEND.md](./EXPRESS_BACKEND.md)** | 💻 كود Server جاهز للاستخدام |
| **[API_RESPONSE_FORMATS.md](./API_RESPONSE_FORMATS.md)** | 📡 صيغ الـ API والـ Responses |
| **[DATA_VERIFICATION.md](./DATA_VERIFICATION.md)** | ✅ اختبر البيانات والـ endpoints |

---

## 🏗️ البنية التقنية

### Frontend Stack
- **React 18+** - UI Framework
- **Vite** - Build tool سريع
- **Recharts** - رسوم بيانية احترافية
- **CSS3** - Styling مع CSS variables

### Backend Stack
- **Express.js** - REST API framework
- **Prisma ORM** - Database access layer
- **PostgreSQL** - Database (يمكن استخدام أي database يدعمه Prisma)
- **CORS** - Cross-origin requests

### Database Models (Prisma)
- User (المستخدمون)
- Role (الأدوار)
- Device (الأجهزة)
- DeviceType (أنواع الأجهزة)
- Location (الموقع)
- InspectionTask (مهام الفحص)
- Inspection (الفحوصات)
- MaintenanceLog (سجلات الصيانة)
- DeviceMovement (حركة الأجهزة)
- DeviceStatusHistory (سجل حالة الجهاز)
- AuditLog (سجلات التدقيق)

---

## 🎨 الميزات

### 1. Dashboard الرئيسية (Home)
- 📊 KPI Cards مع الأرقام الحية
- 📈 Pie Chart توزيع حالة المهام
- 📉 Area Chart الاتجاهات الأسبوعية
- 📋 Progress Bars توزيع المهام
- 📑 Inspections Table جدول الفحوصات الشهرية

### 2. صفحة الأجهزة (Devices)
- قائمة شاملة لجميع الأجهزة
- معلومات الموقع والنوع
- حالة الجهاز الحالية
- سجل الصيانة

### 3. صفحة الفنيين (Technicians)
- قائمة الفنيين وأدائهم
- عدد المهام المسندة
- معدل الإنجاز
- الفحوصات المكتملة

### 4. صفحة الفحوصات (Inspections)
- جدول شامل للفحوصات
- تفاصيل كل فحص
- الصور المرفقة
- حالة الفحص

### 5. صفحة المهام (Tasks)
- جدول مهام الفحص
- التصفية والبحث
- تحديث الحالة
- إنشاء مهام جديدة

### 6. صفحة الأماكن (Locations)
- قائمة جميع الموقع
- عدد الأجهزة في كل موقع
- معلومات الموقع

### 7. صفحة التحليلات (Analytics)
- إحصائيات متقدمة
- رسوم بيانية متعددة
- تحليل الأداء

---

## 🔌 API Endpoints

### Users
```
GET    /users              → جميع المستخدمين
POST   /users              → إنشاء مستخدم
PATCH  /users/:id          → تعديل مستخدم
DELETE /users/:id          → حذف مستخدم
```

### Devices
```
GET    /devices                      → جميع الأجهزة
GET    /devices/location/:id         → أجهزة الموقع
GET    /devices/type/:id             → أجهزة النوع
POST   /devices                      → إنشاء جهاز
PATCH  /devices/:id                  → تعديل جهاز
DELETE /devices/:id                  → حذف جهاز
```

### Inspections
```
GET    /inspections                  → جميع الفحوصات
GET    /inspections/device/:id       → فحوصات الجهاز
GET    /inspections/technician/:id   → فحوصات الفني
GET    /inspections/task/:id         → فحوصات المهمة
POST   /inspections                  → إنشاء فحص
PATCH  /inspections/:id              → تعديل الفحص
DELETE /inspections/:id              → حذف الفحص
```

### Tasks
```
GET    /inspection-tasks             → جميع المهام
GET    /inspection-tasks/device/:id  → مهام الجهاز
GET    /inspection-tasks/user/:id    → مهام المستخدم
POST   /inspection-tasks             → إنشاء مهمة
PATCH  /inspection-tasks/:id         → تعديل المهمة
DELETE /inspection-tasks/:id         → حذف المهمة
```

### Dashboard
```
GET    /dashboard/summary                    → ملخص الـ Dashboard
GET    /dashboard/technicians-performance    → أداء الفنيين
```

---

## 🔍 الاختبار السريع

### 1. تحقق من أن الـ Backend يعمل:
```bash
curl http://localhost:3000/health
```
يجب أن ترى: `{"status":"OK"}`

### 2. جلب البيانات:
```bash
curl http://localhost:3000/users
curl http://localhost:3000/devices
curl http://localhost:3000/inspections
```

### 3. في Frontend Console (F12):
```javascript
fetch('http://localhost:3000/dashboard/summary')
  .then(r => r.json())
  .then(console.log)
```

---

## 🐛 التصحيح

### ❌ "Connection refused"
✅ تأكد من تشغيل Backend على `localhost:3000`

### ❌ "No data appears"
✅ تحقق من أن قاعدة البيانات تحتوي على بيانات
✅ استخدم Prisma Studio: `npx prisma studio`

### ❌ "CORS error"
✅ تأكد من أن `CORS_ORIGIN` صحيح في `.env`

### ❌ "Module not found"
✅ شغّل `npm install` في Backend و Frontend

---

## 💡 Tips

### إضافة بيانات تجريبية:
```bash
npx prisma db seed
```

### عرض قاعدة البيانات بصرياً:
```bash
npx prisma studio
```

### تصفير قاعدة البيانات:
```bash
npx prisma migrate reset
```

### ديبع الـ Backend:
```bash
DEBUG=* npm run dev
```

---

## 📊 عينة بيانات

```javascript
// إضافة بيانات تجريبية في Prisma Studio أو seed.js

{
  "users": [
    {
      "fullName": "Ahmed Hassan",
      "email": "ahmed@example.com",
      "role": "TECHNICIAN"
    }
  ],
  "devices": [
    {
      "deviceName": "Printer #1",
      "status": "OPERATIONAL",
      "location": "Main Office"
    }
  ],
  "inspections": [
    {
      "issueReason": "Network connectivity",
      "status": "COMPLETED",
      "technician": "Ahmed Hassan"
    }
  ]
}
```

---

## 🚀 الخطوات النهائية

1. ✅ اتبع خطوات [START.md](./START.md)
2. ✅ تحقق من [DATA_VERIFICATION.md](./DATA_VERIFICATION.md)
3. ✅ استخدم [EXPRESS_BACKEND.md](./EXPRESS_BACKEND.md) للكود الجاهز
4. ✅ اقرأ [API_RESPONSE_FORMATS.md](./API_RESPONSE_FORMATS.md) لفهم الـ Responses

---

## 📞 المساعدة

لو واجهت مشكلة:

1. اقرأ [DATA_VERIFICATION.md](./DATA_VERIFICATION.md)
2. افتح DevTools (F12) وتحقق من الـ Console
3. تحقق من الـ Network tab للـ requests
4. استخدم `curl` لاختبار الـ endpoints مباشرة

---

## 📝 الملفات الرئيسية

### Frontend
- [src/services/api.js](./dashboard-react/src/services/api.js) - API service مع جميع الـ endpoints
- [src/App.jsx](./dashboard-react/src/App.jsx) - الـ App الرئيسي
- [src/pages/HomePage.jsx](./dashboard-react/src/pages/HomePage.jsx) - الصفحة الرئيسية
- [src/index.css](./dashboard-react/src/index.css) - الأنماط العامة

### Backend
- [backend/server.js](./EXPRESS_BACKEND.md) - Server جاهز للاستخدام
- [backend/prisma/schema.prisma](./BACKEND_SETUP.md) - نموذج البيانات

---

## ✨ النتيجة النهائية

✅ Dashboard احترافي يعرض:
- 📊 جميع البيانات من Prisma
- 📈 رسوم بيانية جميلة
- 🎨 ديزاين حديث وسهل الاستخدام
- ⚡ أداء سريع جداً
- 🔄 تحديثات فورية

---

**جاهز للبدء؟ اذهب الآن إلى [START.md](./START.md)! 🚀**

---

© 2024 Access Management System - All Rights Reserved
