import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,12,41,0.95)",
        border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: 10,
        padding: "10px 14px"
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
        <p style={{ color: "#fcd34d", fontWeight: 700 }}>
          {payload[0].value} emails
        </p>
      </div>
    );
  }
  return null;
};

export default function EmailsByWeekdayChart({ data }) {

  if (!data || data.length === 0) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading chart...</p>;
  }

  // ✅ transform here (no state)
  const formatted = data.map(item => ({
    day: days[item._id - 1],
    count: item.count
  }));

  const maxCount = Math.max(...formatted.map(d => d.count), 1);

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{
        color: "#fff",
        fontSize: 15,
        fontWeight: 700,
        marginBottom: 16
      }}>Emails by Weekday</h3>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={formatted}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />

          <XAxis dataKey="day" />
          <YAxis />

          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="count">
            {formatted.map((entry, index) => (
              <Cell
                key={index}
                fill={`rgba(245,158,11,${0.25 + (entry.count / maxCount) * 0.75})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}