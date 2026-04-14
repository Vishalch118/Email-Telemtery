import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,12,41,0.95)",
        border: "1px solid rgba(6,182,212,0.3)",
        borderRadius: 10,
        padding: "10px 14px"
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
          {label}
        </p>
        <p style={{ color: "#67e8f9", fontWeight: 700 }}>
          {payload[0].value} emails
        </p>
      </div>
    );
  }
  return null;
};

const COLORS = ["#06b6d4", "#0891b2", "#0e7490", "#155e75", "#164e63"];

// Extract display name
function extractName(val) {
  if (!val) return val;

  const nameMatch = val.match(/^(.+?)\s*</);
  if (nameMatch) return nameMatch[1].trim();

  const emailMatch = val.match(/^([^@]+)@/);
  if (emailMatch) return emailMatch[1].trim();

  return val;
}

export default function TopSendersChart({ data }) {

  if (!data || data.length === 0) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading chart...</p>;
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 24
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 4,
          height: 20,
          borderRadius: 2,
          background: "linear-gradient(180deg, #06b6d4, #0891b2)"
        }} />
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>
          Top Senders
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />

          <XAxis type="number" />
          <YAxis
            dataKey="_id"
            type="category"
            width={110}
            tickFormatter={extractName}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}