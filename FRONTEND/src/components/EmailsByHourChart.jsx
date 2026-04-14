import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const hour = parseInt(label);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return (
      <div style={{
        background: "rgba(15,12,41,0.95)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 10,
        padding: "10px 14px"
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
          {displayHour}:00 {ampm}
        </p>
        <p style={{ color: "#6ee7b7", fontWeight: 700 }}>
          {payload[0].value} emails
        </p>
      </div>
    );
  }
  return null;
};

export default function EmailsByHourChart({ data }) {

  if (!data || data.length === 0) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading chart...</p>;
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{ color: "#fff" }}>Emails by Hour</h3>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />

          <XAxis dataKey="_id" />
          <YAxis />

          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={`rgba(16,185,129,${0.3 + (entry.count / maxCount) * 0.7})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}