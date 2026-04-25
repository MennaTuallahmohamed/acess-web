# 📊 التحقق من البيانات - Data Verification Guide

**الهدف:** التأكد من أن جميع البيانات تظهر بشكل صحيح من Prisma إلى Dashboard

---

## 🔍 الخطوات للتحقق

### الخطوة 1: التحقق من الـ API endpoints

```bash
# تحقق من أن البيانات موجودة في الـ Backend

# Users (المستخدمون)
curl http://localhost:3000/users

# Devices (الأجهزة)
curl http://localhost:3000/devices

# Inspections (الفحوصات)
curl http://localhost:3000/inspections

# Tasks (المهام)
curl http://localhost:3000/inspection-tasks

# Dashboard Summary
curl http://localhost:3000/dashboard/summary
```

### الخطوة 2: فتح Developer Tools في Frontend

1. افتح `http://localhost:5173`
2. اضغط **F12** لفتح Developer Tools
3. اذهب إلى **Console** tab
4. انسخ والصق الأكواد التالية:

```javascript
// ✅ اختبر جلب البيانات من الـ API

// 1. Get All Users
fetch('http://localhost:3000/users')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Users Count:', data.length);
    console.table(data.slice(0, 3)); // عرض أول 3 مستخدمين
  })
  .catch(e => console.error('❌ Users Error:', e));

// 2. Get All Devices
fetch('http://localhost:3000/devices')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Devices Count:', data.length);
    console.table(data.slice(0, 3));
  })
  .catch(e => console.error('❌ Devices Error:', e));

// 3. Get All Inspections
fetch('http://localhost:3000/inspections')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Inspections Count:', data.length);
    console.table(data.slice(0, 3));
  })
  .catch(e => console.error('❌ Inspections Error:', e));

// 4. Get Dashboard Summary
fetch('http://localhost:3000/dashboard/summary')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Dashboard Summary:', data);
  })
  .catch(e => console.error('❌ Summary Error:', e));
```

---

## 📋 عناصر يجب أن تظهر في Dashboard

### الصفحة الرئيسية (Home Page)
- ✅ عدد الفنيين (Total Technicians)
- ✅ المهام المكتملة (Completed Tasks)
- ✅ المهام المعلقة (Pending Tasks)
- ✅ الطوارئ النشطة (Active Emergency)
- ✅ عدد الأجهزة (Total Devices)
- ✅ الأجهزة التي تحتاج صيانة (Needs Maintenance)
- ✅ رسم بياني توزيع حالة المهام (Task Status Pie Chart)
- ✅ رسم بياني الاتجاهات الأسبوعية (Weekly Trend Chart)
- ✅ جدول الفحوصات الشهرية (Monthly Inspections Table)

### صفحة الأجهزة (Devices Page)
- ✅ قائمة جميع الأجهزة بتفاصيلها الكاملة
- ✅ حالة كل جهاز (Operational, Maintenance, Out of Service)
- ✅ الموقع الذي يوجد فيه الجهاز
- ✅ نوع الجهاز

### صفحة الفنيين (Technicians Page)
- ✅ قائمة جميع الفنيين
- ✅ عدد المهام المسندة لكل فني
- ✅ الفحوصات المكتملة
- ✅ أداء كل فني

### صفحة الفحوصات (Inspections Page)
- ✅ قائمة جميع الفحوصات
- ✅ تفاصيل كل فحص (الفني، الجهاز، التاريخ، الحالة)
- ✅ الصور المرفقة بالفحص

### صفحة المهام (Tasks Page)
- ✅ قائمة جميع مهام الفحص
- ✅ حالة كل مهمة
- ✅ الأولوية (Priority)
- ✅ الفني المسؤول
- ✅ الجهاز المرتبط

### صفحة الأماكن (Locations Page)
- ✅ قائمة جميع الموقع
- ✅ عدد الأجهزة في كل موقع
- ✅ معلومات الموقع

### صفحة التحليلات (Analytics Page)
- ✅ إحصائيات متقدمة
- ✅ رسوم بيانية توزيع المهام
- ✅ حالة صحة الأجهزة
- ✅ اتجاهات الفحوصات

---

## 🐛 تصحيح الأخطاء

### ❌ مشكلة: "No data appears on dashboard"

**الحل:**

1. **تحقق من الـ Backend يعمل:**
   ```bash
   # في Terminal منفصل
   cd backend
   npm run dev
   ```
   يجب أن ترى: `✅ Backend running on http://localhost:3000`

2. **تحقق من الـ Frontend إعدادات البيئة:**
   ```bash
   # تأكد من وجود .env
   cat .env
   # يجب أن تحتوي على:
   # VITE_API_BASE_URL=http://localhost:3000
   ```

3. **تحقق من قاعدة البيانات تحتوي على بيانات:**
   ```bash
   # استخدم Prisma Studio
   cd backend
   npx prisma studio
   ```
   يجب أن ترى بيانات في جداول Users, Devices, Inspections, etc.

4. **فعّل التوسيع Network في Chrome DevTools:**
   - افتح DevTools → Network tab
   - اعمل Refresh للصفحة
   - يجب أن ترى requests إلى `/users`, `/devices`, `/inspections`, إلخ
   - تحقق من أن جميع الـ requests ترجع Status 200 ✅

### ❌ مشكلة: "CORS Error"

**الحل:**
```javascript
// في backend/server.js
app.use(cors({
  origin: 'http://localhost:5173', // URL Frontend الخاص بك
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### ❌ مشكلة: "Cannot read property 'length' of undefined"

**الحل:**
- تحقق من أن API يرجع array بدلاً من object
- إذا كان الـ API يرجع `{data: [...]}` بدلاً من `[...]`
- عدّل `normalizeList()` في `api.js`

```javascript
const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
};
```

---

## ✅ Checklist للتحقق النهائي

- [ ] الـ Backend يعمل على `localhost:3000`
- [ ] الـ Frontend يعمل على `localhost:5173`
- [ ] `.env` يحتوي على `VITE_API_BASE_URL=http://localhost:3000`
- [ ] قاعدة البيانات تحتوي على بيانات (استخدم Prisma Studio)
- [ ] جميع الـ API endpoints ترجع Status 200
- [ ] Data يظهر في Dashboard (Home page)
- [ ] KPI cards تعرض الأرقام الصحيحة
- [ ] الرسوم البيانية تظهر بشكل صحيح
- [ ] جداول البيانات تملأ بالبيانات الحقيقية
- [ ] لا توجد CORS errors في Console

---

## 📞 الدعم

لو استمرت المشاكل:

1. **اختبر الـ API مباشرة باستخدام Postman**
   - import postman collection
   - اختبر كل endpoint على حدة

2. **شغّل الـ Backend مع logs:**
   ```bash
   DEBUG=* npm run dev
   ```

3. **تحقق من الـ logs في Frontend Console** (F12)

---

✅ **بعد اكمال هذه الخطوات، جميع البيانات ستظهر بنجاح!**
