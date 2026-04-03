import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { getEmailsByWeekday } from "../services/api";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(15,12,41,0.95)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 10,
          padding: "10px 14px"
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ color: "#fcd34d", fontWeight: 700, fontSize: 16 }}>
          {payload[0].value} emails
        </p>
      </div>
    );
  }
  return null;
};

export default function EmailsByWeekdayChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEmailsByWeekday();

        console.log("Emails by weekday:", res.data); // debug

        const formatted = res.data.map(item => ({
          day: days[item._id - 1],
          count: item.count
        }));

        setData(formatted);
      } catch (err) {
        console.error("Error fetching weekday data:", err);
      }
    };

    fetchData();
  }, []);

  const maxCount = Math.max(...data.map(d => d.count), 1);

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
            background: "linear-gradient(180deg, #f59e0b, #d97706)"
          }}
        />
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>
          Emails by Weekday
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {data.length > 0 ? (
          <BarChart data={data} barCategoryGap="25%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={`rgba(245, 158, 11, ${
                    0.25 + (entry.count / maxCount) * 0.75
                  })`}
                />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <p style={{ color: "white", textAlign: "center" }}>
            Loading chart...
          </p>
        )}
      </ResponsiveContainer>
    </div>
  );
}