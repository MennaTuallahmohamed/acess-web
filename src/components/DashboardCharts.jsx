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
  ComposedChart,
} from "recharts";

// البيانات التجريبية المتقدمة
const revenueData = [
  { month: "January", revenue: 45000, expenses: 28000, profit: 17000 },
  { month: "February", revenue: 52000, expenses: 31000, profit: 21000 },
  { month: "March", revenue: 48000, expenses: 29000, profit: 19000 },
  { month: "April", revenue: 61000, expenses: 35000, profit: 26000 },
  { month: "May", revenue: 55000, expenses: 32000, profit: 23000 },
  { month: "June", revenue: 67000, expenses: 38000, profit: 29000 },
];

const performanceData = [
  { technician: "John", tasks: 45, efficiency: 94 },
  { technician: "Sarah", tasks: 52, efficiency: 97 },
  { technician: "Mike", tasks: 38, efficiency: 89 },
  { technician: "Emma", tasks: 48, efficiency: 95 },
  { technician: "David", tasks: 42, efficiency: 91 },
];

const inspectionData = [
  { week: "Week 1", inspections: 24, passed: 22, failed: 2 },
  { week: "Week 2", inspections: 28, passed: 26, failed: 2 },
  { week: "Week 3", inspections: 31, passed: 29, failed: 2 },
  { week: "Week 4", inspections: 35, passed: 33, failed: 2 },
];

const deviceHealthData = [
  { name: "Operational", value: 156, fill: "#10b981" },
  { name: "Maintenance", value: 42, fill: "#f59e0b" },
  { name: "Out of Service", value: 12, fill: "#ef4444" },
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              margin: "4px 0 0 0",
              color: entry.color,
              fontSize: "12px",
            }}
          >
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ tasks, devices, inspections }) {
  return (
    <>
      {/* Revenue and Expenses */}
      <section className="card">
        <div className="section-head">
          <h2>💰 Revenue Analysis</h2>
          <span className="text-tertiary">6-month trend</span>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart
            data={revenueData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1f3a93" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1f3a93" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--text-tertiary)" />
            <YAxis stroke="var(--text-tertiary)" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1f3a93"
              fill="url(#revenueGradient)"
              yAxisId="left"
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              fill="url(#profitGradient)"
              yAxisId="right"
              animationDuration={800}
            />
            <Bar
              dataKey="expenses"
              fill="#f97316"
              radius={[8, 8, 0, 0]}
              yAxisId="left"
              animationDuration={800}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      {/* Technician Performance */}
      <section className="card">
        <div className="section-head">
          <h2>👷 Technician Performance</h2>
          <span className="text-tertiary">Efficiency metrics</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={performanceData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" stroke="var(--text-tertiary)" />
            <YAxis dataKey="technician" type="category" stroke="var(--text-tertiary)" width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="tasks"
              fill="#3b82f6"
              radius={[0, 8, 8, 0]}
              animationDuration={800}
            />
            <Bar
              dataKey="efficiency"
              fill="#10b981"
              radius={[0, 8, 8, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Inspection Results */}
      <section className="card">
        <div className="section-head">
          <h2>✅ Inspection Results</h2>
          <span className="text-tertiary">Pass/Fail ratio</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={inspectionData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" stroke="var(--text-tertiary)" />
            <YAxis stroke="var(--text-tertiary)" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="passed"
              stroke="#10b981"
              fill="url(#passGradient)"
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="failed"
              stroke="#ef4444"
              fill="url(#failGradient)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Device Health Status */}
      <section className="card">
        <div className="section-head">
          <h2>🔧 Device Health Status</h2>
          <span className="text-tertiary">Current overview</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={deviceHealthData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationDuration={800}
            >
              {deviceHealthData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value} />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* Summary Cards */}
      <section className="card">
        <h2>📊 Summary Metrics</h2>
        <div className="kpi-grid">
          <div className="kpi">
            <span>Total Revenue</span>
            <strong>${revenueData.reduce((a, b) => a + b.revenue, 0).toLocaleString()}</strong>
          </div>
          <div className="kpi">
            <span>Total Tasks</span>
            <strong>{performanceData.reduce((a, b) => a + b.tasks, 0)}</strong>
          </div>
          <div className="kpi">
            <span>Avg Efficiency</span>
            <strong>{Math.round(performanceData.reduce((a, b) => a + b.efficiency, 0) / performanceData.length)}%</strong>
          </div>
          <div className="kpi">
            <span>Inspections</span>
            <strong>{inspectionData.reduce((a, b) => a + b.inspections, 0)}</strong>
          </div>
          <div className="kpi">
            <span>Devices OK</span>
            <strong>{deviceHealthData[0].value}</strong>
          </div>
          <div className="kpi">
            <span>Device Health</span>
            <strong>{Math.round((deviceHealthData[0].value / (deviceHealthData[0].value + deviceHealthData[1].value + deviceHealthData[2].value)) * 100)}%</strong>
          </div>
        </div>
      </section>
    </>
  );
}
