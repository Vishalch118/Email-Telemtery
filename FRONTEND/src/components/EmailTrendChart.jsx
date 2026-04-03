import { useEffect, useState } from "react";
import {
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { getEmailsPerDay } from "../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(15,12,41,0.95)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 10,
          padding: "10px 14px"
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ color: "#a5b4fc", fontWeight: 700, fontSize: 16 }}>
          {payload[0].value} emails
        </p>
      </div>
    );
  }
  return null;
};

export default function EmailTrendChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEmailsPerDay();

        console.log("Emails per day:", res.data); // debug

        setData(res.data);
      } catch (err) {
        console.error("Error fetching email trend:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 24
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 4,
            height: 20,
            borderRadius: 2,
            background: "linear-gradient(180deg, #6366f1, #8b5cf6)"
          }}
        />
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>
          Emails Per Day
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {data.length > 0 ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

            <XAxis
              dataKey="_id"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#trendGrad)"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        ) : (
          <p style={{ color: "white", textAlign: "center" }}>
            Loading chart...
          </p>
        )}
      </ResponsiveContainer>
    </div>
  );
}