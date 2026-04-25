# 🚀 Performance & Best Practices - الأداء وأفضل الممارسات

## ⚡ نصائح تحسين الأداء:

### 1. Lazy Loading للرسوم البيانية
```jsx
import { Suspense, lazy } from 'react';

const AnalyticsPage = lazy(() => import('./AnalyticsPage'));

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyticsPage />
    </Suspense>
  );
}
```

### 2. Memoization للرسوم البيانية
```jsx
import { memo } from 'react';

const ChartComponent = memo(({ data }) => {
  return <LineChart data={data} />;
});

export default ChartComponent;
```

### 3. تقليل عدد النقاط في الرسم البياني
```jsx
// بدلاً من 1000 نقطة، استخدم 50
const sampledData = data.filter((_, i) => i % 20 === 0);
```

### 4. استخدام requestAnimationFrame
```jsx
const [data, setData] = useState([]);

useEffect(() => {
  const animate = () => {
    // تحديث البيانات
    requestAnimationFrame(animate);
  };
  animate();
}, []);
```

## 🎯 أفضل الممارسات:

### ✅ افعل:

1. **استخدم ResponsiveContainer**
   ```jsx
   <ResponsiveContainer width="100%" height={300}>
     <LineChart data={data} />
   </ResponsiveContainer>
   ```

2. **وفّر مفاتيح فريدة**
   ```jsx
   {data.map((item, index) => (
     <Cell key={`cell-${index}`} fill={colors[index]} />
   ))}
   ```

3. **استخدم Tooltip مخصص**
   ```jsx
   const CustomTooltip = ({ active, payload }) => {
     if (active) return <div>{payload[0].value}</div>;
   };
   ```

4. **صنّف البيانات قبل العرض**
   ```jsx
   const sortedData = data.sort((a, b) => a.value - b.value);
   ```

5. **استخدم animationDuration مناسب**
   ```jsx
   <Line animationDuration={800} />  // جيد
   <Line animationDuration={200} />  // سريع جداً
   ```

### ❌ تجنب:

1. **لا تستخدم البيانات الضخمة مباشرة**
   ```jsx
   // ❌ سيء
   <LineChart data={10000items} />
   
   // ✅ جيد
   const sampledData = data.slice(0, 100);
   ```

2. **لا تعيد إنشاء البيانات في كل render**
   ```jsx
   // ❌ سيء
   const data = items.map(...);
   
   // ✅ جيد
   const data = useMemo(() => items.map(...), [items]);
   ```

3. **لا تستخدم inline functions للـ onClick**
   ```jsx
   // ❌ سيء
   onClick={() => handleClick(item.id)}
   
   // ✅ جيد
   onClick={handleClick}
   ```

4. **لا تترك الـ console errors**
   ```jsx
   // ✅ تحقق دائماً من البيانات
   if (!data || data.length === 0) {
     return <EmptyState />;
   }
   ```

## 📊 نصائح لمعالجة البيانات الكبيرة:

### 1. Pagination
```jsx
const itemsPerPage = 50;
const currentPage = 1;
const displayedData = data.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

### 2. Filtering
```jsx
const filteredData = data.filter(item => 
  item.value > threshold
);
```

### 3. Aggregation
```jsx
const aggregatedData = data.reduce((acc, item) => {
  const existing = acc.find(a => a.month === item.month);
  if (existing) {
    existing.value += item.value;
  } else {
    acc.push(item);
  }
  return acc;
}, []);
```

### 4. Debouncing
```jsx
import { useMemo } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
```

## 🔄 استراتيجيات التحديث:

### Real-time Updates
```jsx
useEffect(() => {
  const interval = setInterval(() => {
    // جلب البيانات الجديدة
    fetchData();
  }, 5000); // كل 5 ثوان
  
  return () => clearInterval(interval);
}, []);
```

### WebSocket Updates
```jsx
useEffect(() => {
  const ws = new WebSocket('wss://your-api.com');
  
  ws.onmessage = (event) => {
    const newData = JSON.parse(event.data);
    setData(prev => [...prev, newData]);
  };
  
  return () => ws.close();
}, []);
```

## 📈 مثال عملي متكامل:

```jsx
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useState, useEffect, useMemo, useCallback } from 'react';

export function OptimizedChart() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('all');

  // 1. جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    
    // تحديث كل 30 ثانية
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. معالجة البيانات
  const processedData = useMemo(() => {
    let result = data;

    // تطبيق الفلتر
    if (filter !== 'all') {
      result = result.filter(item => item.category === filter);
    }

    // محدود البيانات لأداء أفضل
    if (result.length > 100) {
      result = result.slice(0, 100);
    }

    // ترتيب البيانات
    return result.sort((a, b) => a.date - b.date);
  }, [data, filter]);

  // 3. معالج الحدث
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  // 4. العرض
  if (!processedData.length) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <select value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
        <option value="all">All</option>
        <option value="category1">Category 1</option>
        <option value="category2">Category 2</option>
      </select>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData}>
          <Line type="monotone" dataKey="value" stroke="#1f3a93" isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## 🧪 اختبار الأداء:

### استخدام React DevTools Profiler
```jsx
import { Profiler } from 'react';

<Profiler id="Chart" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}}>
  <MyChart />
</Profiler>
```

### قياس الأداء
```jsx
const measurePerformance = () => {
  const start = performance.now();
  
  // عملية
  const result = data.map(processItem);
  
  const end = performance.now();
  console.log(`Processing took ${end - start}ms`);
};
```

## 📊 معايير الأداء الموصى به:

| المعيار | القيمة |
|--------|--------|
| FCP | < 1.8s |
| LCP | < 2.5s |
| CLS | < 0.1 |
| TTFB | < 0.6s |
| Animation Duration | 200-800ms |
| Max Data Points | 100-500 |

## 🔍 نصائح Debugging:

```jsx
// 1. تسجيل البيانات
console.log('Data:', data);

// 2. استخدام debugger
debugger;

// 3. التحقق من الأنواع
console.assert(Array.isArray(data), 'Data should be an array');

// 4. قياس الوقت
console.time('rendering');
// ... code
console.timeEnd('rendering');
```

## 🎯 قائمة التحقق:

- ✅ البيانات صحيحة الصيغة
- ✅ استخدام ResponsiveContainer
- ✅ Memoization عند الحاجة
- ✅ معالجة الأخطاء
- ✅ اختبار على أحجام مختلفة
- ✅ قياس الأداء
- ✅ تحسين حجم البيانات
- ✅ استخدام Lazy Loading
- ✅ تقليل عدد إعادة الرسم
- ✅ توثيق الكود

---

**تذكر: الأداء الجيدة = تجربة مستخدم أفضل! 🚀**
