import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const hour = parseInt(label);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return (
      <div style={{ background: "rgba(15,12,41,0.95)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, padding: "10px 14px" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 4 }}>{displayHour}:00 {ampm}</p>
        <p style={{ color: "#6ee7b7", fontWeight: 700, fontSize: 16 }}>{payload[0].value} emails</p>
      </div>
    );
  }
  return null;
};

export default function EmailsByHourChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/analytics/emails-by-hour")
      .then(res => setData(res.data));
  }, []);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: "linear-gradient(180deg, #10b981, #059669)" }} />
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>Emails by Hour</h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="_id" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={`rgba(16, 185, 129, ${0.3 + (entry.count / maxCount) * 0.7})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}