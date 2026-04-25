// مثال متقدم للرسوم البيانية الاحترافية
// Advanced Charts Examples

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";

/**
 * مثال 1: Scatter Chart - مخطط التشتت
 * يُستخدم لإظهار العلاقة بين متغيرين
 */
export function ScatterChartExample() {
  const data = [
    { x: 10, y: 5, category: "A" },
    { x: 20, y: 15, category: "B" },
    { x: 30, y: 25, category: "C" },
    { x: 40, y: 35, category: "D" },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis dataKey="y" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="Data" data={data} fill="#1f3a93" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/**
 * مثال 2: Stacked Area Chart - رسم بياني للمناطق المكدسة
 * يُستخدم لإظهار كيف يتغير التركيب بمرور الوقت
 */
export function StackedAreaChartExample() {
  const data = [
    { month: "Jan", product1: 2000, product2: 1200, product3: 800 },
    { month: "Feb", product1: 2500, product2: 1400, product3: 900 },
    { month: "Mar", product1: 2200, product2: 1500, product3: 1000 },
    { month: "Apr", product1: 2900, product2: 1600, product3: 1100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="product1" stackId="1" stroke="#1f3a93" fill="#1f3a93" />
        <Area type="monotone" dataKey="product2" stackId="1" stroke="#f97316" fill="#f97316" />
        <Area type="monotone" dataKey="product3" stackId="1" stroke="#10b981" fill="#10b981" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * مثال 3: Multi-Axis Chart - رسم بياني بمحاور متعددة
 * يُستخدم عند المقارنة بين بيانات بمقاييس مختلفة جداً
 */
export function MultiAxisChartExample() {
  const data = [
    { month: "Jan", temperature: 25, humidity: 65, rainfall: 120 },
    { month: "Feb", temperature: 26, humidity: 68, rainfall: 140 },
    { month: "Mar", temperature: 24, humidity: 70, rainfall: 100 },
    { month: "Apr", temperature: 28, humidity: 62, rainfall: 180 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" label={{ value: "Temp (°C)", angle: -90, position: "insideLeft" }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: "Humidity (%)", angle: 90, position: "insideRight" }} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="temperature" fill="#f97316" />
        <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#1f3a93" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/**
 * مثال 4: Custom Label Chart - رسم بياني مع تسميات مخصصة
 * يُستخدم لعرض معلومات إضافية على البيانات
 */
const CustomLabel = (props) => {
  const { x, y, width, height, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 10}
      fill="#1f3a93"
      textAnchor="middle"
      fontSize="12"
      fontWeight="bold"
    >
      {`$${value}`}
    </text>
  );
};

export function CustomLabelChartExample() {
  const data = [
    { name: "A", value: 4000 },
    { name: "B", value: 3000 },
    { name: "C", value: 2000 },
    { name: "D", value: 2780 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#1f3a93" label={<CustomLabel />} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * مثال 5: Animated Chart - رسم بياني متحرك
 * يُستخدم عند تحديث البيانات ديناميكياً
 */
export function AnimatedChartExample() {
  const [data, setData] = React.useState([
    { time: "00:00", value: Math.random() * 100 },
    { time: "01:00", value: Math.random() * 100 },
    { time: "02:00", value: Math.random() * 100 },
    { time: "03:00", value: Math.random() * 100 },
  ]);

  const refreshData = () => {
    setData(
      data.map((item) => ({
        ...item,
        value: Math.random() * 100,
      }))
    );
  };

  return (
    <div>
      <button onClick={refreshData} style={{ marginBottom: "16px", padding: "8px 16px" }}>
        Refresh Data
      </button>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} isAnimationActive={true}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1f3a93"
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * مثال 6: Responsive Chart Layout
 * يُستخدم لعرض رسوم بيانية متجاوبة متعددة
 */
export function ResponsiveChartsLayout() {
  const data1 = [
    { name: "A", value: 400 },
    { name: "B", value: 300 },
    { name: "C", value: 200 },
  ];

  const data2 = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 2000 },
  ];

  return (
    <div className="charts-grid">
      <div className="card">
        <h3>Chart 1: Pie Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data1}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#1f3a93"
              dataKey="value"
            >
              {data1.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#1f3a93", "#f97316", "#10b981"][index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Chart 2: Line Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data2}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// اختبر هذه الأمثلة بإضافتها إلى صفحة جديدة
// أو استخدمها كمرجع لإنشاء رسوم بيانية خاصة بك!
